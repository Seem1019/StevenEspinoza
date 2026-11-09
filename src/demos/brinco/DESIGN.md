---
name: Brinco
sector: ecommerce (mass-discount marketplace)
tokens:
  color:
    obsidian: "#0B0C10"     # ticker, header, hero, final band, wheel dialog
    obsidian-2: "#14151A"   # raised controls on dark (search, cart, floating badges)
    page: "#F4F4F5"         # catalog surface (zinc, never cream)
    alabaster: "#FAFAFA"    # flash deals band, drawer footers
    surface: "#FFFFFF"      # cards, dialogs
    studio: "#F1F2F4"       # product backdrop (radial white → studio tone)
    ink: "#09090B"          # text on light (ink-2 #3F3F46, muted #52525B)
    on-dark: "#FAFAFA"      # text on obsidian (secondary #A1A1AA, 7.6:1)
    accent: "#FF3B1D"       # electric vermilion: primary CTAs, active states, stock/shipping bars, discount badges
    accent-ink: "#D42A0E"   # vermilion for text on white (prices, low stock) 5.1:1
    on-accent: "#0B0C10"    # text on vermilion 5.9:1
    ok: "#047857"           # semantic success only (added, coupon applied, free shipping)
  font:
    ui: "Inter (--font-brinco) 400–700"
    data: "JetBrains Mono (--font-brinco-mono) 400–700: prices, discounts, timers, counters, coupon, dial labels"
    headings: "600–700, letter-spacing -0.035…-0.045em, line-height 1.04–1.08, sentence case"
    body: "15–19px, line-height 1.55, max 60ch"
  radius: "6px buttons · 8px chips/controls · 10px flash cards · 14px catalog cards · 16px dialogs (never pills)"
  depth:
    light: "0 0 0 1px rgb(0 0 0 / .07), 0 2px 8px -2px rgb(0 0 0 / .04)"
    dark: "0 0 0 1px rgb(255 255 255 / .09)"
    lift: "0 0 0 1px rgb(0 0 0 / .11), 0 12px 28px -10px rgb(0 0 0 / .16) (hover, faded in on ::after)"
  motion:
    ease-out-expo: "cubic-bezier(0.22, 1, 0.36, 1)  — micro-interactions 160–220 ms"
    ease-drawer: "cubic-bezier(0.32, 0.72, 0, 1)   — drawers, dialogs, toasts 240–360 ms"
---

## Overview
High-craft deals marketplace: "dark & alabaster precision". Obsidian top (ticker, header, hero with the dial) over a crisp zinc/alabaster catalog with white cards. Conversion mechanics stay loud (countdown, stock bars, discount badges, wheel, purchase toasts) but the craft is quiet: hairlines, one accent, mono numbers. Products read like hardware shot in one studio.

## Colors
One accent only — vermilion — used surgically: primary CTAs, active chip dot, discount badges, stock and shipping bars, the dial pointer and hub. Prices on white use `accent-ink`. Text on vermilion is obsidian, never white (white fails 4.5:1). Green exists only as a status colour (added, coupon applied, free shipping unlocked). No yellow, no pastels: product backdrops are near-identical cool neutrals (`BG` in `catalog.ts`).

## Typography
Inter for UI and headings (sentence case, tight tracking). JetBrains Mono for every figure that can change or be compared: prices, -% badges, countdown digits, cart count, totals, coupon code, dial labels. `font-variant-numeric: tabular-nums` on all of them (and on Inter text that mixes numbers: stock, sold, ticker). Mono is for data, never for labels.

## Layout
Max width 1360. Grid 2 cols (390) → 3 (640) → 4 (960) → 5 (1240). Hero 2 columns ≥ 900 px. Flash deals: horizontal scroll-snap row on mobile, 8 columns on desktop.

## Elevation & Depth
No solid borders. Hairline shadows (`depth.light` / `depth.dark`). Cards lift 2 px on hover while a deeper shadow fades in on `::after` (opacity, not box-shadow transition). Dialogs: hairline + large soft ambient shadow. Hero, final band and wheel use a faint radial light (white 3–5 %, vermilion 7–8 %), never mesh gradients.

## Shapes
Rectangles with small radii (see tokens). Nothing rotated: badges, stickers, ticket and logo are upright. Wheel = precision dial: 8 matte graphite segments, 1 px specular dividers, 72-tick bezel, mono labels, machined metal hub with a vermilion pin (`Wheel.astro`).

## Motion
Only transform, opacity and filter (blur ≤ 2 px). Never `transition: all`, never `ease-in`, never entrance from `scale(0)`.
- Micro-interactions 180 ms `ease-out-expo`; `:active` → `scale(0.97)` on buttons, chips, close buttons, add-to-cart.
- Hover tints = `::after` overlay in `currentColor` fading to 6–10 % opacity (background colour never transitions).
- Toasts, quick view, wheel dialog: from `opacity 0, translateY(8px) scale(.96) blur(2px)` over 240 ms `ease-drawer` (Sonner-style). Drawers slide 360 ms `ease-drawer`.
- Ticker marquee, idle dial rotation, floating hero badges, live dot ping, coupon flight (WAAPI, no rotation).
- `prefers-reduced-motion: reduce`: ticker/dial/badges stop, every transition becomes instant, the wheel result is immediate.

## Components
Ticker, sticky dark header (logo, search, cart with mono count), hero (kicker, h1, CTAs, dial teaser + floating badges), flash band (mono countdown boxes, cards with stock bars), category chips + sort + filters button, product card (studio art, -% badge, badge, mono price, rating sample, sold, low stock, add), quick view dialog, cart drawer with checkout steps, filters drawer/bottom sheet, wheel dialog (dark), sticky free-shipping bar, purchase toasts with pause, final contact band, footer.

## Do's and Don'ts
- Do keep obsidian text on vermilion; label ratings, viewers and purchase toasts as sample data.
- Do keep cards at fixed aspect ratio and reserved line heights (no CLS).
- Don't use thick borders, hard offset shadows, rotated stickers, yellow bands, pastel thumbnails, pills, uppercase headlines, cream backgrounds, or any real marketplace name, logo or colour scheme.
- Don't animate the h1 (LCP).

## Responsive Behavior
390 px: header in two rows (logo + cart, then search), filters as bottom sheet, quick view as bottom sheet, 2-col grid, touch targets ≥ 44 px (`pointer: coarse`). 1440 px: one-row header, filters as right drawer, quick view as 2-column modal, 5-col grid.

## Agent Prompt Guide
"Brinco: high-craft deals marketplace. Obsidian #0B0C10 top, zinc #F4F4F5 / alabaster catalog, white cards with 1px hairline shadows, single vermilion accent #FF3B1D (obsidian text on it). Inter 700 tight headings; JetBrains Mono tabular for prices, timers and counts. Precision dial wheel. Motion: ease-out-expo 180 ms, ease-drawer 240 ms, scale(.97) on press. No borders, no rotation, no yellow, no pills."
