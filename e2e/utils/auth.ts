import { Page } from '@playwright/test';

export async function waitForAuthPageReady(page: Page) {
  await page.waitForURL(/\/login(?:\?.*)?$/, { timeout: 10000 });
  await page.getByRole('heading', { name: /welcome back/i }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Email').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Password').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: /sign in/i }).waitFor({ state: 'visible', timeout: 10000 });
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await waitForAuthPageReady(page);
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('Admin@123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForFunction(() => Boolean(localStorage.getItem('access_token')), null, { timeout: 10000 });
  await page.goto('/admin/dashboard');
}

export async function loginAsSystemAdmin(page: Page) {
  await page.goto('/login');
  await waitForAuthPageReady(page);
  await page.getByLabel('Email').fill('systemadmin@urbannest.com');
  await page.getByLabel('Password').fill('Admin@123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForFunction(() => Boolean(localStorage.getItem('access_token')), null, { timeout: 10000 });
  await page.goto('/system-admin/dashboard');
}

export async function loginAsResident(page: Page) {
  await page.goto('/login');
  await waitForAuthPageReady(page);
  await page.getByLabel('Email').fill('resident@test.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForFunction(() => Boolean(localStorage.getItem('access_token')), null, { timeout: 10000 });
  await page.goto('/resident/dashboard');
}

export async function loginAsSecurity(page: Page) {
  await page.goto('/login');
  await waitForAuthPageReady(page);
  await page.getByLabel('Email').fill('security@test.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForFunction(() => Boolean(localStorage.getItem('access_token')), null, { timeout: 10000 });
  await page.goto('/security/dashboard');
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).first().click();
  await page.waitForURL('/login', { timeout: 5000 });
}
