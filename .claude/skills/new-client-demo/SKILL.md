---
name: new-client-demo
description: Create a new client demo in Steven's portfolio (es/en page, DESIGN.md, data, showcase timeline + BuildPreview, gallery entry) in minutes. Use when asked to add a demo, a new sector/industry example, or a new mock client site to the portfolio.
---

# New client demo

A demo is a self-contained fictional site for one industry. It lives in its own folders and plugs into the gallery, the showcase and i18n. Read `docs/demo-contract.md` first: it holds every rule (navigation, performance, a11y, design anti-patterns, showcase contract).

## 0. Decide (don't ask Steven unless truly blocked)
- `slug` (lowercase, one word, the invented brand: e.g. `ruta`), sector (`ecommerce | restaurant | premium | saas` or add a new one to `DemoEntry['sector']` + `common.sectors.*`).
- Invented brand name that is not a known company. Write the choice in `docs/decisions.md`.
- Fonts: add 1–2 families to `astro.config.mjs` `fonts` (Fontsource provider, latin subset, `display: 'swap'`, cssVariable `--font-<slug>…`).

## 1. Design first
Create `src/demos/<slug>/DESIGN.md` (copy the structure of `src/demos/turnio/DESIGN.md`): YAML tokens + Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Motion (durations, easings, what is scroll-driven), Components, Do's and Don'ts, Responsive Behavior, Agent Prompt Guide. It must look made for its industry and clearly different from the existing demos. Check the anti-pattern list.

## 2. Scaffold
```
src/demos/<slug>/DESIGN.md
src/demos/<slug>/BuildPreview.astro        # static 1280px miniature, data-build parts
src/demos/<slug>/showcase/timeline.ts      # default export Timeline
src/demos/<slug>/components/…              # optional
src/pages/[lang]/demos/<slug>/index.astro  # the page
src/i18n/es/<slug>.json, src/i18n/en/<slug>.json
```
Page skeleton:
```astro
---
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import DemoBar from '../../../../components/site/DemoBar.astro';
import { useT, langPaths, type Lang } from '../../../../i18n';
export const getStaticPaths = langPaths;
const lang = Astro.params.lang as Lang;
const t = useT(lang, '<slug>');
---
<BaseLayout lang={lang} title={t('meta.title')} description={t('meta.description')}
  fonts={['--font-<slug>']} preload={['--font-<slug>']} bodyClass="<slug>" themeColor="#…">
  <DemoBar lang={lang} />
  <main id="main">…</main>
</BaseLayout>
```
i18n required keys: `meta.name`, `meta.title`, `meta.tagline`, `meta.description`, `meta.features[]`, `showcase.logs.*`.

## 3. Register
- `src/data/demos.ts`: add `{ slug, ns: slug, sector, card: { bg, fg, accent }, techniques: [...] }` (technique keys from `common.techniques.*`, add new ones in both languages).
- `src/showcase/registry.ts`: import the timeline and add it to `timelines`.
- `src/pages/[lang]/showcase/index.astro` and `src/components/site/DemoThumb.astro`: import `BuildPreview` and add it to the `previews` map.

## 4. Interactions
Use `onPage` (lifecycle) for every script and `url-state.ts` for every dialog/drawer/filter (see `.claude/skills/no-reload-navigation`). Scroll effects per `.claude/skills/scroll-animation-patterns`.

## 5. Showcase scene
30–45 s, four phases (kickoff → build with 3–5 deliberate errors → QA review and fixes → close). Contract and action list: `docs/demo-contract.md` and `src/showcase/types.ts`; copy a sibling (`src/demos/turnio/showcase/timeline.ts`) and adapt targets, errors and messages (`showcase.say.*`, `showcase.flags.*`). Never claim real-time AI generation.

```ts
import type { Scene } from '../../../showcase/types';
const scene: Scene = {
  id: '<slug>', ns: '<slug>', prefix: 'showcase', duration: 37,
  errors: [{ id: 'cta-contrast', target: '[data-build=hero] .btn', owner: 'design', flag: 'ctaContrast', paint: { color: '#777' } }],
  events: [
    { at: 0, do: 'phase', phase: 'kickoff' },
    { at: 0.1, do: 'spawn' },
    { at: 1.1, do: 'assign', to: 'design', say: 'aDesign' },
    // … build, review (sweep → assign fixing → pick/fix …), close
  ],
};
export default scene;
```

## 6. Verify (definition of done)
1. `npm run build` passes (no i18n errors).
2. `npm run screenshots` → look at 390px and 1440px; fix anything broken or generic.
3. `npm run test:e2e` passes (add the demo's URL-state cases to `tests/navigation.spec.ts` if it has dialogs/filters).
4. `npm run lighthouse` → the new page meets perf ≥ 90, a11y/BP/SEO ≥ 95, LCP < 2.5 s, CLS < 0.1.
5. Showcase: pick the demo, Start, Pause, Skip to the end, Replay, reduced motion; `npm run screenshots:agents` for the timed captures.
