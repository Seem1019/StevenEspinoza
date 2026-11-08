/**
 * Brinco catalog: 240 fictional products generated deterministically (seeded PRNG) from the i18n vocabulary.
 * The numeric skeleton (prices, stock, badges, art) is language-independent, so product #N is the same in es/en.
 * Shared by the page (first batch, SSR), the JSON endpoints (batches + compact index) and BuildPreview.
 */
import type { Lang } from '../../i18n';

export const TOTAL = 240;
export const BATCH = 24;
export const BATCHES = TOTAL / BATCH; // 10 (batch 0 is in the initial HTML)
export const FREE_SHIP = 29; // USD
export const COUPON = { code: 'BRINCO15', pct: 15 };
export const SHIP_STD = 3.99;
export const SHIP_EXPRESS = 6.99;

/** Bright per-product backgrounds for the SVG art. */
export const BG = ['#FFE600', '#FF8FA3', '#7CF0FF', '#B6FF5C', '#FFB020', '#C9A7FF', '#5CFFB0', '#FF9E6B', '#9EC9FF', '#FFF27A'];
export const BADGES = ['', 'flash', 'hot', 'new', 'top'] as const;

/** [id, name, cat, priceCents, origCents, rating x10, sold, stock, badge, bg, icon] */
export type Tuple = [number, string, number, number, number, number, number, number, number, number, number];

export interface Vocab { cats: string[]; nouns: string[][]; adjs: string[] }

export interface Product {
  id: number; name: string; cat: number; price: number; orig: number; off: number;
  rating: number; sold: number; stock: number; badge: number; bg: number; icon: number;
}

export const locale = (lang: Lang) => (lang === 'es' ? 'es-CO' : 'en-US');

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// USD price range per category: tech, home, beauty, fashion, sports, toys, kitchen, pets
const RANGE: [number, number][] = [[9, 89], [4, 49], [2, 29], [4, 39], [5, 59], [3, 35], [3, 45], [2, 29]];

interface Raw { cat: number; noun: number; adj: number; price: number; orig: number; rating: number; sold: number; stock: number; badge: number; bg: number; icon: number }

let rawCache: Raw[] | null = null;
function skeleton(): Raw[] {
  if (rawCache) return rawCache;
  const rnd = mulberry32(0xb21c0);
  const int = (n: number) => Math.floor(rnd() * n);
  const used = new Set<string>();
  const out: Raw[] = [];
  for (let i = 0; i < TOTAL; i++) {
    // round-robin-ish categories so every batch is mixed
    const cat = (i + int(3) * 3) % 8;
    let noun = int(8);
    let adj = int(16);
    while (used.has(`${cat}-${noun}-${adj}`)) { adj = (adj + 1) % 16; if (adj === 0) noun = (noun + 1) % 8; }
    used.add(`${cat}-${noun}-${adj}`);
    const [min, max] = RANGE[cat];
    const price = Math.max(199, Math.round(min + Math.pow(rnd(), 1.6) * (max - min)) * 100 - 1);
    const d = 30 + int(56);
    const orig = Math.max(price + 100, Math.round(price / (1 - d / 100) / 100) * 100 - 1);
    const b = rnd();
    const badge = b < 0.14 ? 1 : b < 0.28 ? 2 : b < 0.38 ? 3 : b < 0.48 ? 4 : 0;
    const low = badge === 1 || rnd() < 0.25;
    out.push({
      cat, noun, adj, price, orig,
      rating: 38 + int(12),
      sold: Math.floor(50 + Math.pow(rnd(), 3) * 48000),
      stock: low ? 2 + int(10) : 14 + int(80),
      badge,
      bg: int(BG.length),
      icon: cat * 2 + (noun % 2),
    });
  }
  rawCache = out;
  return out;
}

export function buildCatalog(v: Vocab): Tuple[] {
  return skeleton().map((r, i) => [
    i + 1, `${v.nouns[r.cat][r.noun]} ${v.adjs[r.adj]}`, r.cat, r.price, r.orig, r.rating, r.sold, r.stock, r.badge, r.bg, r.icon,
  ]);
}

export function decode(t: Tuple): Product {
  const [id, name, cat, price, orig, rating, sold, stock, badge, bg, icon] = t;
  return { id, name, cat, price, orig, off: Math.round((1 - price / orig) * 100), rating, sold, stock, badge, bg, icon };
}

/** Flash band: first 8 products with the flash badge (low stock by construction). */
export const flashPicks = (all: Tuple[]) => all.filter((t) => t[8] === 1).slice(0, 8);

/** Deterministic "% claimed" for the stock bars. */
export const claimed = (p: { id: number; stock: number }) => Math.min(96, 58 + ((p.id * 37) % 30) + (p.stock < 6 ? 8 : 0));
