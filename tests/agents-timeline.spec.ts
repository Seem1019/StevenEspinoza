import type { Page } from '@playwright/test';
import { test } from './fixtures';

/**
 * Visual walk-through of the agents scenes (home intro + two demos), desktop and mobile, at key moments:
 * start, build with errors visible, QA review, fixes, final. Slow (real time): run on demand with
 *   npm run screenshots:agents
 * Output: test-results/agents/<scene>-<size>-<seconds>s.png
 */
test.use({ intro: true });
test.skip(!process.env.AGENT_SHOTS, 'set AGENT_SHOTS=1 (npm run screenshots:agents)');
test.describe.configure({ mode: 'parallel' });
test.setTimeout(120_000);

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function shotsAt(page: Page, name: string, times: number[], t0: number) {
  for (const s of times) {
    const wait = t0 + s * 1000 - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: `test-results/agents/${name}-${s.toFixed(1).padStart(4, '0')}s.png` });
  }
}

for (const size of SIZES) {
  test(`home intro ${size.name}`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto('es/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `test-results/agents/home-${size.name}-gate.png` });
    await page.locator('[data-intro-start]').click();
    const t0 = Date.now();
    await shotsAt(page, `home-${size.name}`, [0.6, 1.2, 3.5, 6.5, 9, 12.5, 16, 19.5, 21.5, 24, 28, 30, 32.5, 35, 37], t0);
    await page.waitForSelector('html:not([data-intro])', { timeout: 15_000 });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `test-results/agents/home-${size.name}-final.png` });
  });

  for (const slug of ['brinco', 'lumbre']) {
    test(`showcase ${slug} ${size.name}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(`es/showcase/?demo=${slug}`, { waitUntil: 'networkidle' });
      await page.locator('[data-sc-root]').scrollIntoViewIfNeeded();
      if (size.name === 'mobile') await page.locator('[data-sc-activate]').scrollIntoViewIfNeeded();
      await page.locator('[data-sc-activate]').click();
      if (size.name === 'desktop') await page.evaluate(() => window.scrollTo(0, document.querySelector('.sc-grid')!.getBoundingClientRect().top + scrollY - 150));
      const t0 = Date.now();
      await shotsAt(page, `${slug}-${size.name}`, [3, 7, 11, 15, 19, 21.5, 23.5, 25.5, 28, 30, 33, 35.5], t0);
      await page.waitForSelector('[data-sc-status="done"]', { timeout: 15_000 });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `test-results/agents/${slug}-${size.name}-final.png`, fullPage: size.name === 'mobile' });
    });
  }
}
