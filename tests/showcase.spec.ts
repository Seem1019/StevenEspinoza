import { test, expect } from './fixtures';

test('showcase builds a demo offline: start, pause, skip to the corrected end, replay', async ({ page, context }) => {
  await page.goto('es/showcase/');
  await page.waitForLoadState('networkidle');
  await context.setOffline(true);

  const root = page.locator('[data-sc-root]');
  await expect(root).toHaveAttribute('data-sc-status', 'idle');
  await page.locator('[data-sc-pick="lumbre"]').click();
  expect(page.url()).toContain('demo=lumbre');

  await page.locator('[data-sc-activate]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'running');
  await expect(page.locator('[data-sc-overlay] .ag-cur.is-on')).toHaveCount(4, { timeout: 3000 });
  await page.waitForTimeout(2500);
  expect(await page.locator('#sc-flow [data-flow-log] li').count()).toBeGreaterThan(0);

  // pause freezes the clock
  await page.locator('[data-sc-pause]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'paused');
  const t1 = await page.locator('[data-sc-time]').textContent();
  await page.waitForTimeout(600);
  await expect(page.locator('[data-sc-time]')).toHaveText(t1 ?? '');
  await page.locator('[data-sc-pause]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'running');

  await page.locator('[data-sc-skip]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'done');
  expect(await page.locator('[data-sc-stage] [data-build-state="hidden"]').count()).toBe(0);
  await expect(page.locator('[data-sc-issues]')).toHaveText('3/3 corregidos');
  await expect(page.locator('[data-sc-overlay] .ag-mark')).toHaveCount(0);
  // the deliberate errors are gone (no inline transforms / swapped text left in the preview)
  expect(await page.locator('[data-sc-stage] [data-ag-xf]').count()).toBe(0);
  await expect(page.locator('[data-sc-stage] .bp-tabs span').nth(1)).toHaveText('Del fuego');

  await page.locator('[data-sc-replay]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'running');
  await expect(page.locator('[data-sc-issues]')).toHaveText('-');
  await context.setOffline(false);
});

test('every demo scene reaches the corrected end', async ({ page }) => {
  for (const slug of ['brinco', 'lumbre', 'isola', 'turnio']) {
    await page.goto(`en/showcase/?demo=${slug}`);
    await page.locator('[data-sc-activate]').click();
    await page.waitForTimeout(800);
    await page.locator('[data-sc-skip]').click();
    await expect(page.locator('[data-sc-root]')).toHaveAttribute('data-sc-status', 'done');
    await expect(page.locator('[data-sc-issues]')).toHaveText(/^(\d)\/\1 fixed$/);
    await expect(page.locator('#sc-flow .ag-node[data-node="qa"]')).toHaveAttribute('data-status', 'done');
  }
});

test('showcase never claims real-time AI generation', async ({ page }) => {
  for (const lang of ['es', 'en']) {
    await page.goto(`${lang}/showcase/`);
    const text = (await page.locator('body').innerText()) + (await page.locator('#sc-data').textContent());
    expect(text).not.toMatch(/\b(IA|AI)\b.{0,40}(tiempo real|real[- ]time|generando|generating|writing)/i);
    await expect(page.locator('.sc-badge')).toBeVisible();
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('showcase shows messages instantly and still finishes', async ({ page }) => {
    await page.goto('es/showcase/?demo=turnio');
    await expect(page.locator('[data-sc-pick="turnio"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-sc-activate]').click();
    await page.waitForTimeout(1500);
    const first = page.locator('#sc-flow [data-flow-log] li').first();
    await expect(first).not.toHaveText('');
    const full = await first.textContent();
    await page.waitForTimeout(300);
    await expect(first).toHaveText(full ?? '');
    await page.locator('[data-sc-skip]').click();
    await expect(page.locator('[data-sc-root]')).toHaveAttribute('data-sc-status', 'done');
  });
});
