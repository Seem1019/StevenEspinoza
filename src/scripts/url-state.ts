/**
 * UI state in the URL (dialogs, drawers, filters, chosen demo) WITHOUT fighting ClientRouter.
 *
 * Problem: Astro's router handles every `popstate` whose state is non-null. For an entry on the
 * same path without hash it performs a full fetch + swap -> the "back" button would re-render
 * the page instead of closing the dialog.
 *
 * Solution:
 *  - `openUi()` pushes an entry that copies Astro's state (keeps its `index`) and adds `ui: true`.
 *  - A capture-phase `popstate` listener (runs before Astro's) intercepts pops where either the
 *    entry we leave or the entry we land on is a UI entry on the same pathname, stops propagation
 *    and notifies subscribers with the new URL. Real navigations fall through to Astro.
 *  - `setParams({ replace: true })` for state that should not create history (filter values, sort).
 *
 * Subscribers re-read the URL and open/close accordingly (single source of truth = URL).
 */
type Listener = (url: URL) => void;
const listeners = new Set<Listener>();
let pagePath = typeof location !== 'undefined' ? location.pathname : '/';
let onUiEntry = false;

const isUiState = (s: unknown) => !!s && typeof s === 'object' && (s as { ui?: boolean }).ui === true;

if (typeof window !== 'undefined') {
  onUiEntry = isUiState(history.state);
  /**
   * Called by the inline listener in BaseLayout <head>, which is registered before Astro's router
   * (window listeners run in registration order). Returning true stops the router's handler.
   */
  (window as unknown as { __uiPopHandler: (ev: PopStateEvent) => boolean }).__uiPopHandler = (ev) => {
    const landingIsUi = isUiState(ev.state);
    const sameDoc = location.pathname === pagePath;
    const handled = sameDoc && (landingIsUi || onUiEntry);
    onUiEntry = landingIsUi;
    if (handled) {
      const url = new URL(location.href);
      listeners.forEach((fn) => fn(url));
    }
    return handled;
  };
  document.addEventListener('astro:page-load', () => {
    pagePath = location.pathname;
    onUiEntry = isUiState(history.state);
  });
}

/** Subscribe to UI-state changes caused by back/forward. Returns unsubscribe (call it in cleanup). */
export function onUrlState(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function buildUrl(params: Record<string, string | null | undefined>): URL {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  return url;
}

/** Push a UI entry (dialog/drawer opened). "Back" will pop it and notify subscribers. */
export function openUi(params: Record<string, string | null | undefined>): void {
  const url = buildUrl(params);
  if (url.href === location.href) return;
  history.pushState({ ...(history.state ?? {}), ui: true }, '', url);
  onUiEntry = true;
}

/**
 * Close a UI entry. If we are on a UI entry we go back (so history doesn't grow);
 * otherwise (deep link) just replace the URL.
 */
export function closeUi(params: Record<string, string | null | undefined>): void {
  if (onUiEntry) {
    history.back();
    return;
  }
  history.replaceState(history.state, '', buildUrl(params));
}

/** Change params without creating history (filters, sort, search, chosen demo). */
export function setParams(params: Record<string, string | null | undefined>): void {
  history.replaceState(history.state, '', buildUrl(params));
}

/**
 * Deep link support: when a page loads with UI params already present (e.g. ?product=42),
 * rewrite history as [page without params] -> [page with params] so "back" closes the UI
 * instead of leaving the site.
 */
export function adoptDeepLink(keys: string[]): void {
  const url = new URL(location.href);
  if (!keys.some((k) => url.searchParams.has(k)) || onUiEntry) return;
  const clean = new URL(url);
  keys.forEach((k) => clean.searchParams.delete(k));
  history.replaceState({ ...(history.state ?? {}), ui: false }, '', clean);
  history.pushState({ ...(history.state ?? {}), ui: true }, '', url);
  onUiEntry = true;
}

export const getParam = (k: string) => new URL(location.href).searchParams.get(k);
