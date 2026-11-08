---
name: Lumbre — cocina de fuego
version: 1
tokens:
  color:
    char: "#120c09"        # page background (charcoal with brown undertone)
    char-2: "#1b120d"      # raised surfaces (cards, sheet)
    soot: "#261a13"        # chips, inputs
    line: "#3a2a1f"        # hairlines
    ember: "#e8742c"       # primary accent / CTA background
    ember-ink: "#1a0f0a"   # text on ember
    flame: "#f4a547"       # highlights, prices
    glow: "#ffd28a"        # focus ring, lit windows
    brass: "#c9a15a"       # borders, icons, rail
    text: "#f6e7d2"        # warm light text
    muted: "#cdb8a0"       # secondary text
    dim: "#a28c76"         # tertiary text (>= 4.5:1 on char)
  font:
    display: "Fraunces 400–700, normal style only"
    body: "Work Sans 400–600"
  radius: { sm: 4px, md: 6px, lg: 12px }
  space: { gutter: "clamp(16px, 5vw, 64px)", section: "clamp(72px, 12vw, 160px)" }
  motion: { ease: "cubic-bezier(0.22, 1, 0.36, 1)", fast: 160ms, base: 320ms }
---

## Overview
A wood-fire restaurant presented as a **scroll-world**: the visitor walks in. Entrada (night façade) →
Barra (back bar, pendant lamps) → Cocina (open grill, flames, embers, smoke) → Mesa (set table, reservation).
A tall scroll track drives a sticky 100svh stage; each scene is 3–4 layered SVG planes plus a few HTML
particles. The "camera" is CSS: the outgoing scene pushes into its focal point (the door, the pass, the
grill) while the next one fades in and settles. Zero video, text LCP.

## Colors
Dark and appetizing: charcoal-brown background, ember orange for action, brass for structure, warm
cream **text** (never a cream background). Light inside the illustrations is always warm (2200–3000 K);
the only cool tone is the night sky of the façade.

## Typography
Fraunces (normal, 500–650) for titles and prices — soft, old-world serif with heat. Work Sans for
everything else. No italics, no monospace, no numbered eyebrows. Titles: sentence case, tight tracking.

## Layout
- World: `.lb-world` grid, stage and track in the same cell; stage `position: sticky; height: 100svh`.
- Track: segments 135svh (entrada, barra, cocina) + 100svh (mesa).
- Copy per scene bottom-left (desktop) / bottom (mobile) over a scrim. Rail on the right edge.
- After the world: menu (tabs), hours + address, contact band, footer. Max width 1180px.

## Elevation & Depth
Depth comes from the illustrations (back / mid / front parallax planes) and light, not shadows. Surfaces
are flat with 1px brass/line borders; the reservation sheet is the only elevated element.

## Shapes
Rectangles with 4–6px radius, arched door/window motifs, round dish icons. No pills.

## Motion
- Scroll-driven (CSS `view-timeline` per track segment + `timeline-scope`): scene fade-in, camera scale
  in, push-out into the focal point, per-layer parallax, copy in/out, rail fill, header solidify.
- Ambient (keyframes, transform/opacity only): flames, embers, smoke, lamp sway, sign flicker. Paused
  when the scene is not on screen (`.is-live` via IntersectionObserver).
- Fallbacks: no `animation-timeline`/`timeline-scope` or reduced motion → four stacked static scenes.

## Components
Header (wordmark, Carta, Horario, Reservar), scene copy (title, line, tags), progress rail (4 buttons),
menu tabs (role=tablist, ?menu=), dish rows (icon, name, line, price), hours card, address card with
mini-map, reservation sheet (`<dialog>`, ?reserva=1), contact band, footer.

## Do's and Don'ts
- Do keep the h1 and tagline visible in the first paint. Do keep every scene beautiful when static.
- Do label fictional data (address, prices). Don't show people photos (silhouettes only).
- Don't use cream backgrounds, pill buttons, italics, monospace labels or purple gradients.

## Responsive Behavior
Art is drawn on a 1600×1000 canvas with `xMidYMid slice`; every focal element lives in the central
x 580–1020 band so a 390px portrait viewport still frames door, bar, grill and table. Rail becomes
dots-only on mobile. Sheet is a bottom sheet < 760px and a right drawer above.

## Agent Prompt Guide
"Dark wood-fire restaurant, charcoal #120c09, ember #e8742c, brass #c9a15a, warm cream text #f6e7d2,
Fraunces display + Work Sans, layered SVG night façade → bar → open grill → table, CSS scroll camera."
