/** Locale formatting shared by SSR (Card.astro) and the client. Currency: USD everywhere, Intl per locale. */
const cache = new Map<string, Intl.NumberFormat>();
function nf(loc: string, kind: 'm' | 'c' | 'd'): Intl.NumberFormat {
  const key = loc + kind;
  let f = cache.get(key);
  if (!f) {
    f =
      kind === 'm'
        ? new Intl.NumberFormat(loc, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : kind === 'c'
          ? new Intl.NumberFormat(loc, { notation: 'compact', maximumFractionDigits: 1 })
          : new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    cache.set(key, f);
  }
  return f;
}
export const money = (cents: number, loc: string) => nf(loc, 'm').format(cents / 100);
/** Whole-dollar amounts (thresholds in copy). */
export const moneyShort = (usd: number, loc: string) =>
  new Intl.NumberFormat(loc, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd);
export const compact = (n: number, loc: string) => nf(loc, 'c').format(n);
export const dec1 = (r10: number, loc: string) => nf(loc, 'd').format(r10 / 10);
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
export const rot = (id: number) => ((id * 7) % 5) * 4 - 8;
export const CAT_SLUGS = ['tech', 'home', 'beauty', 'fashion', 'sports', 'toys', 'kitchen', 'pets'];
