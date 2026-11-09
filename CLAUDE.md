# Steven Espinoza — portfolio

## Start here
Current state, pending work and known pitfalls (update it at the end of every session):
@docs/HANDOFF.md

Steven's sales portfolio: a site he opens **live in client meetings** (laptop or phone) to show what he can build for online stores, restaurants, premium brands and SaaS/service companies. Every demo must convince in the first 10 seconds. Three kinds of "fast" are non-negotiable: fast to build, fast to load (PageSpeed Insights mobile), and smooth to use (no visible reloads, blank screens, new tabs or classic pagination).

## Stack
- Astro 7 static output → GitHub Pages via GitHub Actions. Minimal JS; islands/scripts only where there is interaction.
- `ClientRouter` (View Transitions) for soft navigation + Astro prefetch. Decision and reasons: `docs/decisions.md`.
- i18n: native Astro i18n, routes `/es/…` and `/en/…` (same path segments in both languages), helpers in `src/i18n/index.ts`.
- Fonts: Astro Fonts API (Fontsource provider, self-hosted, latin subset, `swap`). Each page loads only its fonts; only the LCP font is preloaded.
- 3D: three.js (procedural model, dynamic import). Tests: Playwright (system Chrome, `channel: 'chrome'`). Audits: Lighthouse 13.

## Commands
| Command | What |
|---|---|
| `npm run dev` | dev server at http://localhost:4321/steven-espinoza/ |
| `npm run build` | static build to `dist/` (fails on i18n key mismatch) |
| `npm run preview` | serve `dist/` at :4321 |
| `npm run test:e2e` | Playwright: navigation without reloads, URL state, catalog, QR/vCard, showcase (needs `npm run build` first; starts preview itself) |
| `npm run screenshots` | 390px + 1440px screenshots of home and every demo into `test-results/screenshots/` |
| `npm run screenshots:agents` | timed captures of the home intro and two showcase scenes (desktop + mobile) into `test-results/agents/` (~1.5 min) |
| `npm run lighthouse` | Lighthouse mobile over `npm run preview` for home, showcase and every demo → `reports/lighthouse/summary.md` |
| `npm run psi -- <url>` | PageSpeed Insights API (public URLs only, after deploy) |
| deploy | push to `main` → `.github/workflows/deploy.yml` (needs Pages enabled with source "GitHub Actions") |

Install with `npm ci --ignore-scripts` (nothing needs install scripts; Playwright uses the system Chrome).

## Structure
```
src/
  data/profile.ts        ← Steven's data. ONLY place for contact info. Missing data = TODO_* markers
  data/demos.ts          ← demo registry (gallery + showcase picker)
  i18n/index.ts          ← useT(lang, ns), localePath, switchLangPath, langPaths
  i18n/<lang>/<ns>.json  ← ALL visible text. ns: common, home, showcase, <demo slug>
  layouts/BaseLayout.astro   ← head, SEO, hreflang, fonts, ClientRouter, global contact dialog
  components/site/       ← portfolio chrome: SiteHeader, SiteFooter, LangSwitch, ContactDialog (QR+vCard), DemoBar, DemoThumb
  scripts/lifecycle.ts   ← onPage(init→cleanup), yieldToMain, prefersReducedMotion
  scripts/url-state.ts   ← openUi / closeUi / setParams / adoptDeepLink / onUrlState
  showcase/              ← agents engine: types.ts (scene contract), engine.ts, flow.ts, intro.ts (home), scenes/home.ts, registry.ts
  styles/global.css      ← reset + brand tokens (.brand); build-states.css (showcase)
  demos/<slug>/          ← one folder per demo: DESIGN.md, components, data, BuildPreview.astro, showcase/timeline.ts
  pages/[lang]/index.astro, showcase/, demos/<slug>/
  pages/index.astro      ← "/" → language redirect; pages/steven-espinoza.vcf.ts ← vCard endpoint
docs/ research.md, decisions.md, demo-contract.md, credits.md
tests/ Playwright specs · scripts/ lighthouse.mjs, psi.mjs
```
Demos: `brinco` (discount e-commerce), `lumbre` (restaurant scroll-world), `isola` (premium 3D headphones), `turnio` (SaaS landing), `tesela` (AI product studio, editorial; business services).

## Conventions
- **Text**: never hard-code visible text in components. `const t = useT(lang, 'ns')`; arrays/objects with `t.raw<T>()`. es and en must have identical keys (build throws).
- **Links**: internal URLs only through `localePath(lang, 'path/')` (adds base + locale + trailing slash). Assets/endpoints: `baseUrl('file')`.
- **Data**: contact info only from `src/data/profile.ts`. Never invent data: leave `TODO_*`.
- **Demos**: everything for a demo lives in its folder + its page folder + its i18n ns. Contract: `docs/demo-contract.md`. New demo: skill `new-client-demo`.
- **Design**: the global `DESIGN.md` governs the portfolio chrome; `src/demos/<slug>/DESIGN.md` governs each demo. Read the relevant one before touching UI. Third-party `landing-page-design` skill: use its strategy/copy part; its visual rules lose to our DESIGN.md files.

## Navigation without reloads (core requirement)
- `ClientRouter` is in `BaseLayout`. Bundled `<script>` modules run **once per document**, not per navigation. **Every script must initialise on `astro:page-load` and clean up on `astro:before-swap`** — use `onPage()` from `src/scripts/lifecycle.ts`. Never touch the DOM at module top level; never assume a listener added on a previous page is gone. This is the most common bug with this approach.
- Prefetch: `prefetchAll` with `hover`; demo cards and main CTAs add `data-astro-prefetch="viewport"`.
- In-page UI (contact, demo details, quick view, cart, filters, checkout, reservation, signup) = `<dialog>`/drawers, never a route. State in the URL with `src/scripts/url-state.ts` (`openUi` pushes a history entry so **Back closes it**; `setParams` for non-history values; `adoptDeepLink` so a shared URL opens in that state). Why it exists: Astro's router turns any same-path `popstate` with state into a fetch+swap. Window listeners fire in **registration order** (capture or not), so an inline classic script in `BaseLayout` `<head>` — before `<ClientRouter />` — registers the `popstate` listener first and delegates to `window.__uiPopHandler` (set by `url-state.ts`). Don't move or remove it.
- UI triggers are `<button>`, not `<a href="?…">`. Internal links never `target="_blank"`; only external (LinkedIn, GitHub, WhatsApp).
- Catalog: first batch in static HTML, rest as JSON fragments + IntersectionObserver (big rootMargin), `content-visibility: auto`, "load more" button after a few batches so the footer is reachable.
- Details and checklist: skill `no-reload-navigation`.

## Performance rules (PageSpeed / Core Web Vitals)
- Targets (Lighthouse mobile on `npm run preview`): performance ≥ 90, accessibility ≥ 95, best practices ≥ 95, SEO ≥ 95; LCP < 2.5 s, CLS < 0.1, low TBT (INP proxy). Do not move to the next demo while one fails. Fix causes; never hide content to score.
- LCP element in initial HTML, never lazy, never faded in from 0 on load; LCP image → `fetchpriority="high"`.
- Animate only `transform`/`opacity`. Reserve space for anything late (aspect-ratio, skeletons). Popups/toasts/banners are overlays.
- Scroll-driven animations in CSS first, with fallback: skill `scroll-animation-patterns`.
- Handlers: feedback first, heavy work after `requestAnimationFrame`/`yieldToMain()` (INP < 200 ms).
- Heavy things on demand: three.js, catalog batches, below-the-fold images, islands (`client:visible`/`client:idle` or dynamic import behind IntersectionObserver + first interaction).
- `prefers-reduced-motion` everywhere: view transitions, 3D, scroll animations, showcase.
- Images via `astro:assets` (AVIF/WebP, responsive) or SVG. No render-blocking third-party scripts.

## Rules
Detailed, path-scoped rules live in `.claude/rules/`: performance, navigation, accessibility, i18n, no-real-brands. Summary of the brand rule: demo brands, logos and products are invented; never names, logos or brand colours of real companies (Temu, Shein, Apple, Sony…), no photos of real people.

Design anti-patterns to avoid (all pages): cream/off-white backgrounds, italic highlighted words in headlines, numbered section labels "01/02/03", monospace labels, pill buttons, purple-blue gradients, glassmorphism everywhere, emoji icons, lorem ipsum.

## Agents engine: home intro + "agentes en vivo"
One engine (`src/showcase/engine.ts`) plays **scenes** (`src/showcase/types.ts`): time-sorted events that drive named cursors (Figma-style), the orchestrator flow (`AgentFlow.astro` + `flow.ts`), the message log and the page, with deliberate errors that QA flags and the owner fixes. Scenes: `src/showcase/scenes/home.ts` (builds the real home in place; controller `intro.ts`) and `src/demos/<slug>/showcase/timeline.ts` (inside the simulated browser over `BuildPreview.astro`). Only transform/opacity/paint; everything touched is restored. Home: content stays in the initial HTML; an inline `<head>` script decides the start gate (no gate for reduced motion, bots, deep links or a second visit in the session); the engine is a dynamic import. Register new demos in `src/showcase/registry.ts` and the `previews` map of the showcase page (and `DemoThumb.astro`). It is a **simulation**: no copy may say content is generated by AI in real time. Works offline, has start/pause/skip/replay, respects reduced motion, shows a "demo · simulation" note. Tests use `tests/fixtures.ts` (skips the intro unless `test.use({ intro: true })`).

## Actions that need Steven's confirmation
Creating the GitHub remote, `git push`, enabling Pages / changing repo settings, installing skills or dependencies that run scripts. Local commits are fine.
