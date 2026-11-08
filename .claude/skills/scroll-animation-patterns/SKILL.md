---
name: scroll-animation-patterns
description: The project's scroll-driven animation patterns (CSS animation-timeline with scroll()/view(), animation-range, sticky stages, parallax, reveal) and their mandatory fallback for browsers without support and for reduced motion. Use whenever adding or changing anything that animates with scroll in this portfolio.
---

# Scroll-driven animation patterns

Support (Nov 2026): Chrome/Edge 115+, Safari 26+, Firefox 159+. Older Firefox has none → the fallback must look finished, not broken. Source: MDN "Scroll-driven animations" guide.

## The rule
1. **Default CSS = final state.** Content is fully visible and laid out without any animation.
2. Animation only inside both guards:
   ```css
   @supports (animation-timeline: view()) {
     @media (prefers-reduced-motion: no-preference) { /* scroll-driven stuff */ }
   }
   ```
3. `animation-timeline` goes **after** the `animation` shorthand (the shorthand resets it). Use `linear` and `both`.
4. Only `transform` and `opacity` (and `clip-path` sparingly). Never animate layout properties.
5. Never apply a reveal to the LCP element.
6. JS only when CSS can't (e.g. driving a WebGL scene from scroll): passive scroll listener → read once per rAF → write a CSS variable or render. Active only while the section is in view (IntersectionObserver).

## Patterns

### Reveal on enter
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }
  }
}
@keyframes reveal { from { opacity: 0; transform: translateY(32px); } }
```

### Reading progress / top bar
```css
.progress { transform-origin: 0 50%; transform: scaleX(1); }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .progress { animation: grow linear both; animation-timeline: scroll(root block); }
  }
}
@keyframes grow { from { transform: scaleX(0); } }
```

### Sticky stage driven by a tall track (scroll-world, 3D-like explode)
```css
.track { height: 400svh; view-timeline: --track block; }
.stage { position: sticky; top: 0; height: 100svh; overflow: clip; }
.layer-door {
  animation: dolly linear both;
  animation-timeline: --track;
  animation-range: contain 0% contain 25%;
}
/* Share a named timeline with elements outside the track's subtree: */
.world { timeline-scope: --track; }
@keyframes dolly { to { transform: scale(2.4); opacity: 0; } }
```
Fallback: without support / with reduced motion, `.track` gets `height: auto` and scenes stack as normal full-height sections (`@supports not (animation-timeline: view())` or the reduced-motion media query resets `position: sticky` and the track height).

### Parallax layers
`translate: 0 calc(var(--depth) * -40px)` inside keyframes with `animation-range: cover 0% cover 100%`; depth per layer via a custom property. Keep 3–4 layers max.

### Horizontal scroller progress
`scroll-timeline: --x inline` on the scroller, `animation-timeline: --x` on the indicator.

## Checklist
- [ ] Looks complete with animations disabled (test with Playwright `reducedMotion: 'reduce'`).
- [ ] No layout shift: animated elements keep their box (transform only).
- [ ] `animation-timeline` after the shorthand; `linear both`.
- [ ] LCP element not animated.
- [ ] Sticky stages use `svh` heights and `overflow: clip`.
- [ ] Tested at 390px and 1440px.
