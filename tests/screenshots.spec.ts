import { test } from '@playwright/test';

const PAGES = ['es/', 'en/', 'es/showcase/', 'es/demos/brinco/', 'es/demos/lumbre/', 'es/demos/isola/', 'es/demos/turnio/'];
const SIZES = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const size of SIZES) {
  for (const path of PAGES) {
    test(`screenshot ${size.name} ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const name = path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
      await page.screenshot({ path: `test-results/screenshots/${name}-${size.name}.png`, fullPage: size.name === 'desktop' });
    });
  }
}
