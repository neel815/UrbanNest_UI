import { Page } from '@playwright/test';

export async function waitForAuthPageReady(page: Page) {
  await page.waitForURL(/\/login(?:\?.*)?$/, { timeout: 10000 });
  await page.getByRole('heading', { name: /welcome back/i }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Email').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Password').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: /sign in/i }).waitFor({ state: 'visible', timeout: 10000 });
}

async function submitLogin(page: Page, email: string, password: string, rolePath: string) {
  await page.goto('/login');
  await waitForAuthPageReady(page);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST'),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);

  await page.waitForLoadState('domcontentloaded');
  await page.goto(rolePath, { waitUntil: 'domcontentloaded' });
  await page.locator('main').first().waitFor({ state: 'visible', timeout: 15000 });
}

export async function loginAsAdmin(page: Page) {
  await submitLogin(page, 'admin@test.com', 'Admin@123', '/admin/dashboard');
}

export async function loginAsSystemAdmin(page: Page) {
  await submitLogin(page, 'systemadmin@urbannest.com', 'Admin@123', '/system-admin/dashboard');
}

export async function loginAsResident(page: Page) {
  await submitLogin(page, 'resident@test.com', 'password123', '/resident/dashboard');
}

export async function loginAsSecurity(page: Page) {
  await submitLogin(page, 'security@test.com', 'password123', '/security/dashboard');
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).first().click();
  await page.waitForURL(/\/login(?:\?.*)?$/, { timeout: 5000 });
}
