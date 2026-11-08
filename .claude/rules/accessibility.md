---
paths:
  - "src/**/*.astro"
  - "src/**/*.css"
---
# Accessibility (Lighthouse a11y ≥ 95, WCAG 2.2 AA intent)

- Landmarks (`header`, `nav` with `aria-label`, `main#main`, `footer`), skip link (BaseLayout), exactly one `h1` per page, no skipped heading levels inside a section.
- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24px or 19px bold). Check accent-on-colour combinations, badges and disabled states.
- Every control has an accessible name; icon-only buttons get `aria-label`. Inputs have `<label>`.
- Touch targets ≥ 44×44px on mobile.
- Dialogs: native `<dialog>` + `showModal()`, labelled (`aria-labelledby`), Esc closes, focus returns to the opener, background inert (native).
- Live updates (cart count, toasts, coupon won, showcase done) through `aria-live="polite"`.
- Decorative SVG `aria-hidden="true"`; meaningful SVG `role="img"` + label. Scaled previews/thumbnails are `inert` + `aria-hidden`.
- `prefers-reduced-motion: reduce` disables non-essential motion everywhere (scroll-driven animations, 3D rotation, wheel spin, view transitions, typing effects).
- Visible `:focus-visible` outline on every interactive element.
