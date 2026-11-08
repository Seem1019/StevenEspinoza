---
name: Isola H1
version: 1
tokens:
  color:
    bg: "#FFFFFF"
    steel-1: "#F4F6F8"
    steel-2: "#E8ECF0"
    steel-3: "#D3D9DF"
    line: "#E1E6EB"
    text: "#16191D"
    muted: "#59626B"
    accent: "#4C6A5C"      # anodized sage
    accent-ink: "#FFFFFF"
    ok: "#2F6B4F"
  finish:
    graphite: { shell: "#2B2E33", plate: "#3A3E44", cushion: "#1C1E21", metal: "#B8BDC3" }
    mist:     { shell: "#D9DDE1", plate: "#C5CACF", cushion: "#8B939B", metal: "#C9CED3" }
    sage:     { shell: "#7D8F85", plate: "#6C7D73", cushion: "#2E3431", metal: "#C2C7CC" }
  font:
    family: "Manrope (--font-isola), 200–700"
    display: { size: "clamp(64px, 10vw, 148px)", weight: 200, tracking: "-0.05em", leading: 0.9 }
    h2: { size: "clamp(36px, 5vw, 68px)", weight: 300, tracking: "-0.035em", leading: 1.02 }
    body: { size: "17px", weight: 400, leading: 1.6, measure: "52ch" }
    small: { size: "13px", weight: 500, tracking: "0.01em" }
  radius: { sm: "2px", md: "4px" }
  space: { section: "clamp(96px, 14vw, 200px)", gutter: "clamp(16px, 4vw, 56px)", maxw: "1240px" }
  motion: { ease: "cubic-bezier(0.22, 1, 0.36, 1)", dur: "600ms" }
---

# Isola H1 — design system

## Overview
Fictional premium over-ear headphones. The page is the opposite of a discount store: quiet, precise, generous air, one product, one price, one action. It sells with typography, a crisp product render and a scroll-driven 3D teardown, never with badges or urgency.

## Colors
Pure white page with cool steel greys for surfaces and hairlines. Graphite text. A single accent — anodized sage (`#4C6A5C`, 5.9:1 on white) — reserved for the primary button, focus ring, selected swatch and the driver ring in the 3D model. No warm off-whites, no gradients other than very soft steel radial washes behind the product.

## Typography
Manrope only. Display at weight 200 with tight negative tracking at very large sizes; section titles at 300; body 400 at 17px with a 52ch measure; labels 500–600 at 13px in sentence case (no monospace, no uppercase tracking labels, no numbered sections).

## Layout
12-column feel, max 1240px, large vertical rhythm (`section` space). Hero: text left, product right (stacked on mobile). The 3D stage is a 380vh sticky track; the canvas box is fixed and the poster SVG occupies it exactly until three.js is ready.

## Elevation & Depth
Flat UI. Depth only comes from the product: soft contact shadow, steel radial wash. Dialog: white sheet, 1px line, a single soft shadow.

## Shapes
Rectangular. Buttons and inputs 4px radius (never pills). Swatches are circles (they depict the product, not controls of the UI chrome).

## Motion
Slow and precise: 600ms ease-out. Feature blocks rise 24px + fade using CSS scroll-driven animations (final state by default). 3D: rotation then explode bound to scroll progress with damping. Reduced motion: no scroll animation, static exploded SVG with all callouts visible.

## Components
- Header: wordmark, 4 anchor links, rectangular "Comprar" button.
- Primary button: sage fill, white text, 48px tall. Secondary: 1px graphite outline.
- Callout: hairline + title 500 + one-line detail in muted.
- Specs table: two columns, hairline rows, label muted.
- Purchase drawer: right sheet (desktop) / bottom sheet (mobile), finish radios, quantity stepper, summary, simulated reservation.

## Do's and Don'ts
- Do leave space; one idea per section.
- Do keep numbers precise (40 mm, 60 h, 254 g).
- Don't use pills, emoji, glass panels, purple gradients, italics in headlines, discount badges or countdowns.
- Don't animate the hero text on load (it is the LCP).

## Responsive Behavior
390px: hero stacks, 3D canvas ~52svh with one callout at a time below it, specs table stays two columns. 1440px: callouts flank the canvas in two columns.

## Agent Prompt Guide
"Quiet premium product page, pure white and steel grey, graphite text, one sage accent, Manrope 200 at huge sizes with tight tracking, rectangular 4px buttons, lots of air, a single product rendered crisply."
