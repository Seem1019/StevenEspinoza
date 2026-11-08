import { test, expect, type Page } from '@playwright/test';
import { installReloadProbe, docState, expectSameDocument } from './helpers';

const PAGE = 'es/demos/brinco/';

async function quiet(page: Page) {
  // Suppress the timed prize wheel and social toasts so they don't intercept clicks.
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('brinco:wheel-seen', '1');
      sessionStorage.setItem('brinco:toasts', 'off');
    } catch {}
  });
}

async function measureCls(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

test('infinite catalog loads batches without layout shift, footer stays reachable', async ({ page }) => {
  await quiet(page);
  await measureCls(page);
  await installReloadProbe(page);
  await page.goto(PAGE);
  const { docId } = await docState(page);
  const grid = page.locator('[data-grid] > li:not([data-ghost])');
  await expect(grid).toHaveCount(24);

  const more = page.locator('[data-more]');
  for (let i = 0; i < 40 && !(await more.isVisible()); i++) {
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(250);
  }
  await expect(more).toBeVisible();
  const auto = await grid.count();
  expect(auto).toBeGreaterThan(24);

  // "Load more" until the whole catalog is in, then the footer must be reachable.
  for (let i = 0; i < 12 && (await more.isVisible()); i++) {
    await more.click();
    await page.waitForTimeout(400);
    await page.mouse.wheel(0, 3000);
  }
  await expect(grid).toHaveCount(240);
  await page.locator('footer.b-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('footer.b-footer')).toBeInViewport();

  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS while loading batches').toBeLessThan(0.1);
  await expectSameDocument(page, docId);
});

test('filters run on the client, update the URL and open from a shared URL', async ({ page }) => {
  await quiet(page);
  await installReloadProbe(page);
  await page.goto(PAGE);
  const { docId } = await docState(page);
  const chip = page.locator('.b-catalog [data-cat]:not([data-cat=""])').first();
  const cat = await chip.getAttribute('data-cat');
  await chip.click();
  await expect(page).toHaveURL(new RegExp(`cat=${cat}`));
  await expect(page.locator('[data-grid] > li:not([data-ghost])').first()).toBeVisible();
  await expectSameDocument(page, docId);

  await page.goto(`${PAGE}?cat=${cat}`);
  await expect(page.locator(`.b-catalog [data-cat="${cat}"]`).first()).toHaveAttribute('aria-pressed', 'true');
});

test('quick view and cart are dialogs with URL state; Back closes them', async ({ page }) => {
  await quiet(page);
  await installReloadProbe(page);
  await page.goto(PAGE);
  const { docId } = await docState(page);

  await page.locator('[data-grid] [data-quick]').first().click();
  await expect(page.locator('#b-qv')).toBeVisible();
  expect(page.url()).toMatch(/product=/);
  await page.goBack();
  await expect(page.locator('#b-qv')).toBeHidden();
  expect(page.url()).not.toMatch(/product=/);

  await page.locator('[data-grid] [data-add]').first().click();
  await page.locator('[data-open-cart]').first().click();
  await expect(page.locator('#b-cart')).toBeVisible();
  expect(page.url()).toMatch(/cart=/);
  await page.goBack();
  await expect(page.locator('#b-cart')).toBeHidden();
  await expectSameDocument(page, docId);
});

test('a shared product URL opens the quick view directly', async ({ page }) => {
  await quiet(page);
  await page.goto(`${PAGE}?product=42`);
  await expect(page.locator('#b-qv')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#b-qv')).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/demos\/brinco\/$/);
});
