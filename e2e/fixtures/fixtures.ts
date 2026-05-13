import { test as base, expect } from '@playwright/test';

type AuthRole = 'system-admin' | 'admin' | 'resident' | 'security';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to app and setup auth context
    await page.goto('/');
    await use(page);
  },
});

export { expect };
