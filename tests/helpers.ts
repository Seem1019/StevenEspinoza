import { expect, type Page } from '@playwright/test';

/**
 * Marks the current document. A full reload creates a new document and loses the marker;
 * ClientRouter soft navigations keep it. Also counts `load` events and astro:page-load events.
 */
export async function installReloadProbe(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __loads: number; __pageLoads: number; __docId: string };
    w.__loads = 0;
    w.__pageLoads = 0;
    w.__docId = Math.random().toString(36).slice(2);
    addEventListener('load', () => w.__loads++);
    document.addEventListener('astro:page-load', () => w.__pageLoads++);
  });
}

export async function docState(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __loads: number; __pageLoads: number; __docId: string };
    return { loads: w.__loads, pageLoads: w.__pageLoads, docId: w.__docId };
  });
}

/** Asserts we are still in the same document (no full reload happened). */
export async function expectSameDocument(page: Page, docId: string) {
  const s = await docState(page);
  expect(s.docId, 'a full page reload happened').toBe(docId);
  expect(s.loads, 'load event fired more than once').toBe(1);
}

export async function waitForSoftNav(page: Page, urlPart: string | RegExp) {
  await page.waitForURL(urlPart);
  await page.waitForFunction(() => document.readyState === 'complete');
  await page.waitForTimeout(150);
}
