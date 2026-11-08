---
name: Turnio
kind: saas-landing
colors:
  forest-950: "#041F17"
  forest-900: "#062B20"
  forest-800: "#0B3D2E"   # brand, hero, final band
  forest-700: "#11533F"
  forest-600: "#1B6B52"
  mint-300: "#7CF3B6"     # accent on dark, CTA fill on dark
  mint-200: "#B5F7D5"
  mint-100: "#DFF9EC"
  mint-50: "#F0FCF6"      # alternate section surface (tinted, never cream)
  white: "#FFFFFF"
  ink: "#0F2A22"          # text on light
  muted: "#4B635A"        # 6.3:1 on white
  line: "#D5E6DD"
  amber-400: "#FFB547"    # the one warm accent: highlights, "most chosen", live dots
  danger: "#B42318"
typography:
  family: "Plus Jakarta Sans 400–800 (--font-turnio)"
  h1: "60/60 700 -0.025em (mobile 38/42)"
  h2: "48/48 700 -0.02em (mobile 30/36)"
  h3: "20/28 700"
  body: "16/24 400; lead 18/28 400"
  caption: "12/16 600"
spacing: [4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96]
radius: { sm: 6, md: 10, lg: 16, xl: 24 }
shadow:
  card: "0 1px 2px rgb(6 43 32 / .06), 0 8px 24px rgb(6 43 32 / .08)"
  float: "0 12px 40px rgb(4 31 23 / .28)"
motion:
  ease: "cubic-bezier(0.22, 1, 0.36, 1)"
  durations: [200, 320, 600]
---

## Overview
Turnio is a fictional appointment scheduling SaaS for service businesses (clinics, salons, workshops, studios). The page is product-led: the product UI (built in HTML/CSS) is the hero visual and the tour. Tone: confident, calm, specific numbers, zero hype. It must read "serious B2B tool you can trust with your agenda", unlike the loud store, dark restaurant and quiet premium demos.

## Colors
Deep forest green carries the brand (hero, header, final band, primary buttons on light). Mint is the action colour on dark and the soft surface on light. White is the main canvas; mint-50 alternates sections. Amber is used sparingly (one per view): popular badge, live dot, metric highlight. Never gradients on backgrounds; no purple/blue.

## Typography
One family, Plus Jakarta Sans. Headings 700, tight tracking, `text-wrap: balance`. Body 400, `text-wrap: pretty`. Numbers in metrics use tabular figures. No italics, no monospace labels.

## Layout
Max width 1200, gutter clamp(16px, 4vw, 48px). Hero 2 columns (copy 5 / mock 7) from 1024px, stacked below. Sections 96px vertical (64 mobile). Cards in 3-column grids collapsing to 1.

## Elevation & Depth
Flat surfaces with a hairline border (`line`). Only product mocks and floating UI (toast, booking widget, dialog) get shadows, to signal "real app".

## Shapes
Buttons radius 10 (never pills). Cards 16. Mock frame 16, inner elements 10/6 by the nested-radius rule. Avatars are rounded squares with initials.

## Motion
After load only: toast and booking widget float gently, a new appointment pulses once. Sections reveal with CSS scroll-driven animations (final state by default, inside `@supports (animation-timeline: view())` + `prefers-reduced-motion: no-preference`). Tabs and billing switch instantly (opacity 200ms at most).

## Components
Sticky header (forest, logo, anchors, CTA) · Hero with app mock (week calendar, reminder toast, booking widget) · Wordmark strip labelled "sample clients" · Before/after panel · Benefit cards with metric · Timeline of 3 steps with icons and connector · Tour tabs + 4 mocks · Testimonial cards with initials · Pricing toggle + 3 tiers + comparison table in `<details>` · FAQ `<details>` · Final band · Signup `<dialog>`.

## Do's and Don'ts
Do: label sample data, verb + outcome CTAs, show the product. Don't: emoji, numbered 01/02/03 labels, pills, glassmorphism, stock photos, cream backgrounds, italic highlighted words.

## Responsive Behavior
390px: header shows logo + CTA only; calendar mock shows 3 days and hides the booking widget; tour tabs scroll horizontally; pricing cards stack with Pro first visible. 1440px: full week mock with overlapping floating cards.

## Agent Prompt Guide
"Product-led SaaS landing for Turnio: deep forest #0B3D2E hero, mint #7CF3B6 CTAs, white canvas, one amber highlight. Plus Jakarta Sans. Show the scheduling app UI in HTML/CSS. Specific outcome copy, sample data clearly labelled."
