/** Motion helpers for the agents engine: easing, curved cursor paths, a seeded RNG (same run every time). */
export interface Pt { x: number; y: number }

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** mulberry32 */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

/**
 * Human-ish pointer path: a bent cubic curve with ease-in-out (accelerates, then brakes), and on long
 * trips an overshoot followed by a short correction back onto the target.
 */
export function makePath(a: Pt, b: Pt, r: () => number, bendScale = 1): (t: number) => Pt {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d, ny = dx / d;
  const side = r() < 0.5 ? -1 : 1;
  const bend = Math.min(d * (0.12 + r() * 0.16), 140) * side * bendScale;
  const c1 = { x: a.x + dx * 0.28 + nx * bend, y: a.y + dy * 0.28 + ny * bend };
  const c2 = { x: a.x + dx * 0.72 + nx * bend * 0.55, y: a.y + dy * 0.72 + ny * bend * 0.55 };
  const over = d > 180 && r() < 0.6 ? 6 + r() * 12 : 0;
  if (!over) return (t) => cubic(a, c1, c2, b, easeInOut(t));
  const o = { x: b.x + (dx / d) * over + nx * over * 0.5 * side, y: b.y + (dy / d) * over + ny * over * 0.5 * side };
  return (t) => {
    if (t < 0.8) return cubic(a, c1, c2, o, easeInOut(t / 0.8));
    const k = easeOut((t - 0.8) / 0.2);
    return { x: lerp(o.x, b.x, k), y: lerp(o.y, b.y, k) };
  };
}

/** Travel time grows with distance (Fitts-like), ms. */
export const travelMs = (d: number) => clamp(420 + d * 0.5, 480, 1250);
