/**
 * Page lifecycle for ClientRouter (soft navigation).
 *
 * Bundled <script> modules run ONCE per full document load, not per navigation.
 * Every script that touches the DOM must use `onPage`:
 *   - init runs on `astro:page-load` (first load and every soft navigation)
 *   - the returned cleanup runs on `astro:before-swap` (remove listeners, observers, timers, rAF)
 *
 * onPage(() => {
 *   const el = document.querySelector('[data-thing]');
 *   if (!el) return;                    // this page doesn't have it
 *   const ac = new AbortController();
 *   el.addEventListener('click', fn, { signal: ac.signal });
 *   return () => ac.abort();
 * });
 */
type Cleanup = void | (() => void);

export function onPage(init: () => Cleanup): void {
  let cleanup: Cleanup;
  const run = () => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = init();
  };
  document.addEventListener('astro:page-load', run);
  document.addEventListener('astro:before-swap', () => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = undefined;
  });
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Yield to the main thread so the browser can paint feedback first (INP). */
export function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((r) => setTimeout(r, 0));
}
