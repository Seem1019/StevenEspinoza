import { test, expect } from './fixtures';
import { installReloadProbe, docState, expectSameDocument } from './helpers';

test('tesela: case and brief dialogs live in the URL, Back closes them', async ({ page }) => {
  await installReloadProbe(page);
  await page.goto('es/demos/tesela/');
  const { docId } = await docState(page);

  await page.locator('[data-ts-case="rutero"]').click();
  await expect(page.locator('#ts-case')).toBeVisible();
  await expect(page.locator('[data-case-panel="rutero"]')).toBeVisible();
  await expect(page.locator('[data-case-panel="pliego"]')).toBeHidden();
  expect(page.url()).toContain('case=rutero');

  // case → brief replaces the entry: Back returns to the page, not to the case
  await page.locator('[data-case-panel="rutero"] [data-ts-brief-from-case]').click();
  await expect(page.locator('#ts-brief')).toBeVisible();
  await expect(page.locator('#ts-case')).toBeHidden();
  expect(page.url()).toContain('brief=any');
  await page.goBack();
  await expect(page.locator('#ts-brief')).toBeHidden();
  expect(page.url()).not.toMatch(/case=|brief=/);
  await expectSameDocument(page, docId);
});

test('tesela: brief deep link preselects the format and validates', async ({ page }) => {
  await page.goto('en/demos/tesela/?brief=pilot');
  await expect(page.locator('#ts-brief')).toBeVisible();
  await expect(page.locator('#ts-format')).toHaveValue('pilot');
  await page.locator('.ts-form [type=submit]').click();
  await expect(page.locator('#ts-name')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#ts-name').fill('Ana Ruiz');
  await page.locator('#ts-email').fill('ana@example.com');
  await page.locator('.ts-form [type=submit]').click();
  await expect(page.locator('[data-ts-ok-title]')).toHaveText('Thanks, Ana.');
  await page.goBack();
  await expect(page.locator('#ts-brief')).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/en\/demos\/tesela\/$/);
});

test('tesela: theme toggle swaps the tokens and is remembered', async ({ page }) => {
  await page.goto('es/demos/tesela/');
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe('rgb(248, 248, 249)');
  await page.locator('[data-ts-theme]').click();
  expect(await bg()).toBe('rgb(23, 23, 26)');
  await page.reload();
  expect(await bg()).toBe('rgb(23, 23, 26)');
});

test('tesela: looks complete with reduced motion (no scroll-driven state left half-way)', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('es/demos/tesela/');
  await expect(page.locator('#ts-h1')).toBeVisible();
  expect(await page.locator('.ts-hero__frame').isVisible()).toBe(false);
  // operation cards show their finished state (no queued rows)
  await expect(page.locator('.ts-step__media').first()).not.toHaveAttribute('data-op', /.*/);
  await expect(page.locator('.ts-op__d').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBe(0);
  await ctx.close();
});

test('tesela: hero painting loads only after the first scroll; operation cards run in view', async ({ page }) => {
  await page.goto('es/demos/tesela/');
  const paint = page.locator('.ts-hero__paint');
  expect(await paint.getAttribute('src')).toBeNull();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => paint.getAttribute('src')).not.toBeNull();
  await expect.poll(() => paint.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

  const media = page.locator('.ts-step__media').first();
  await expect(media).toHaveAttribute('data-op', 'idle');
  await media.scrollIntoViewIfNeeded();
  await expect(media).toHaveAttribute('data-op', 'run');
  // the last row ends as done (green check visible) after the timed sequence
  await expect.poll(() => media.locator('.ts-op__row').last().locator('.ts-op__check').evaluate((e) => getComputedStyle(e).opacity), { timeout: 8000 }).toBe('1');
});
