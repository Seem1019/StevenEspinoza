import { test, expect } from './fixtures';

test.use({ intro: true });

test('first visit: gate → agents build the real home → skip leaves the final home', async ({ page }) => {
  await page.goto('es/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-intro', 'gate');
  // content is in the initial HTML even while the gate is up (indexable)
  await expect(page.locator('h1.hero__title')).toHaveText(/Webs que convencen/);
  await expect(page.locator('[data-intro-start]')).toBeVisible();

  await page.locator('[data-intro-start]').click();
  await expect(html).toHaveAttribute('data-intro', 'build');
  await expect(page.locator('#intro-flow')).toBeVisible();
  await expect(page.locator('.ag-cur.is-on')).toHaveCount(4, { timeout: 3000 });
  await expect(page.locator('#intro-flow [data-flow-log] li').first()).not.toBeEmpty();

  // during the build some things are deliberately wrong (oversized headline)
  await page.waitForTimeout(9000);
  await expect(page.locator('h1.hero__title')).toHaveAttribute('style', /scale/);

  await page.locator('[data-intro-panel-skip]').click();
  await expect(html).not.toHaveAttribute('data-intro');
  await expect(page.locator('.ag-mark')).toHaveCount(0);
  expect(await page.locator('h1.hero__title').getAttribute('style')).toBeNull();
  await expect(page.locator('h1.hero__title')).toHaveText(/Webs que convencen/);
  await expect(page.locator('.site-header__nav a').nth(1)).toHaveText('Agentes en vivo');
  await expect(page.locator('.hero__metrics dd').first()).toHaveText('≥ 90');
  await expect(page.locator('[data-intro-replay]')).toBeVisible();

  // second visit in the session: no gate, replay available
  await page.reload();
  await expect(html).not.toHaveAttribute('data-intro');
  await expect(page.locator('[data-intro-replay]')).toBeVisible();

  // replay runs again from a clean state, Esc skips it
  await page.locator('[data-intro-replay]').click();
  await expect(html).toHaveAttribute('data-intro', 'build');
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');
  await expect(html).not.toHaveAttribute('data-intro');
  await expect(page.locator('h1.hero__title')).toBeVisible();
});

test('gate skip link shows the site directly', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'gate');
  await page.locator('[data-intro-skip]').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-intro');
  await expect(page.locator('h1.hero__title')).toBeVisible();
  await expect(page.locator('.site-header__nav a').nth(1)).toHaveText('Live agents');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no gate, final home straight away', async ({ page }) => {
    await page.goto('es/');
    await expect(page.locator('html')).not.toHaveAttribute('data-intro');
    await expect(page.locator('h1.hero__title')).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('final home is visible', async ({ page }) => {
    await page.goto('es/');
    await expect(page.locator('h1.hero__title')).toBeVisible();
    await expect(page.locator('[data-intro-start]')).toBeHidden();
  });
});
