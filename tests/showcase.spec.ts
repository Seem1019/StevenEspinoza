import { test, expect } from '@playwright/test';

test('showcase builds a demo offline, with skip and replay', async ({ page, context }) => {
  await page.goto('es/showcase/');
  await page.waitForLoadState('networkidle');
  await context.setOffline(true);

  const root = page.locator('[data-sc-root]');
  await expect(root).toHaveAttribute('data-sc-status', 'idle');
  await page.locator('[data-sc-pick="lumbre"]').click();
  expect(page.url()).toContain('demo=lumbre');

  await page.locator('[data-sc-activate]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'running');
  await page.waitForTimeout(2500);
  const logs = await page.locator('[data-sc-log] li').count();
  expect(logs).toBeGreaterThan(0);

  await page.locator('[data-sc-skip]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'done');
  const hidden = await page.locator('[data-sc-stage] [data-build-state="hidden"]').count();
  expect(hidden).toBe(0);

  await page.locator('[data-sc-replay]').click();
  await expect(root).toHaveAttribute('data-sc-status', 'running');
  await context.setOffline(false);
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
  test('showcase shows logs instantly (no typing effect)', async ({ page }) => {
    await page.goto('es/showcase/?demo=turnio');
    await expect(page.locator('[data-sc-pick="turnio"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-sc-activate]').click();
    await page.waitForTimeout(400);
    const first = page.locator('[data-sc-log] li').first();
    await expect(first).not.toHaveText('');
    const full = await first.textContent();
    await page.waitForTimeout(300);
    await expect(first).toHaveText(full ?? '');
  });
});
