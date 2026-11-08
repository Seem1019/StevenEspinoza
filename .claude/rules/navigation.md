---
paths:
  - "src/**/*.astro"
  - "src/**/*.ts"
---
# Navigation without reloads

- `ClientRouter` is mounted in `src/layouts/BaseLayout.astro`. Do not add per-page routers or `data-astro-reload` except for downloads.
- Every client script: `onPage(() => { …; return cleanup })` from `src/scripts/lifecycle.ts`. Init runs on `astro:page-load`, cleanup on `astro:before-swap`. Abort listeners with an `AbortController`, disconnect observers, cancel rAF/timers, dispose WebGL.
- In-page UI (dialogs, drawers, quick views, cart, filters, checkout, booking, signup) never becomes a route. URL state via `src/scripts/url-state.ts`: `openUi` (history entry; Back closes), `closeUi`, `setParams` (no history: filter values, sort, tabs), `adoptDeepLink` (shared URL opens in that state), `onUrlState` (back/forward). One `sync(url)` function derives the UI from the URL.
- Triggers for in-page UI are `<button type="button">`. `<a href="?x">` would be intercepted by the router as a navigation.
- Internal links: `localePath(lang, 'path/')`, never `target="_blank"`. External links (LinkedIn, GitHub, WhatsApp) may use `target="_blank" rel="noopener noreferrer"`.
- Prefetch: `prefetchAll` + `hover` by default; demo cards / primary CTAs `data-astro-prefetch="viewport"`.
- Long lists: no classic pagination. First batch static, next batches as JSON + IntersectionObserver (rootMargin ≥ 1000px), "load more" after a few auto batches so the footer is reachable.
- Language switch keeps path, query and hash (LangSwitch does it).
- Check with `npm run test:e2e` (asserts that `load` fires once across a full tour).
