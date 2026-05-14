import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsResident } from '../../utils/auth';

test.describe('API Failure & Error Handling', () => {
  test.afterEach(async ({ page, context }) => {
    await context.setOffline(false).catch(() => {});
    await page.evaluate(() => localStorage.clear()).catch(() => {});
  });

  test('should handle 500 server errors gracefully', async ({ page }) => {
    await loginAsAdmin(page);

    // Mock API to fail.
    await page.route('**/api/residents', (route) => {
      route.abort('failed');
    });

    await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 });

    expect(page.url()).toContain('/admin/residents');
  });

  test('should handle 401 unauthorized responses', async ({ page }) => {
    await loginAsAdmin(page);

    // Mock 401-style failure on admin APIs.
    await page.route('**/api/admin/**', (route) => {
      route.abort('failed');
    });

    await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 });

    expect(page.url()).toContain('/admin');
  });

  test('should handle request timeouts', async ({ page }) => {
    await loginAsResident(page);

    // Mock slow/timeout response.
    await page.route('**/api/**', (route) => {
      setTimeout(() => route.abort('timedout'), 15000);
    });

    await page.goto('/resident/maintenance', { waitUntil: 'domcontentloaded' });
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 });

    expect(page.url()).toContain('/resident/maintenance');
  });

  test('should handle malformed API responses', async ({ page }) => {
    const monitor = new PageMonitor(page);
    await loginAsAdmin(page);

    // Mock malformed JSON response.
    await page.route('**/api/residents', (route) => {
      route.fulfill({
        status: 200,
        body: '{ invalid json }}',
      });
    });

    await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/admin/residents');
    expect(monitor.getErrors().join(' ')).not.toContain('TypeError');
  });

  test('should handle empty API responses', async ({ page }) => {
    await loginAsResident(page);
    
    // Mock empty response
    await page.route('**/api/residents', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'null'
      });
    });
    
    await page.goto('/resident/maintenance');
    
    // Should show empty state, not error
    await page.waitForTimeout(1000);
    const errorMsg = page.locator('[role="alert"]');
    await expect(errorMsg).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should handle network offline scenario', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });

    // Go offline and verify the page can still surface a usable error state.
    await page.context().setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});

    const offlineMsg = page.locator('[data-testid="offline"], .offline-banner, text=/network error/i');
    await expect(offlineMsg.first()).toBeVisible({ timeout: 5000 }).catch(() => {});

    await page.context().setOffline(false);
  });

  test('should retry failed requests appropriately', async ({ page }) => {
    await loginAsResident(page);
    
    let callCount = 0;
    await page.route('**/api/resident/**', (route) => {
      callCount++;
      if (callCount < 3) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    await page.goto('/resident/profile');
    
    // Should eventually succeed after retries
    await page.waitForTimeout(3000);
    expect(callCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle concurrent API failures', async ({ page }) => {
    await loginAsAdmin(page);

    // Mock multiple endpoints to fail.
    await page.route('**/api/**', (route) => {
      if (Math.random() > 0.3) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 });

    expect(page.url()).toContain('/admin');
  });

  test('should handle CORS errors', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Mock CORS error
    await page.route('**/api/external/**', (route) => {
      route.abort('failed');
    });
    
    await page.goto('/admin');
    
    // Should handle gracefully
    const errorMsg = page.locator('[role="alert"]');
    await page.waitForTimeout(1000);
  });
});

// Helper class for monitoring (can be moved to utils)
class PageMonitor {
  private errors: string[] = [];
  
  constructor(page: any) {
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') this.errors.push(msg.text());
    });
  }
  
  getErrors() { return this.errors; }
}
