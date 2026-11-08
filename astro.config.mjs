// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// GitHub Pages: the deploy workflow injects SITE_URL and BASE_PATH from actions/configure-pages.
// Local default matches the expected repo name (this folder's name).
const site = process.env.SITE_URL || 'https://seem1019.github.io';
// `??` on purpose: configure-pages returns "" for a <user>.github.io repo (served at root).
const base = (process.env.BASE_PATH ?? '/steven-espinoza') || '/';

const latin = /** @type {[string]} */ (['latin']);

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  // ClientRouter enables prefetchAll by default; hover is the default strategy,
  // key links opt into `data-astro-prefetch="viewport"`.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  fonts: [
    // Portfolio brand
    { provider: fontProviders.fontsource(), name: 'Bricolage Grotesque', cssVariable: '--font-brand-display', weights: ['500 800'], subsets: latin, display: 'swap', fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'Instrument Sans', cssVariable: '--font-brand-body', weights: ['400 700'], subsets: latin, display: 'swap', fallbacks: ['system-ui', 'sans-serif'] },
    // Demo: Brinco (e-commerce)
    { provider: fontProviders.fontsource(), name: 'Rubik', cssVariable: '--font-brinco', weights: ['400 900'], subsets: latin, display: 'swap', fallbacks: ['system-ui', 'sans-serif'] },
    // Demo: Lumbre (restaurant)
    { provider: fontProviders.fontsource(), name: 'Fraunces', cssVariable: '--font-lumbre-display', weights: ['400 700'], styles: ['normal'], subsets: latin, display: 'swap', fallbacks: ['Georgia', 'serif'] },
    { provider: fontProviders.fontsource(), name: 'Work Sans', cssVariable: '--font-lumbre-body', weights: ['400 600'], subsets: latin, display: 'swap', fallbacks: ['system-ui', 'sans-serif'] },
    // Demo: Isola (premium audio)
    { provider: fontProviders.fontsource(), name: 'Manrope', cssVariable: '--font-isola', weights: ['200 700'], subsets: latin, display: 'swap', fallbacks: ['system-ui', 'sans-serif'] },
    // Demo: Turnio (SaaS)
    { provider: fontProviders.fontsource(), name: 'Plus Jakarta Sans', cssVariable: '--font-turnio', weights: ['400 800'], subsets: latin, display: 'swap', fallbacks: ['system-ui', 'sans-serif'] },
  ],
});
