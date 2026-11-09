/**
 * Isometric cube geometry for Tesela's illustrations (build time only, no client JS).
 * A cube at (x, y, z) fills [x, x+1] × [y, y+1] × [z, z+1]. Screen: X = (x − y)·cos30·s, Y = (x + y)·½·s − z·s.
 * Visible faces: top (z+1), right (x+1 plane) and left (y+1 plane). Painter's order: x + y + z ascending.
 * Faces are filled with CSS variables (see tesela.css) so the dark theme swaps them.
 */
export interface Cube { x: number; y: number; z: number; ink?: boolean }
export interface Stack { cubes: Cube[]; depth: number; key?: boolean }

const C = Math.cos(Math.PI / 6);
const r = (n: number) => Math.round(n * 10) / 10;

export const project = (x: number, y: number, z: number, s: number): [number, number] => [(x - y) * C * s, (x + y) * 0.5 * s - z * s];

const poly = (pts: [number, number, number][], s: number) =>
  pts.map(([x, y, z]) => project(x, y, z, s).map(r).join(',')).join(' ');

export interface Faces { top: string; left: string; right: string; ink: boolean }

export function faces({ x, y, z, ink = false }: Cube, s: number): Faces {
  const t = z + 1;
  return {
    ink,
    top: poly([[x, y, t], [x + 1, y, t], [x + 1, y + 1, t], [x, y + 1, t]], s),
    right: poly([[x + 1, y, t], [x + 1, y + 1, t], [x + 1, y + 1, z], [x + 1, y, z]], s),
    left: poly([[x, y + 1, t], [x + 1, y + 1, t], [x + 1, y + 1, z], [x, y + 1, z]], s),
  };
}

export const sortCubes = (cubes: Cube[]) => [...cubes].sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z) || a.z - b.z);

/** Bounding box (screen units) of a set of cubes, with padding. */
export function bbox(cubes: Cube[], s: number, pad = 2) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of cubes) {
    for (const [dx, dy, dz] of [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 0], [1, 0, 0], [0, 1, 0]]) {
      const [X, Y] = project(c.x + dx, c.y + dy, c.z + dz, s);
      minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
    }
  }
  return { x: r(minX - pad), y: r(minY - pad), w: r(maxX - minX + pad * 2), h: r(maxY - minY + pad * 2) };
}

/** Floor lattice (one path) of diamond tiles for the grid cells in [x0, x1) × [y0, y1). */
export function floor(cells: [number, number][], s: number): string {
  return cells.map(([x, y]) => `M${poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], s).replace(/ /g, 'L')}Z`).join('');
}

/** Small deterministic pseudo-random sequence (same SVG on every build). */
export function seq(seed: number) {
  let v = seed;
  return () => ((v = (v * 9301 + 49297) % 233280) / 233280);
}

/** Hero landscape: stacks along a wide diagonal band, a solid ink keystone in the middle. */
export function landscape(): { stacks: Stack[]; tiles: [number, number][] } {
  const rnd = seq(7);
  const stacks: Stack[] = [];
  const tiles: [number, number][] = [];
  const used = new Set<string>();
  for (let u = -24; u <= 24; u += 2) {
    const near = Math.abs(u) < 4;
    const v = near ? 6 : 2 + Math.floor(rnd() * 3) * 2; // u + v even -> integer x, y
    const x = (u + v) / 2, y = (v - u) / 2;
    const edge = 1 - Math.abs(u) / 26;
    const h = near ? 3 : Math.max(1, Math.round(1 + edge * 3 * rnd() + (rnd() > 0.82 ? 1 : 0)));
    const cubes: Cube[] = [];
    for (let z = 0; z < h; z++) cubes.push({ x, y, z });
    const key = u === 0;
    if (key) cubes.push({ x, y, z: h, ink: true });
    // a few stacks get a companion cube in front (more depth)
    if (!near && rnd() > 0.6) {
      const c = { x: x + 1, y: y + 1, z: 0 };
      stacks.push({ cubes: [c], depth: 0.2 });
      used.add(`${c.x},${c.y}`);
    }
    stacks.push({ cubes, depth: key ? 0 : 0.35 + rnd() * 0.65, key });
    used.add(`${x},${y}`);
  }
  for (let u = -26; u <= 26; u++) {
    for (let v = 1; v <= 9; v++) {
      if ((u + v) % 2) continue;
      const x = (u + v) / 2, y = (v - u) / 2;
      if (!used.has(`${x},${y}`)) tiles.push([x, y]);
    }
  }
  stacks.sort((a, b) => a.cubes[0].x + a.cubes[0].y - (b.cubes[0].x + b.cubes[0].y));
  return { stacks, tiles };
}

/** Objects for the work cards and process panels (each a short list of cubes). */
export const objects: Record<string, Cube[]> = {
  // Pliego: a pile of thin "sheets" (flat cubes look like stacked documents) with an ink marker
  pliego: [
    { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 0, y: 1, z: 1 },
    { x: 0, y: 0, z: 2 }, { x: 1, y: 1, z: 1, ink: true },
  ],
  // Rutero: a path of cubes stepping across the floor
  rutero: [
    { x: 0, y: 2, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 0, z: 0 },
    { x: 3, y: 0, z: 0 }, { x: 3, y: 0, z: 1, ink: true }, { x: 0, y: 2, z: 1 },
  ],
  // Acopio: a stepped pyramid (stock that grows)
  acopio: [
    { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 },
    { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
    { x: 0, y: 0, z: 2, ink: true },
  ],
};
