---
version: alpha
name: Steven Espinoza — portfolio
description: Personal sales portfolio of a software engineer. Dark, direct, engineered. Frames four very different demos without competing with them.
colors:
  ink: "#0C0D0E"
  surface: "#151719"
  surface-2: "#1D2023"
  line: "#2A2E33"
  text: "#EEF0F2"
  muted: "#A7ADB5"
  accent: "#FF5A1F"
  accent-hover: "#FF7442"
  accent-ink: "#0C0D0E"
  ok: "#3DDC97"
typography:
  display: { fontFamily: "Bricolage Grotesque", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 0.98 }
  heading-1: { fontFamily: "Bricolage Grotesque", fontSize: "clamp(2.4rem, 6.4vw, 4.6rem)", fontWeight: 800 }
  heading-2: { fontFamily: "Bricolage Grotesque", fontSize: "clamp(2rem, 4.4vw, 3.2rem)", fontWeight: 800 }
  heading-3: { fontFamily: "Bricolage Grotesque", fontSize: "1.375rem", fontWeight: 700 }
  body: { fontFamily: "Instrument Sans", fontSize: "1rem", lineHeight: 1.5 }
  lead: { fontFamily: "Instrument Sans", fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)" }
  small: { fontFamily: "Instrument Sans", fontSize: "0.875rem" }
rounded: { sm: 4px, md: 8px, lg: 14px }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 40px, 2xl: 64px, 3xl: 96px, gutter: "clamp(16px, 4vw, 48px)", maxw: 1240px }
components:
  button-primary: { backgroundColor: "{colors.accent}", textColor: "{colors.accent-ink}", rounded: "{rounded.sm}", height: 48px, padding: "0 20px", fontWeight: 700 }
  button-ghost: { backgroundColor: transparent, textColor: "{colors.text}", border: "1px solid {colors.line}", rounded: "{rounded.sm}", height: 48px }
  card: { backgroundColor: "{colors.surface}", border: "1px solid {colors.line}", rounded: "{rounded.md}" }
  dialog: { backgroundColor: "{colors.surface}", border: "1px solid {colors.line}", rounded: "{rounded.lg}", backdrop: "rgb(0 0 0 / 0.6)" }
---

## Overview
Engineer's portfolio for client meetings. Mood: confident, dark, precise, a little industrial. The portfolio chrome is deliberately restrained (one hot accent on near-black) so each demo's own identity pops when shown. Copy is short, concrete, in first person ("Diseño y construyo…").

## Colors
- `ink` page background (never cream / off-white). `surface` cards and dialogs, `surface-2` inputs and inner rows, `line` 1px borders.
- `accent` vermilion is the only saturated colour of the brand: primary buttons, focus ring, key highlights, the showcase teaser band. Never more than one accent block per viewport.
- Demo colours appear only inside demo frames (cards, thumbnails, picker swatches), taken from `src/data/demos.ts`.
- Contrast: `text` on `ink` 16:1, `muted` on `ink` ≥ 7:1, `accent-ink` on `accent` ≥ 6:1.

## Typography
Bricolage Grotesque (display, 700–800, tight negative tracking, `text-wrap: balance`) + Instrument Sans (body 400–700, `text-wrap: pretty`). Only the display font is preloaded (it is the LCP h1). No italics for emphasis; emphasis = weight or the accent colour, sparingly.

## Layout
Max width 1240px, fluid gutter. Sections separated by 1px `line` rules and generous vertical rhythm (56–112px). Grids: gallery 1 → 2 columns at 760px; pillars 1 → 3 at 860px. Hero: copy left, stacked demo "tabs" right (each in its demo colours) at ≥ 960px.

## Elevation & Depth
Flat. Depth via surface steps and borders, not shadows. Dialogs use the native backdrop. No glassmorphism, no blur.

## Shapes
Rectangles with small radii: 4px controls, 8px cards, 14px dialogs and bands. No pill buttons, no circles except the browser dots in the showcase frame.

## Motion
- Durations: 160ms (press/hover), 320ms (dialogs, panels), 600ms (larger reveals). Easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Press feedback `scale(0.97)`. Dialog entry: fade + 16px rise. View transitions: 220ms crossfade.
- The portfolio itself uses no scroll-driven effects (it frames the demos). All motion disabled with `prefers-reduced-motion`.

## Components
SiteHeader (sticky, 64px, logo mark "SE", nav, lang switch, contact button), LangSwitch (segmented ES/EN), ContactDialog (contact rows + QR with full vCard + download), DemoBar (40px neutral bar on every demo), demo Card (thumbnail = scaled BuildPreview, sector, name, tagline, open + details), demo details dialog, showcase (picker, browser frame stage, HUD, agent panels, "simulation" badge), SiteFooter.

## Do's and Don'ts
- Do keep one primary action per section; verbs with outcome ("Ver las demos", "Escribirme").
- Do show demo identities in their own colours; keep the chrome neutral.
- Don't: cream/off-white backgrounds, italic highlighted words, numbered section labels, monospace labels, pills, purple-blue gradients, glassmorphism, emoji icons, lorem ipsum, invented achievements or metrics about Steven.

## Responsive Behavior
Designed at 390px and 1440px. Header hides the text nav < 760px and the name < 420px. Touch targets ≥ 44px. No horizontal scroll at any width.

## Agent Prompt Guide
"Dark ink #0C0D0E page, Bricolage Grotesque 800 tight headlines, Instrument Sans body, single vermilion #FF5A1F accent, 4–8px radii, 1px #2A2E33 borders, flat surfaces, short confident first-person copy from src/i18n. Frame, don't compete with, the demos."
