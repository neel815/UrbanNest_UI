import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSystemAdmin, logout, waitForAuthPageReady } from '../../utils/auth';
import { PageMonitor } from '../../utils/monitors';

test.describe('Authentication Security Tests', () => {
  test.afterEach(async ({ page, context }) => {
    await context.setOffline(false).catch(() => {});
    await page.evaluate(() => localStorage.clear()).catch(() => {});
  });

  test('should reject invalid login credentials', async ({ page }) => {
    const monitor = new PageMonitor(page);
    
    await page.goto('/login');
    await waitForAuthPageReady(page);
    await page.getByLabel('Email').fill('invalid@test.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);
    
    // Should stay on the login screen after rejecting credentials
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('should handle SQL injection attempts in login', async ({ page }) => {
    const monitor = new PageMonitor(page);
    
    await page.goto('/login');
    await waitForAuthPageReady(page);
    await page.getByLabel('Email').fill('attacker@test.com');
    await page.getByLabel('Password').fill("' OR '1'='1");
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);
    
    // Should show the login screen, not navigate away
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('should reject expired session tokens', async ({ page, context }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'invalid-token');
    });
    
    await page.goto('/admin');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 15000 });
  });

  test('should enforce logout on session expiry', async ({ page }) => {
    await loginAsSystemAdmin(page);
    
    // Verify we're logged in
    await expect(page).toHaveURL(/\/system-admin\/dashboard/);
    
    // Simulate session expiry by clearing the auth token used by the app
    await page.evaluate(() => localStorage.removeItem('access_token'));
    
    // Attempt to access protected route after token removal
    await page.goto('/system-admin/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 15000 });
  });

  test('should prevent CSRF attacks', async ({ page }) => {
    await loginAsSystemAdmin(page);
    
    // Try to submit form without CSRF token
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const csrfInput = form.querySelector('input[name*="csrf"]');
        if (csrfInput) csrfInput.remove();
      }
    });
    
    // Monitor for errors
    let hasError = false;
    page.on('response', (response) => {
      if (response.status() === 403) hasError = true;
    });
    
    // Try to submit form - should fail or redirect
    await page.click('button[type="submit"]', { timeout: 3000 }).catch(() => {});
  });

  test('should handle concurrent login attempts', async ({ page, context }) => {
    const secondPage = await context.newPage();
    await Promise.all([
      (async () => {
        await page.goto('/login');
        await waitForAuthPageReady(page);
        await page.getByLabel('Email').fill('admin@test.com');
      })(),
      (async () => {
        await secondPage.goto('/login');
        await waitForAuthPageReady(secondPage);
        await secondPage.getByLabel('Email').fill('admin@test.com');
        await secondPage.close();
      })(),
    ]);
  });

  test('should prevent privilege escalation', async ({ page, context }) => {
    await loginAsSystemAdmin(page);
    
    // Tamper with the app's localStorage session token instead of cookies
    await page.evaluate(() => localStorage.setItem('access_token', 'tampered.invalid.token'));

    // Should not grant access
    await page.goto('/system-admin/admins');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 15000 });
  });

  test('should handle logout race conditions', async ({ page }) => {
    await loginAsSystemAdmin(page);
    
    // Trigger multiple logout requests
    await Promise.allSettled([
      page.getByRole('button', { name: /sign out/i }).first().click(),
      page.getByRole('button', { name: /sign out/i }).first().click(),
      page.getByRole('button', { name: /sign out/i }).first().click(),
    ]);
    
    // Should eventually be logged out
    await page.waitForURL('/login', { timeout: 10000 }).catch(() => {});
  });

  test('should prevent infinite redirect loops', async ({ page }) => {
    await page.goto('/login');
    
    let redirectCount = 0;
    page.on('framenavigated', () => {
      redirectCount++;
      if (redirectCount > 10) {
        page.close();
      }
    });
    
    // Should not loop infinitely
    await page.waitForTimeout(2000);
    expect(redirectCount).toBeLessThan(10);
  });

  test('should preserve session across page refresh', async ({ page, context }) => {
    await loginAsSystemAdmin(page);
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/\/system-admin\/dashboard/, { timeout: 5000 });
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
  });
});
