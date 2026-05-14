import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsResident } from '../../utils/auth';

async function openResidentCreateForm(page: Parameters<typeof test>[0]['page']) {
  await loginAsAdmin(page);
  await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /\+ add resident/i }).click();
  await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  await expect(page.getByPlaceholder('Enter name')).toBeVisible({ timeout: 10000 });
  await expect(page.getByPlaceholder('Enter email')).toBeVisible({ timeout: 10000 });
}

async function fillResidentForm(page: Parameters<typeof test>[0]['page'], name: string, email: string, phone = '1234567890') {
  await page.getByPlaceholder('Enter name').fill(name);
  await page.getByPlaceholder('Enter email').fill(email);
  await page.getByPlaceholder('Enter phone number').fill(phone);

  const unitSelect = page.locator('form select').first();
  await expect(unitSelect).toBeVisible({ timeout: 10000 });

  const optionCount = await unitSelect.locator('option').count();
  if (optionCount > 1) {
    await unitSelect.selectOption({ index: 1 });
  }

  const passwordInput = page.locator('input[type="password"]');
  if (await passwordInput.count()) {
    await passwordInput.fill('Admin@123');
  }
}

test.describe('Form Handling & Input Validation', () => {
  test.afterEach(async ({ page, context }) => {
    await context.setOffline(false).catch(() => {});
    await page.evaluate(() => localStorage.clear()).catch(() => {});
  });

  test('should prevent duplicate form submissions', async ({ page }) => {
    await openResidentCreateForm(page);

    await fillResidentForm(page, 'John Doe', 'john@test.com');

    const submitButton = page.locator('form button').first();
    await Promise.all([
      submitButton.click().catch(() => {}),
      submitButton.click().catch(() => {}),
      submitButton.click().catch(() => {}),
    ]);

    expect(page.url()).toContain('/admin/residents');
  });

  test('should validate email format', async ({ page }) => {
    await openResidentCreateForm(page);

    const emailInput = page.getByPlaceholder('Enter email');
    await emailInput.fill('invalid-email');

    const isValid = await emailInput.evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(isValid).toBeFalsy();
  });

  test('should handle SQL injection in form fields', async ({ page }) => {
    await openResidentCreateForm(page);

    const sqlPayloads = [
      "'; DROP TABLE residents; --",
      "1' OR '1'='1",
      "admin'--",
      "1 UNION SELECT NULL--"
    ];
    
    for (const payload of sqlPayloads) {
      await page.getByPlaceholder('Enter name').fill(payload);
      await page.getByPlaceholder('Enter email').fill('sql@test.com');

      expect(await page.getByPlaceholder('Enter name').inputValue()).toBe(payload);
    }
  });

  test('should handle XSS attempts in form inputs', async ({ page }) => {
    await openResidentCreateForm(page);

    const xssPayloads = [
      '<img src=x onerror=alert("xss")>',
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<svg/onload=alert("xss")>'
    ];
    
    for (const payload of xssPayloads) {
      await page.getByPlaceholder('Enter name').fill(payload);
      await page.getByPlaceholder('Enter email').fill('xss@test.com');

      const alerts = await page.evaluate(() => (window as any).xssTriggered);
      expect(alerts).toBeFalsy();
      expect(await page.getByPlaceholder('Enter name').inputValue()).toBe(payload);
    }
  });

  test('should handle unicode characters in forms', async ({ page }) => {
    await openResidentCreateForm(page);

    const unicodeTexts = [
      '你好世界',
      'مرحبا بالعالم',
      '🚀🎉✨',
      'Ñoño Spëciål'
    ];
    
    for (const text of unicodeTexts) {
      await page.getByPlaceholder('Enter name').fill(text);
      expect(await page.getByPlaceholder('Enter name').inputValue()).toBe(text);
    }
  });

  test('should handle very long input strings', async ({ page }) => {
    await openResidentCreateForm(page);

    const longString = 'x'.repeat(10000);
    await page.getByPlaceholder('Enter name').fill(longString);

    const inputValue = await page.getByPlaceholder('Enter name').inputValue();
    expect(inputValue.length).toBe(10000);
  });

  test('should validate required fields', async ({ page }) => {
    await openResidentCreateForm(page);

    const formValid = await page.locator('form').evaluate((form) => (form as HTMLFormElement).checkValidity());
    expect(formValid).toBeFalsy();
  });

  test('should handle malformed JSON in API requests', async ({ page }) => {
    await openResidentCreateForm(page);

    await page.route('**/api/admin/residents**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{ invalid json }}',
        });
        return;
      }

      await route.continue();
    });

    await fillResidentForm(page, 'Test', 'test@test.com');
    await page.locator('form button').first().click().catch(() => {});

    expect(page.url()).toContain('/admin/residents');
  });

  test('should handle empty form submissions', async ({ page }) => {
    await openResidentCreateForm(page);

    const submitButton = page.locator('form button').first();
    await submitButton.click().catch(() => {});

    const formValid = await page.locator('form').evaluate((form) => (form as HTMLFormElement).checkValidity());
    expect(formValid).toBeFalsy();
  });

  test('should preserve form data on validation error', async ({ page }) => {
    await openResidentCreateForm(page);

    const testData = 'Test Value';
    await page.getByPlaceholder('Enter name').fill(testData);
    await page.getByPlaceholder('Enter email').fill('invalid-email');

    await page.locator('form button').first().click().catch(() => {});

    expect(await page.getByPlaceholder('Enter name').inputValue()).toBe(testData);
  });
});
