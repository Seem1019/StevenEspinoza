---
name: no-reload-navigation
description: Navigation-without-reloads patterns for this Astro portfolio (ClientRouter lifecycle, prefetch, dialogs/drawers with state in the URL and Back to close, infinite catalog without pagination) plus the PageSpeed checklist every new page must pass. Use when adding pages, scripts, dialogs, drawers, filters, lists or links.
---

# No-reload navigation

The site must feel like an app in a live meeting: no full reloads, no blank screens, no new tabs, no classic pagination — while every view keeps its own indexable, shareable URL.

## 1. Soft navigation (ClientRouter)
- Mounted once in `BaseLayout`. Prefetch: `prefetchAll` + `hover`; add `data-astro-prefetch="viewport"` to demo cards and main CTAs.
- **Scripts run once per document.** Always:
  ```ts
  import { onPage } from '~/scripts/lifecycle';
  onPage(() => {
    const el = document.querySelector('[data-x]');
    if (!el) return;                       // not on this page
    const ac = new AbortController();
    el.addEventListener('click', onClick, { signal: ac.signal });
    const io = new IntersectionObserver(cb);
    return () => { ac.abort(); io.disconnect(); };  // runs on astro:before-swap
  });
  ```
- Never put DOM code at module top level. Never keep references to elements across navigations.
- Need state across pages (e.g. a cart)? `localStorage` (try/catch) or `transition:persist` on an island.

## 2. In-page UI with URL state
Dialogs, drawers, quick view, cart, filters, checkout, reservation, signup: never a route. Use `src/scripts/url-state.ts`:

```ts
import { openUi, closeUi, setParams, adoptDeepLink, onUrlState } from '~/scripts/url-state';
onPage(() => {
  const dlg = document.querySelector<HTMLDialogElement>('#quick-view');
  if (!dlg) return;
  const ac = new AbortController();
  const sync = (url: URL) => {                       // single source of truth = URL
    const id = url.searchParams.get('product');
    if (id) { render(id); if (!dlg.open) dlg.showModal(); }
    else if (dlg.open) dlg.close();
  };
  grid.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-qv]');
    if (!b) return;
    openUi({ product: b.dataset.qv });               // push entry → Back closes
    sync(new URL(location.href));
  }, { signal: ac.signal });
  dlg.addEventListener('close', () => {
    if (new URL(location.href).searchParams.has('product')) closeUi({ product: null });
  }, { signal: ac.signal });
  const off = onUrlState(sync);
  adoptDeepLink(['product']);                        // shared URL opens it; Back closes
  sync(new URL(location.href));
  return () => { ac.abort(); off(); };
});
```
- Filter **values**, sort, search, tabs, billing period → `setParams()` (replaceState, no history spam). Opening a filter **panel** → `openUi()`.
- Triggers are `<button type="button">`. Never `<a href="?x">` (the router navigates).
- Why the helper exists: Astro's router handles any same-path `popstate` with state as a navigation (fetch + swap). `url-state.ts` marks UI entries (`ui: true`, Astro's `index` preserved). Window listeners run in registration order, so the interception lives in an inline script in `BaseLayout` `<head>` placed before `<ClientRouter />`, which calls `window.__uiPopHandler` from `url-state.ts` and stops the router's handler.

## 3. Long lists (catalog) without pagination
- First batch (≈24 items) rendered in static HTML → good LCP and SEO.
- Next batches: static JSON endpoints (`src/pages/[lang]/…/catalog/[batch].json.ts`) fetched by an IntersectionObserver sentinel with `rootMargin: '1200px 0px'`.
- Render from `<template>` clones, append in rAF chunks; items have fixed `aspect-ratio` and fixed text heights, `content-visibility: auto; contain-intrinsic-size: auto 360px`.
- **Reserve the boxes of every batch that will auto-load** with "ghost" items (clones of a real item, same height, `inert`, `aria-hidden`) and make incoming items *replace* ghosts in place. Otherwise a fast scroll reaches the footer before the batch and the batch pushes it (measured CLS 0.69 → 0.01 in Brinco). Reference: `syncGhosts` in `src/demos/brinco/client/app.ts`.
- After N auto batches (≈5) show a "Load more" button → the footer stays reachable. Or keep the footer outside the infinite flow.
- Filters/sort/search on the client over a compact index JSON loaded lazily (first interaction or idle).

## 4. Links
- Internal: `localePath(lang, 'path/')`, no `target="_blank"`. External (LinkedIn, GitHub, WhatsApp): `target="_blank" rel="noopener noreferrer"`.
- Downloads (vCard): `download` + `data-astro-reload`.

## 5. PageSpeed checklist for any new page
- [ ] LCP element in initial HTML, not lazy, not faded in; LCP image `fetchpriority="high"`; only the LCP font preloaded.
- [ ] CLS: every late element reserves space; overlays are `position: fixed`.
- [ ] TBT/INP: no heavy JS on an idle unscrolled page (Lighthouse doesn't scroll); handlers yield after feedback.
- [ ] Images: `astro:assets` AVIF/WebP with `widths`/`sizes`, or SVG; below-the-fold lazy.
- [ ] `prefers-reduced-motion` respected.
- [ ] Unique `<title>` + meta description from i18n; one `h1`; hreflang via BaseLayout.
- [ ] `npm run test:e2e` (load fires once, Back closes UI, deep links open state) and `npm run lighthouse` meet targets: perf ≥ 90, a11y/BP/SEO ≥ 95, LCP < 2.5 s, CLS < 0.1.
