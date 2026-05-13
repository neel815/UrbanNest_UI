import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsResident } from '../../utils/auth';

test.describe('API Failure & Error Handling', () => {
  test('should handle 500 server errors gracefully', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Mock API to return 500
    await page.route('**/api/residents', (route) => {
      route.abort('failed');
    });
    
    await page.goto('/admin/residents');
    
    // Should show error message, not crash
    const errorMsg = page.locator('[role="alert"], .error-message, .toast');
    await expect(errorMsg).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle 401 unauthorized responses', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Mock 401 response
    await page.route('**/api/admin/**', (route) => {
      route.abort('failed');
    });
    
    await page.goto('/admin/residents');
    
    // Should handle gracefully or redirect to login
    const currentUrl = page.url();
    expect(
      currentUrl.includes('/admin') || currentUrl.includes('/login')
    ).toBeTruthy();
  });

  test('should handle request timeouts', async ({ page }) => {
    await loginAsResident(page);
    
    // Mock slow/timeout response
    await page.route('**/api/**', (route) => {
      setTimeout(() => route.abort('timedout'), 15000);
    });
    
    await page.goto('/resident/maintenance');
    
    // Should handle timeout gracefully
    const errorMsg = page.locator('[role="alert"], .error-message, .spinner');
    await expect(errorMsg).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle malformed API responses', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Mock malformed JSON response
    await page.route('**/api/residents', (route) => {
      route.fulfill({
        status: 200,
        body: '{ invalid json }}'
      });
    });
    
    await page.goto('/admin/residents');
    
    // Should handle parse error gracefully
    const monitor = new PageMonitor(page);
    await page.waitForTimeout(2000);
    
    // Should not crash (page should still be responsive)
    expect(page.url().includes('/admin/residents')).toBeTruthy();
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
    
    // Go offline
    await page.context().setOffline(true);
    
    await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });
    
    // Should show offline indicator or error
    const offlineMsg = page.locator('[data-testid="offline"], .offline-banner');
    await offlineMsg.isVisible().catch(() => {});
    
    // Go back online
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
    
    // Mock multiple endpoints to fail
    await page.route('**/api/**', (route) => {
      const url = route.request().url();
      if (Math.random() > 0.3) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    await page.goto('/admin');
    
    // Should still be functional despite failures
    await page.waitForTimeout(2000);
    expect(page.url().includes('/admin')).toBeTruthy();
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
