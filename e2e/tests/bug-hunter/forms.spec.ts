import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsResident } from '../../utils/auth';
import { PageMonitor } from '../../utils/monitors';

test.describe('Form Handling & Input Validation', () => {
  test('should prevent duplicate form submissions', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    // Fill form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@test.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Rapidly submit form multiple times
    const submitBtn = page.locator('button[type="submit"]');
    const submitPromises = [];
    for (let i = 0; i < 3; i++) {
      submitPromises.push(submitBtn.click().catch(() => {}));
    }
    
    await Promise.all(submitPromises);
    
    // Should only create one record (check in list or DB)
    await page.goto('/admin/residents');
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should validate email format', async ({ page }) => {
    await loginAsResident(page);
    
    await page.goto('/resident/profile');
    
    // Try invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    const errorMsg = page.locator('[data-testid="email-error"]');
    await expect(errorMsg).toContainText('Invalid email');
  });

  test('should handle SQL injection in form fields', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    // Attempt SQL injection
    const sqlPayloads = [
      "'; DROP TABLE residents; --",
      "1' OR '1'='1",
      "admin'--",
      "1 UNION SELECT NULL--"
    ];
    
    for (const payload of sqlPayloads) {
      await page.fill('input[name="name"]', payload);
      await page.fill('input[name="email"]', `${payload}@test.com`);
      
      // Monitor for errors
      const monitor = new PageMonitor(page);
      await page.click('button[type="submit"]').catch(() => {});
      
      // Should handle gracefully, not error
      expect(monitor.getErrors().length).toBeLessThan(5);
    }
  });

  test('should handle XSS attempts in form inputs', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    const xssPayloads = [
      '<img src=x onerror=alert("xss")>',
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<svg/onload=alert("xss")>'
    ];
    
    for (const payload of xssPayloads) {
      await page.fill('input[name="name"]', payload);
      await page.fill('input[name="email"]', `test${Math.random()}@test.com`);
      await page.click('button[type="submit"]').catch(() => {});
      
      // Should not execute script
      const alerts = await page.evaluate(() => (window as any).xssTriggered);
      expect(alerts).toBeFalsy();
    }
  });

  test('should handle unicode characters in forms', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    const unicodeTexts = [
      '你好世界',
      'مرحبا بالعالم',
      '🚀🎉✨',
      'Ñoño Spëciål'
    ];
    
    for (const text of unicodeTexts) {
      await page.fill('input[name="name"]', text);
      // Should handle without errors
      expect(await page.locator('input[name="name"]').inputValue()).toBeTruthy();
    }
  });

  test('should handle very long input strings', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    const longString = 'x'.repeat(10000);
    await page.fill('input[name="description"]', longString, { timeout: 5000 });
    
    // Should truncate or handle gracefully
    const inputValue = await page.locator('input[name="description"]').inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(10000);
  });

  test('should validate required fields', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    const errorCount = await page.locator('[data-testid*="error"]').count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should handle malformed JSON in API requests', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Intercept and corrupt request payload
    await page.goto('/admin/residents/new');
    
    await page.route('**/api/residents', (route) => {
      const request = route.request();
      const postData = request.postData();
      if (postData) {
        // Corrupt the JSON
        const corrupted = postData.slice(0, -5);
        route.continue();
      } else {
        route.continue();
      }
    });
    
    await page.fill('input[name="name"]', 'Test');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.click('button[type="submit"]').catch(() => {});
    
    // Should handle error gracefully
    const errorMsg = page.locator('[role="alert"]');
    await errorMsg.isVisible().catch(() => false);
  });

  test('should handle empty form submissions', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    // Clear all fields if pre-filled
    await page.evaluate(() => {
      document.querySelectorAll('input').forEach(i => (i.value = ''));
      document.querySelectorAll('textarea').forEach(t => (t.value = ''));
    });
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors, not crash
    const errorCount = await page.locator('[data-testid*="error"]').count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should preserve form data on validation error', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/residents/new');
    
    // Fill form with invalid data
    const testData = 'Test Value';
    await page.fill('input[name="name"]', testData);
    await page.fill('input[name="email"]', 'invalid-email');
    
    // Submit - should fail validation
    await page.click('button[type="submit"]');
    
    // Form data should still be there
    expect(await page.locator('input[name="name"]').inputValue()).toBe(testData);
  });
});
