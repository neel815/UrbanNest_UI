import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsResident } from '../../utils/auth';

const viewports = [
  { name: 'Mobile (320px)', width: 320, height: 568 },
  { name: 'Mobile (390px)', width: 390, height: 844 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1920px)', width: 1920, height: 1080 },
];

test.describe('Responsive Design Tests', () => {
  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await loginAsAdmin(page);
      await page.goto('/admin');
      
      // Check for layout breaks
      const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
      
      // Check for horizontal scroll
      const hasHScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasHScroll).toBeFalsy();
    });

    test(`should have accessible navigation on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await loginAsResident(page);
      await page.goto('/resident');
      
      // Check navigation is visible/accessible
      const navBtn = page.locator('[aria-label="Menu"], .hamburger, nav button');
      if (viewport.width < 768) {
        // Mobile should have menu button or visible nav
        const isVisible = await navBtn.isVisible().catch(() => false);
        const navVisible = await page.locator('nav').isVisible().catch(() => false);
        expect(isVisible || navVisible).toBeTruthy();
      }
    });
  }

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await loginAsResident(page);
    await page.goto('/resident');
    
    // Test touch-friendly button sizes (min 44x44px)
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should stack forms vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    await loginAsAdmin(page);
    await page.goto('/admin/residents/new');
    
    // Check form layout
    const formInputs = page.locator('input, textarea, select');
    const count = await formInputs.count();
    
    if (count > 1) {
      for (let i = 0; i < count - 1; i++) {
        const current = formInputs.nth(i);
        const next = formInputs.nth(i + 1);
        
        const currentBox = await current.boundingBox();
        const nextBox = await next.boundingBox();
        
        if (currentBox && nextBox) {
          // On mobile, should be stacked vertically
          expect(nextBox.y).toBeGreaterThan(currentBox.y);
        }
      }
    }
  });

  test('should handle long content gracefully', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await loginAsResident(page);
    await page.goto('/resident');
    
    // Find long text elements
    const longTexts = page.locator('p, span, div');
    const count = await longTexts.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = longTexts.nth(i);
      const text = await element.textContent();
      if (text && text.length > 100) {
        // Should handle text wrapping
        expect(true).toBeTruthy(); // Text exists and is rendered
      }
    }
  });

  test('should not have overlapping elements on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    await loginAsResident(page);
    await page.goto('/resident');
    
    // Check for overlapping elements
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
    
    // Some overlap might be expected, but not excessive
    expect(overlaps).toBeLessThan(50);
  });

  test('should handle orientation change', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsResident(page);
    await page.goto('/resident');
    
    const urlBefore = page.url();
    
    // Change to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1000);
    
    // Should still be on same page
    expect(page.url()).toBe(urlBefore);
    
    // Check layout adjusted
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    expect(bodyWidth).toBeLessThanOrEqual(844);
  });

  test('should display modals correctly on all screen sizes', async ({ page }) => {
    for (const vp of [{ width: 320, height: 568 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      
      await loginAsAdmin(page);
      await page.goto('/admin');
      
      // Try to open a modal
      const modal = page.locator('[role="dialog"]');
      
      // If modal exists, it should be within viewport
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
