/**
 * i18n helpers. All user-visible text lives in `src/i18n/<lang>/<namespace>.json`.
 * Namespaces: `common` (site chrome), `home`, `showcase`, one per demo (`brinco`, `lumbre`...).
 *
 * The build FAILS if a namespace has different keys in es and en, or a key is missing:
 * that is how we keep "no i18n warnings".
 */
export const locales = ['es', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'es';

type Dict = Record<string, unknown>;
const modules = import.meta.glob<Dict>('./*/*.json', { eager: true, import: 'default' });

const dicts: Record<Lang, Record<string, Dict>> = { es: {}, en: {} };
for (const [path, dict] of Object.entries(modules)) {
  const m = path.match(/^\.\/(\w+)\/([\w-]+)\.json$/);
  if (!m) continue;
  const [, lang, ns] = m;
  if ((locales as readonly string[]).includes(lang)) dicts[lang as Lang][ns] = dict;
}

function flatKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [prefix];
  return Object.entries(obj as Dict).flatMap(([k, v]) => flatKeys(v, prefix ? `${prefix}.${k}` : k));
}

// Parity check es <-> en (runs once at build / dev start).
for (const ns of new Set([...Object.keys(dicts.es), ...Object.keys(dicts.en)])) {
  const a = new Set(flatKeys(dicts.es[ns] ?? {}));
  const b = new Set(flatKeys(dicts.en[ns] ?? {}));
  const onlyEs = [...a].filter((k) => !b.has(k));
  const onlyEn = [...b].filter((k) => !a.has(k));
  if (onlyEs.length || onlyEn.length) {
    throw new Error(
      `[i18n] Namespace "${ns}" differs between es and en.\n  only es: ${onlyEs.join(', ') || '-'}\n  only en: ${onlyEn.join(', ') || '-'}`,
    );
  }
}

function lookup(lang: Lang, ns: string, key: string): unknown {
  let node: unknown = dicts[lang][ns];
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Dict)[part];
  }
  return node;
}

/** Returns a translator bound to a language and namespace. `t('a.b', { n: 3 })` replaces `{n}`. */
export function useT(lang: Lang, ns = 'common') {
  function t(key: string, vars?: Record<string, string | number>): string {
    const value = lookup(lang, ns, key);
    if (typeof value !== 'string') throw new Error(`[i18n] Missing string "${ns}:${key}" (${lang})`);
    return vars ? value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : value;
  }
  /** Raw access for arrays/objects (lists of FAQs, products...). */
  t.raw = <T = unknown>(key: string): T => {
    const value = lookup(lang, ns, key);
    if (value === undefined) throw new Error(`[i18n] Missing "${ns}:${key}" (${lang})`);
    return value as T;
  };
  return t;
}

export const isLang = (v: string | undefined): v is Lang => !!v && (locales as readonly string[]).includes(v);

/** getStaticPaths helper for `src/pages/[lang]/...` routes. */
export const langPaths = () => locales.map((lang) => ({ params: { lang } }));

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Builds an internal URL with base + locale + trailing slash. `path` like 'demos/brinco/' or '' for home. */
export function localePath(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  const [p, rest = ''] = clean.split(/(?=[?#])/);
  const withSlash = p === '' || p.endsWith('/') ? p : `${p}/`;
  return `${BASE}${lang}/${withSlash}${rest}`;
}

/** Asset/endpoint URL under the base (no locale). */
export const baseUrl = (path = '') => `${BASE}${path.replace(/^\/+/, '')}`;

/** Same page in the other language: swaps the locale segment of the current pathname. */
export function switchLangPath(pathname: string, to: Lang): string {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '');
  const parts = rel.split('/');
  if (isLang(parts[0])) parts[0] = to;
  else parts.unshift(to);
  return BASE + parts.join('/');
}
