import { test, expect } from './fixtures';
import { installReloadProbe, docState, expectSameDocument, waitForSoftNav } from './helpers';

const DEMOS = ['brinco', 'lumbre', 'isola', 'turnio'];

test('full tour without a single full reload or new tab', async ({ page, context }) => {
  await installReloadProbe(page);
  let extraPages = 0;
  context.on('page', () => extraPages++);

  await page.goto('es/');
  await page.waitForLoadState('load');
  const { docId } = await docState(page);

  // home → showcase
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Agentes en vivo' }).click();
  await waitForSoftNav(page, /\/es\/showcase\/$/);
  await expect(page.locator('h1')).toBeVisible();
  await expectSameDocument(page, docId);

  // showcase → home (logo)
  await page.locator('.site-header__logo').click();
  await waitForSoftNav(page, /\/es\/$/);

  // home → each demo → back to gallery
  for (const slug of DEMOS) {
    await page.locator(`.card a[href$="/demos/${slug}/"]`).click();
    await waitForSoftNav(page, new RegExp(`/es/demos/${slug}/`));
    await expect(page.locator('main#main')).toBeVisible();
    await expectSameDocument(page, docId);
    await page.locator('.demo-bar__back').click();
    await waitForSoftNav(page, /\/es\/(#demos)?$/);
  }

  // contact dialog: opens in page, URL reflects it, Back closes it without leaving
  await page.locator('.site-header__cta').click();
  await expect(page.locator('#contact-dialog')).toBeVisible();
  expect(page.url()).toContain('contact=1');
  await page.goBack();
  await expect(page.locator('#contact-dialog')).toBeHidden();
  expect(page.url()).not.toContain('contact=1');
  expect(page.url()).toMatch(/\/es\/(#demos)?$/);

  // language switch is a soft navigation
  await page.locator('.site-header a[data-lang-switch][hreflang="en"]').click();
  await waitForSoftNav(page, /\/en\//);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expectSameDocument(page, docId);

  expect(extraPages, 'a new tab/page was opened').toBe(0);
  const s = await docState(page);
  expect(s.pageLoads).toBeGreaterThan(5);
});

test('internal links never open new tabs', async ({ page }) => {
  for (const path of ['es/', 'en/', 'es/showcase/', ...DEMOS.map((d) => `es/demos/${d}/`)]) {
    await page.goto(path);
    const bad = await page.$$eval('a[target="_blank"]', (as) =>
      as.map((a) => (a as HTMLAnchorElement).href).filter((h) => new URL(h).origin === location.origin),
    );
    expect(bad, `internal target=_blank on ${path}`).toEqual([]);
  }
});

test('deep link opens contact dialog and Back closes it', async ({ page }) => {
  await page.goto('es/?contact=1');
  await expect(page.locator('#contact-dialog')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#contact-dialog')).toBeHidden();
  expect(new URL(page.url()).pathname).toMatch(/\/es\/$/);
});

test('gallery details open in a dialog with URL state', async ({ page }) => {
  await installReloadProbe(page);
  await page.goto('es/');
  const { docId } = await docState(page);
  await page.locator('[data-demo-open="lumbre"]').click();
  await expect(page.locator('#demo-dialog')).toBeVisible();
  expect(page.url()).toContain('demo=lumbre');
  await page.goBack();
  await expect(page.locator('#demo-dialog')).toBeHidden();
  await expectSameDocument(page, docId);

  await page.goto('es/?demo=isola');
  await expect(page.locator('[data-demo-detail="isola"]')).toBeVisible();
});

test('every page builds valid internal links (es and en)', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of ['es/', 'en/', 'es/showcase/', 'en/showcase/', ...DEMOS.flatMap((d) => [`es/demos/${d}/`, `en/demos/${d}/`])]) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href).filter((h) => h.startsWith(location.origin)));
    hrefs.forEach((h) => seen.add(h.split('#')[0]));
  }
  for (const href of seen) {
    const r = await request.get(href);
    expect(r.status(), href).toBe(200);
  }
});
