---
name: Brinco
sector: ecommerce (mass-discount marketplace)
tokens:
  color:
    red: "#FF2E4D"        # hot coral-red: header, CTAs, discount stickers (black text on it, 6.1:1)
    red-ink: "#C8001F"    # prices / red text on white (≥ 4.5:1)
    yellow: "#FFE600"     # electric yellow: flash band, add buttons, coupon
    ink: "#111111"        # borders, hard shadows, hero, footer
    white: "#FFFFFF"      # cards, dialogs
    page: "#F2F2F2"       # neutral page grey (not cream)
    green: "#007A3D"      # savings text on white
    green-hi: "#19E07A"   # savings fills, "added" state, free-shipping bar
  font:
    family: "Rubik (--font-brinco), 400–900"
    display: "900, uppercase, -0.035em, line-height 0.92"
    body: "500–700, 15–16px"
  radius: "3px (chunky rectangles, never pills)"
  border: "2.5–3px solid ink"
  shadow: "hard offset 4px 4px 0 ink (6–8px on dialogs)"
  motion:
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
    ease: "cubic-bezier(0.22, 1, 0.36, 1)"
---

## Overview
Loud, dense, gamified deals marketplace. Everything shouts "price": rotated discount stickers, a black ticker, a red sticky header, a yellow flash band with a live countdown and a prize wheel. Neo-brutalist sticker look (thick black outlines, hard shadows) so it reads as a bargain app, the opposite of a premium site.

## Colors
Red + yellow + black carry the brand; white cards on a neutral grey page; green only for savings. Text on red/yellow is always black. Red text on white uses `red-ink`.

## Typography
Rubik only. 900 uppercase for headlines, section titles, prices and buttons; 500–700 for product names and body. Tabular numbers for countdown, cart count and totals.

## Layout
Max width 1360. Grid 2 cols (390) → 3 (640) → 4 (960) → 5 (1240). Hero 2 columns ≥ 900 px. Flash deals: horizontal scroll-snap row on mobile, 8 columns on desktop.

## Elevation & Depth
No blur shadows. Hard offset shadows in ink (or red/yellow on dark surfaces). Pressing a button translates it into its shadow.

## Shapes
Rectangles with 3 px radius. Stickers rotated −10°…+8°. Wheel = 8 segments in red/yellow/black/white.

## Motion
Transform/opacity only: ticker marquee, idle wheel teaser, wheel spin (4.2 s transition), coupon flying into the cart (WAAPI), add-to-cart pulse + badge bump + burst, toasts sliding in, drawers sliding. All disabled with `prefers-reduced-motion` (wheel result is instant, no fly).

## Components
Ticker, sticky header (logo, search, cart with badge), hero, flash band (countdown, stock bars), category chips + sort + filters button, product card (art, -% sticker, badge, price, rating sample, sold, low stock, add), quick view dialog, cart drawer with checkout steps, filters drawer/bottom sheet, wheel dialog, sticky free-shipping bar, social toasts, final contact band, footer.

## Do's and Don'ts
- Do keep black text on red and yellow; label ratings, viewers and purchase toasts as sample data.
- Do keep cards at fixed aspect ratio and reserved line heights (no CLS).
- Don't use pills, blur glass, gradients, photos, or any real marketplace name, logo or colour scheme.
- Don't animate the h1 (LCP).

## Responsive Behavior
390 px: header in two rows (logo + cart, then search), filters as bottom sheet, quick view as bottom sheet, 2-col grid. 1440 px: one-row header, filters as right drawer, quick view as 2-column modal, 5-col grid.

## Agent Prompt Guide
"Brinco: loud neo-brutalist deals marketplace. Rubik 900 uppercase, #FF2E4D / #FFE600 / #111 with hard 4px shadows, 3px radius, rotated discount stickers, black ticker, yellow flash band with countdown, prize wheel. Black text on colour. No pills, no gradients, no photos."
