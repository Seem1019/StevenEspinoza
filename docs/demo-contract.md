# Demo contract

Everything a demo must follow. Referenced by CLAUDE.md and the `new-client-demo` skill.

## Files a demo owns (and nothing else)
- `src/demos/<slug>/**` — `DESIGN.md`, components, data, styles, client scripts, `BuildPreview.astro`, `showcase/timeline.ts`
- `src/pages/[lang]/demos/<slug>/**` — the page and any static JSON endpoints
- `src/i18n/es/<slug>.json`, `src/i18n/en/<slug>.json`
- `public/demos/<slug>/**` (only if needed: SVG sprites, etc.)

Shared files (layouts, `src/components/site/*`, `src/scripts/*`, config) are changed only on purpose, never as a side effect of a demo.

## Page
`src/pages/[lang]/demos/<slug>/index.astro`:
- `export const getStaticPaths = langPaths;` and `const lang = Astro.params.lang as Lang`.
- `<BaseLayout lang title description fonts={[...]} preload={[LCP font only]} bodyClass="<slug>" themeColor>` — the demo defines its tokens on `.<slug>`.
- First child `<DemoBar lang={lang} />`, then `<main id="main">`. One `h1`.

## i18n
- All visible text in `src/i18n/{es,en}/<slug>.json` with identical keys (the build throws otherwise). `const t = useT(lang, '<slug>')`, `t.raw<T>(key)` for arrays/objects.
- Required keys: `meta.name`, `meta.title`, `meta.tagline` (one line, gallery card), `meta.description` (2 sentences, SEO + gallery dialog), `meta.features` (3–4 short strings), `showcase.logs.*`.
- No lorem ipsum. Sample data that could be mistaken for real (testimonials, stats, ratings, client logos) is labelled as sample data.

## Navigation (no reloads)
- ClientRouter is on. Client code = bundled `<script>` using `onPage(() => { ...; return cleanup })` from `src/scripts/lifecycle.ts`. Never touch the DOM at module top level. Cleanup aborts listeners (AbortController), disconnects observers, cancels rAF/timers, disposes WebGL.
- Cart, quick view, filters, checkout, reservation, signup… open **in the page** (`<dialog>` + `showModal()`, drawers, expanding sections).
- URL reflects UI state through `src/scripts/url-state.ts`:
  - `openUi({ k: v })` when opening (pushes a history entry; Back closes it)
  - `closeUi({ k: null })` when closing
  - `setParams({...})` for values that must not create history (filter values, sort, search, tabs, billing period)
  - `adoptDeepLink([keys])` on init so a shared URL opens in that state and Back closes it
  - `onUrlState(sync)` for back/forward; derive UI from the URL in one `sync(url)` function
  - Reference implementation: `src/components/site/ContactDialog.astro`
- UI triggers are `<button type="button">`, never `<a href="?x">` (ClientRouter would navigate).
- Internal links never use `target="_blank"`; build them with `localePath(lang, 'path/')`. External links may.
- `<button data-open-contact>` anywhere opens Steven's contact dialog.

## Performance (Lighthouse mobile: perf ≥ 90, a11y/BP/SEO ≥ 95; LCP < 2.5 s, CLS < 0.1, low TBT)
- Minimal JS; CSS first. The LCP element (usually the `h1`/hero text) is in the initial HTML, never lazy, never animated from `opacity: 0` on load. LCP images get `fetchpriority="high"`.
- Animate only `transform` and `opacity`. Reserve space for anything that arrives later (aspect-ratio, fixed heights, same-size skeletons). Popups, toasts and coupon banners are overlays (`position: fixed`) and never push content.
- Scroll-driven animations: see `.claude/skills/scroll-animation-patterns`. Default style = final state; animation inside `@supports (animation-timeline: view())` + `@media (prefers-reduced-motion: no-preference)`; `animation-timeline` after the `animation` shorthand.
- INP < 200 ms: visual feedback first (toggle a class), heavy work after `requestAnimationFrame` / `yieldToMain()`.
- `prefers-reduced-motion` respected everywhere (3D, transitions, gamification).
- Heavy islands (3D, catalog batches) load on demand: dynamic `import()` behind IntersectionObserver and/or first interaction. Never the LCP.
- No photos of real people or brands. Inline SVG / CSS illustrations or SVG in `public/demos/<slug>/`. Raster images go through `astro:assets` (`<Image>`/`<Picture>`, avif/webp, responsive widths) with credits in `docs/credits.md`.

## Accessibility
Landmarks, one `h1`, labelled controls, visible focus, AA contrast (4.5:1 text), touch targets ≥ 44 px, labelled dialogs, full keyboard support, `aria-live` for cart/toast updates.

## Design
- Write `src/demos/<slug>/DESIGN.md` first (Stitch format: YAML tokens + Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Motion, Components, Do's and Don'ts, Responsive Behavior, Agent Prompt Guide).
- Must look made for its industry and different from the other demos.
- Avoid: cream/off-white backgrounds, italic highlighted words in headlines, numbered section labels (01/02/03), monospace labels, pill-shaped buttons, purple-blue gradients, glassmorphism everywhere, emoji icons, lorem ipsum.
- Invented brand, logo and products. Never names, logos or brand colours of real companies.
- Works at 390 px and 1440 px with no horizontal scroll.

## Showcase contract ("agentes en vivo")
- `src/demos/<slug>/BuildPreview.astro` — props `{ lang }`. Static miniature (no JS, no network, scoped styles) of the demo's key sections, designed at **1280 px wide**, ~1400–2200 px tall. 8–14 parts marked `data-build="<id>"`. Outside the showcase it shows its final look and is also the gallery thumbnail (top 1280×800 must look great). Animations for the `motion` state live under `[data-build-state="motion"] …` (CSS only, reduced-motion aware). States are defined in `src/styles/build-states.css` and keep the box size (zero CLS).
- `src/demos/<slug>/showcase/timeline.ts` — default export `Timeline` (`src/showcase/types.ts`), ~20 000 ms, 24–40 steps, agents `design | frontend | copy | qa`:
  1. 0–6 s: design + frontend → every part `skeleton` (big blocks first, then nested)
  2. 6–14 s: copy + frontend → `content`
  3. 14–18 s: frontend → `motion` for animated parts
  4. 18–20 s: qa logs checks (contrast, CLS, LCP, keyboard)
- Logs: short, technical, believable (`grid 4 col · gap 16 · aspect 1/1`, `LCP: h1.hero (text)`). It is a scripted simulation: **never** claim real-time AI generation.
- Register the demo in `src/showcase/registry.ts` (timeline + preview component) — done by whoever integrates.
