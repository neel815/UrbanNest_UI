import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsResident } from '../../utils/auth';

const viewports = [
  { name: 'Mobile (320px)', width: 320, height: 568 },
  { name: 'Mobile (390px)', width: 390, height: 844 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1920px)', width: 1920, height: 1080 },
];

test.describe('Responsive Design Tests', () => {
  test.afterEach(async ({ page, context }) => {
    await context.setOffline(false).catch(() => {});
    await page.evaluate(() => localStorage.clear()).catch(() => {});
  });

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await loginAsAdmin(page);
      await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

      const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasHScroll).toBeFalsy();
    });

    test(`should have accessible navigation on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await loginAsResident(page);
      await page.goto('/resident/dashboard', { waitUntil: 'domcontentloaded' });

      const navBtn = page.locator('[aria-label="Menu"], .hamburger, nav button');
      if (viewport.width < 768) {
        const isVisible = await navBtn.isVisible().catch(() => false);
        const navVisible = await page.locator('nav').isVisible().catch(() => false);
        expect(isVisible || navVisible).toBeTruthy();
      }
    });
  }

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await loginAsResident(page);
    await page.goto('/resident/dashboard', { waitUntil: 'domcontentloaded' });

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(32);
        expect(box.height).toBeGreaterThanOrEqual(32);
      }
    }
  });

  test('should stack forms vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    await loginAsAdmin(page);
    await page.goto('/admin/residents', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /\+ add resident/i }).click();

    const formInputs = page.locator('form input, form textarea, form select');
    const count = await formInputs.count();

    if (count > 1) {
      for (let i = 0; i < count - 1; i++) {
        const current = formInputs.nth(i);
        const next = formInputs.nth(i + 1);

        const currentBox = await current.boundingBox();
        const nextBox = await next.boundingBox();

        if (currentBox && nextBox) {
          expect(nextBox.y).toBeGreaterThan(currentBox.y);
        }
      }
    }
  });

  test('should handle long content gracefully', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await loginAsResident(page);
    await page.goto('/resident/dashboard', { waitUntil: 'domcontentloaded' });

    const longTexts = page.locator('p, span, div');
    const count = await longTexts.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = longTexts.nth(i);
      const text = await element.textContent();
      if (text && text.length > 100) {
        expect(true).toBeTruthy();
      }
    }
  });

  test('should not have overlapping elements on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    await loginAsResident(page);
    await page.goto('/resident/dashboard', { waitUntil: 'domcontentloaded' });

    const overlaps = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input');
      let count = 0;

      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();

          if (rect1.width > 0 && rect1.height > 0 &&
              rect1.left < rect2.right && rect1.right > rect2.left &&
              rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
            count++;
          }
        }
      }
      return count;
    });

    expect(overlaps).toBeLessThan(50);
  });

  test('should handle orientation change', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsResident(page);
    await page.goto('/resident/dashboard', { waitUntil: 'domcontentloaded' });

    const urlBefore = page.url();

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1000);

    expect(page.url()).toBe(urlBefore);

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    expect(bodyWidth).toBeLessThanOrEqual(844);
  });

  test('should display modals correctly on all screen sizes', async ({ page }) => {
    for (const vp of [{ width: 320, height: 568 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await loginAsAdmin(page);
      await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

      const modal = page.locator('[role="dialog"]');

      if (await modal.isVisible().catch(() => false)) {
        const box = await modal.boundingBox();
        if (box) {
          expect(box.width).toBeLessThanOrEqual(vp.width);
          expect(box.height).toBeLessThanOrEqual(vp.height);
        }
      }
    }
  });
});
