---
version: alpha
name: Tesela Studio
kind: services-studio
description: "Fictional AI product studio (business & professional services). Quiet, editorial, gallery-like and near-monochrome: zinc ink #18181B on a cool off-white canvas with cool grey tiers, one restrained blue for inline links. Fraunces 350 headlines with tight negative tracking, Hanken Grotesk for reading, Space Grotesk 500 for the wordmark, Space Mono for meta. Big soft radii, one faint diffuse shadow, frosted nav capsule, real dark theme. Style requested by Steven from a reference studio; brand, copy, illustrations and cases are ours."
colors:
  primary: "#18181B"
  ink: "#18181B"
  on-dark: "#F8F8F9"
  muted: "#6B6B70"
  surface: "#F8F8F9"
  surface-raised: "#EDEDF0"
  surface-strong: "#DCDCE0"
  card: "#FFFFFF"
  hairline: "#DCDCE0"
  accent-link: "#3563AD"
  focus-ring: "#A1A1A1"
  focus-cyan: "#42B5DC4D"
  ink-tint: "#18181B12"
  ink-tint-hover: "#18181B24"
dark:
  surface: "#17171A"
  surface-raised: "#2B2B30"
  surface-strong: "#38383E"
  card: "#1F1F23"
  ink: "#EDEDEF"
  muted: "#98989F"
  hairline: "#38383E"
  accent-link: "#86A8E6"
typography:
  hero-display: { fontFamily: Fraunces, fontSize: 72px, fontWeight: 350, lineHeight: 1.1, letterSpacing: -1.3px, mobile: 36px }
  display-lg: { fontFamily: Fraunces, fontSize: 58px, fontWeight: 350, lineHeight: 1.05, letterSpacing: -0.58px }
  display-md: { fontFamily: Fraunces, fontSize: 44px, fontWeight: 350, lineHeight: 1.05, letterSpacing: -0.58px, mobile: 32px }
  footer-statement: { fontFamily: Fraunces, fontSize: 42px, fontWeight: 350, lineHeight: 1.1, letterSpacing: -0.58px, mobile: 28px }
  title-lg: { fontFamily: Fraunces, fontSize: 33px, fontWeight: 350, lineHeight: 1.1, letterSpacing: -0.33px }
  title-md: { fontFamily: Fraunces, fontSize: 24.9px, fontWeight: 350, lineHeight: 1.1, letterSpacing: -0.2px }
  lead: { fontFamily: Hanken Grotesk, fontSize: 19.2px, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0.096px }
  body-lg: { fontFamily: Hanken Grotesk, fontSize: 17px, fontWeight: 400, lineHeight: 1.4 }
  body: { fontFamily: Hanken Grotesk, fontSize: 16px, fontWeight: 400, lineHeight: 1.4 }
  nav-link: { fontFamily: Hanken Grotesk, fontSize: 15px, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.075px }
  body-sm: { fontFamily: Hanken Grotesk, fontSize: 15px, fontWeight: 400, lineHeight: 1.5 }
  caption: { fontFamily: Hanken Grotesk, fontSize: 14px, fontWeight: 400, lineHeight: 1.4 }
  wordmark: { fontFamily: Space Grotesk, fontSize: 16px, fontWeight: 500, lineHeight: 1.4, letterSpacing: -0.4px }
  mono-lg: { fontFamily: Space Mono, fontSize: 19px, fontWeight: 400, lineHeight: 1.4 }
  mono-label: { fontFamily: Space Mono, fontSize: 13px, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.075px }
rounded: { xs: 7px, sm: 12px, md: 15px, lg: 16px, xl: 22px, 2xl: 24px, 3xl: 64px, full: 9999px }
spacing:
  section-padding-y: 80px
  container: 1080px
  gutter: 24px
  card-grid-gap: 16px
  footer-column-gap: "80px (mobile 56px)"
  footer-group-gap: 56px
  nav-gap: 2px
  button-ghost-padding-x: 12px
elevation:
  ambient: "transparent 0 0 0 0, transparent 0 0 0 0, transparent 0 0 0 0, transparent 0 0 0 0, #0A0A0C0F 0 4px 20px 0"
  pill: "transparent 0 0 0 0, transparent 0 0 0 0, transparent 0 0 0 0, transparent 0 0 0 0, #00000014 0 0.98px 11.74px 0"
  capsule-blur: "blur(24px) saturate(1.5) over #DCDCE099"
  button-blur: "blur(8px) over #18181B12"
  focus-filled: "border 1px solid #A1A1A1 + #A1A1A180 0 0 0 3px in the 4th shadow slot"
  focus-ghost: "#42B5DC4D 0 0 0 3px in the 4th shadow slot"
motion:
  ease-out: "cubic-bezier(0, 0, 0.2, 1)"
  ease-ui: "cubic-bezier(0.4, 0, 0.2, 1)"
  ease-expo: "cubic-bezier(0.22, 1, 0.36, 1)"
  durations: { hover: 200ms, link: 150ms, logo: 500ms, menu: 300ms }
components:
  button-primary: { backgroundColor: "{colors.primary}", textColor: "#FFFFFF", rounded: 15px, height: 46px, padding: "12px 24px", typography: "Hanken Grotesk 15/20.25 400 +0.075px", border: "1px solid transparent", hover: "opacity .85" }
  button-secondary: { backgroundColor: "{colors.ink-tint}", textColor: "{colors.ink}", rounded: 15px, height: 46px, backdrop: "blur(8px)", hover: "{colors.ink-tint-hover}" }
  button-ghost: { backgroundColor: transparent, rounded: 15px, height: 42px, padding: "0 12px", focus: "{elevation.focus-ghost}" }
  nav-capsule: { backgroundColor: "#DCDCE099", rounded: 22px, padding: 8px, backdrop: "{elevation.capsule-blur}", shadow: "{elevation.ambient}" }
  nav-link: { rounded: 15px, height: 42px, padding: "10px 16px", active: "white pill with {elevation.pill}" }
  card: { backgroundColor: "{colors.card}", rounded: 22px, padding: 32px, shadow: "{elevation.ambient}" }
  work-card: { backgroundColor: "{colors.card}", rounded: 22px, padding: 12px, well: "{colors.surface-raised} 16px radius, 1:1", tiles: "28x38 {colors.surface-raised} 7px radius, Space Mono 19px" }
  chip: { backgroundColor: "{colors.surface-raised}", rounded: 15px, padding: "4px 12px", typography: "{typography.mono-label}" }
  process-panel: { grid: "280px 1fr, gap 48px", media: "558px tall, 64px radius, ambient shadow", inset: "white, 24px radius, 12px padding, max 448px" }
  field: { backgroundColor: "{colors.card}", border: "1px solid {colors.hairline}", rounded: 15px, height: 46px, focus: "{elevation.focus-filled}" }
---

# Tesela Studio

## Overview
Tesela Studio is a fictional AI product studio: it designs and ships agents, copilots and AI features for companies (sector: business & professional services). The page reads like a well-kept studio notebook or a gallery catalogue: calm, editorial and near-monochrome. A cool off-white canvas, **Studio Ink** text and a light display serif do almost all the work. Colour is withheld on purpose; personality comes from type contrast and the isometric cube illustrations ("teselas": each piece fits). It must feel unlike the loud store (Brinco), the dark restaurant (Lumbre), the 3D product (Isola) and the green SaaS (Turnio): this one sells *judgement and craft*.

Density is low. Sections breathe on an 80 px rhythm, cards carry large padding and big soft radii, long stretches of empty canvas are part of the composition. Hierarchy comes from typeface switching, not weight. Nothing is bold.

**Key characteristics**
- Near-monochrome: `ink` #18181B on `surface` #F8F8F9, tiers `surface-raised` #EDEDF0 and `surface-strong` #DCDCE0, white cards.
- Fraunces 350 for every heading from 24.9 px to 72 px, always negatively tracked. Italic Fraunces is the only emphasis (one phrase in the hero).
- Three weights: 350 (serif), 400 (text, mono), 500 (Space Grotesk wordmark).
- Space Mono meta labels on `surface-raised` chips: durations, sectors, sample-data notes.
- Soft nested geometry: 15 px controls, 22 px cards, 16 px wells, 7 px tiles, 64 px media corners.
- One ambient shadow + frosted glass only on the floating nav capsule and the secondary button.
- Real dark theme that swaps the same role tokens (system preference + toggle in the nav).

## Colors
Cool zinc greyscale anchored on one ink, set against **oil paintings** (public domain: Van Gogh, Cézanne, Rousseau, Turner) inside 64 px rounded windows: the warm, textured canvases are the only rich colour on the page and the UI stays monochrome around them. Every painting carries a museum label (`.ts-cartela`, Space Mono on a white chip). Semantic green `--ok` #3F9B1D (dark #5FCB2B) and `--ok-tint` exist only for the "done" state of operation cards. **Margin Blue** (`accent-link` #3563AD, dark #86A8E6) appears only on inline text links (case dialog, footer note). Never a button or surface fill. No gradients anywhere; illustration depth comes from flat isometric face shading (top `card`, left `surface-raised`, right `surface-strong`, edges `hairline`/ink at low alpha). One cube per illustration may be solid ink as the focal piece.
- Text: `ink` primary, `muted` #6B6B70 secondary (5.0:1 on surface, 5.3:1 on white). Hero lead at ink 70 % alpha.
- Focus: filled buttons switch their latent transparent border to #A1A1A1 + a 3 px #A1A1A180 ring; transparent controls get a 3 px #42B5DC4D ring.
- Dark: canvas #17171A, raised #2B2B30, borders #38383E, text #EDEDEF, muted #98989F, cards #1F1F23. Primary button inverts (pale fill, dark text).

## Typography
- **Fraunces** (variable, wght 300–400, loaded as variable so 350 renders exactly; italic face only for the hero emphasis). Fallback Georgia with the same negative tracking.
- **Hanken Grotesk** 400: body, lead, nav, buttons, footer.
- **Space Grotesk** 500: the wordmark only ("tesela" ink + "studio" muted).
- **Space Mono** 400: chips, durations, work-card letter tiles, footer fine print, sample-data labels.
- Tracking scales with size (Fraunces negative, small sans/mono +0.075 px). Display line-height 1.05–1.1, reading 1.4, narrow card bodies 1.5. `text-wrap: balance` on headings, `pretty` on paragraphs.

## Layout
Container 1080 px with 24 px gutters. Sections 80 px apart on the same canvas; never separated by rules or colour bands. Card grids: capabilities 4 columns, work 3 columns, formats 3 columns, all 16 px gutters. Process panels: 280 px text column + media column. Footer: statement + CTA left, three link columns right (80 px gap, 56 px between groups). Hero: centred single column over a wide isometric "landscape" of cube stacks anchored to the bottom of the sticky stage.

## Elevation & Depth
Three devices only: tonal steps (canvas → white card → raised well), the ambient shadow (`#0A0A0C0F 0 4px 20px`) on cards, media panels and the nav capsule, and blur on floating chrome (`blur(24px) saturate(1.5)` capsule, `blur(8px)` secondary button). The active nav pill uses the tight pill shadow. Shadows are five-layer stacks with four transparent layers so the focus ring takes the fourth slot without overwriting the lift. Never stack, darken or add hard borders around cards.

## Shapes
Nesting rule: a parent is always rounder than its child (22 px card → 16 px well → 7 px tile; 22 px capsule → 15 px tabs). Buttons are 15 px rounded rectangles, never pills. `rounded.full` only for true circles (status dots). The crisp isometric cubes supply the angles.

## Motion
- Hover: primary opacity .85 (200 ms ease-ui), secondary fill to ink-tint-hover, footer links opacity .7 (150 ms). Logo cube turns on hover (500 ms ease-expo).
- **Scroll-driven, CSS only** (`@supports (animation-timeline: view())` + `prefers-reduced-motion: no-preference`; default CSS = final state):
  1. *Hero track* (`view-timeline: --ts-hero`, 330 svh, sticky 100 svh stage): cube stacks start lifted by depth and settle onto the floor, the solid ink "keystone" drops into its slot, the headline lifts and fades, then a rounded painting window rises like a curtain (`clip-path: inset(100% 0 0 0 round 64px)` → `inset(0)`), the oil painting settles from `scale(1.28)` and a white card with "Every piece fits before it ships" fades in. The h1 is untouched at progress 0 (LCP); the painting loads on the first scroll.
  5. *Paintings in the process panels* settle from `scale(1.16)` as each panel enters (`view()`, entry → cover 45 %).
- **Operation cards** (scroll-driven, `view-timeline: --ts-op` on each panel's media): while the panel rises into place its rows go queued (ring, "Queued", label 45 %) → running (spinner, "Analysing…") → done (green check pop, tinted row, result) one after another, and reverse when scrolling back. Ranges are lengths from cover 0 (`45svh` → `100svh − 130px` on desktop, `78svh` on phones). Only the spinner's rotation is time-based. No support / reduced motion: finished state.
  2. *Work tiles*: each letter tile flips in (rotateX + opacity) staggered as the card enters.
  3. *Process*: sticky stacked panels; the panel being covered scales to .94 and dims (`animation-range: exit`).
  4. Section heads and cards reveal on enter (translateY 24 px + opacity).
- Fallback / reduced motion: track height auto, stage and panels static, everything visible.

## Components
Floating glass nav capsule (logo, Work/Process/Services/Formats with a white active pill driven by IntersectionObserver, theme toggle, "Start a project"); mobile: logo + 48×42 menu toggle opening an in-capsule panel · Sticky hero (h1 with one italic phrase, lead, primary + secondary CTAs, isometric landscape) · Capabilities: 4 cards (tilted 16 px square icon, title-md, body) · Selected work: 3 work cards (1:1 well button with isometric object → case dialog, sector chip, mono duration, letter tiles, body) labelled sample · Process: 4 sticky panels (mono badge, title-lg, body, 64 px media window with a public-domain oil painting, a centred operation card (queued → running → done rows) and a museum label) · Formats: 3 cards with mono duration chip and "Choose" → brief dialog · Footer (statement 42 px, CTA, 3 link columns, logo + mono fine print) · Case `<dialog>` (`?case=`) · Brief `<dialog>` (`?brief=`) with validation and simulated success.

## Do's and Don'ts
Do: Fraunces 350 with its tracking; 15 px controls at 42/46 px; solid ink primary + translucent blurred secondary; white cards with the single ambient shadow at 22 px; 80 px sections and 1080 px container; Space Mono chips for meta; label sample cases and metrics.
Don't: bold or semibold; new hues (blue stays on inline links); pure black; pills; stacked or darker shadows; hairlines or colour bands between sections; dropping the transparent 1 px button border (focus depends on it); claims that content is generated by AI in real time; real client names or logos.

## Responsive Behavior
390 px: hero h1 36 px (same −1.3 px tracking), lead stays 19.2 px, CTAs side by side (wrap if needed), landscape 900 px wide centred and clipped; nav capsule full width with wordmark + menu toggle; card grids stack to one column; process panels stack text over media (min 420 px, 32 px radius) as a plain list (sticky stacking only from 900 px, where a panel always fits the viewport); footer statement 28 px, link columns 2-up, column gap 56 px. 1440 px: everything as specified, container stays 1080 px. Touch targets ≥ 42 px (46 px for text CTAs, 44 px inside dialogs).

## Agent Prompt Guide
"Tesela Studio, a fictional AI product studio. Near-monochrome editorial: ink #18181B on #F8F8F9, grey tiers #EDEDF0/#DCDCE0, white 22 px cards with `#0A0A0C0F 0 4px 20px`, frosted #DCDCE099 nav capsule (blur 24 px saturate 1.5). Fraunces 350 negative-tracked headlines (72/58/44/33/24.9), one italic phrase in the hero; Hanken Grotesk 400 body; Space Grotesk 500 wordmark; Space Mono 13 px chips. 15 px rounded buttons (ink solid, ink-tint blurred secondary). Isometric cube illustrations, no colour except #3563AD inline links. Scroll-driven sticky hero, flipping letter tiles, stacked sticky process panels. Real dark theme."
