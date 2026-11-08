import { test as base, expect } from '@playwright/test';

/**
 * Shared `test`: by default every page starts as a visitor who already saw the home intro
 * (sessionStorage flag), so specs that are not about the intro land on the plain home.
 * Opt in with `test.use({ intro: true })`.
 */
export const test = base.extend<{ intro: boolean }>({
  intro: [false, { option: true }],
  page: async ({ page, intro }, use) => {
    if (!intro) await page.addInitScript(() => { try { sessionStorage.setItem('se-intro', '1'); } catch { /* ignore */ } });
    await use(page);
  },
});
export { expect };
