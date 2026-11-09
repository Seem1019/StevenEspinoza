/**
 * Demo registry. Adding a demo = add an entry here + follow `.claude/skills/new-client-demo`.
 * Copy (titles, descriptions) lives in `src/i18n/<lang>/<slug>.json` under `meta.*`.
 */
export interface DemoEntry {
  slug: string;
  /** i18n namespace (= slug). */
  ns: string;
  sector: 'ecommerce' | 'restaurant' | 'premium' | 'saas';
  /** Colors used only by the portfolio card frame (the demo itself owns its palette). */
  card: { bg: string; fg: string; accent: string };
  /** Techniques shown in the gallery dialog (keys in common.techniques.*). */
  techniques: string[];
}

export const demos: DemoEntry[] = [
  {
    slug: 'brinco',
    ns: 'brinco',
    sector: 'ecommerce',
    card: { bg: '#0B0C10', fg: '#FFFFFF', accent: '#FF3B1D' },
    techniques: ['infiniteCatalog', 'urlState', 'gamification', 'inp'],
  },
  {
    slug: 'lumbre',
    ns: 'lumbre',
    sector: 'restaurant',
    card: { bg: '#1A0F0A', fg: '#F6E7D2', accent: '#E8742C' },
    techniques: ['scrollWorld', 'cssScroll', 'reservation', 'zeroVideo'],
  },
  {
    slug: 'isola',
    ns: 'isola',
    sector: 'premium',
    card: { bg: '#E9ECEF', fg: '#16191D', accent: '#4C6A5C' },
    techniques: ['threeD', 'cssScroll', 'lazyIslands', 'typography'],
  },
  {
    slug: 'turnio',
    ns: 'turnio',
    sector: 'saas',
    card: { bg: '#0B3D2E', fg: '#E8FFF4', accent: '#7CF3B6' },
    techniques: ['conversion', 'pricingToggle', 'faq', 'socialProof'],
  },
];

export const getDemo = (slug: string) => demos.find((d) => d.slug === slug);
