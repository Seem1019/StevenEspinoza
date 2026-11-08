---
paths:
  - "src/**/*.astro"
  - "src/**/*.ts"
  - "src/**/*.css"
---
# Performance & Core Web Vitals

Targets (Lighthouse mobile over `npm run preview`, same lab engine as PageSpeed Insights): performance ≥ 90, a11y ≥ 95, best practices ≥ 95, SEO ≥ 95; LCP < 2.5 s, CLS < 0.1, TBT low (INP proxy; field INP target < 200 ms).

- The LCP element of every view (usually the h1/hero text) is in the initial HTML, not lazy, not hidden or faded from `opacity: 0` on load. LCP images: `fetchpriority="high"`, never `loading="lazy"`.
- Only `transform` and `opacity` animate. No animating width/height/top/left/margins.
- Everything that appears later reserves its box: `aspect-ratio`, explicit width/height, same-size skeletons, `contain-intrinsic-size` with `content-visibility: auto`. Toasts, popups, coupon banners, sticky bars = `position: fixed` overlays.
- JS budget: prefer CSS; a page's own script should stay small. Heavy code (three.js, catalog batches) via dynamic `import()`/`fetch` behind IntersectionObserver **and** first user interaction when it's near the fold. Lighthouse never scrolls: nothing heavy may load on an idle, unscrolled page.
- Event handlers: visual feedback synchronously, then `await yieldToMain()` / `requestAnimationFrame` for the rest. No long loops in handlers; batch DOM writes in rAF; render lists from `<template>` clones in chunks.
- Fonts only through the Astro Fonts API; preload only the LCP font of the page.
- No third-party scripts, no render-blocking external CSS.
- Measure with `npm run lighthouse` before declaring a page done; record scores in the phase summary.
