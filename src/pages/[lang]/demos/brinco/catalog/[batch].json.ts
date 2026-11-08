/** Static catalog batches (24 products each) for infinite scroll. Batch 0 is rendered in the page HTML. */
import type { APIRoute } from 'astro';
import { locales, useT, type Lang } from '../../../../../i18n';
import { buildCatalog, BATCH, BATCHES, TOTAL, type Vocab } from '../../../../../demos/brinco/catalog';

export function getStaticPaths() {
  return locales.flatMap((lang) =>
    Array.from({ length: BATCHES - 1 }, (_, i) => ({ params: { lang, batch: String(i + 1) } })),
  );
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const b = Number(params.batch);
  const all = buildCatalog(useT(lang, 'brinco').raw<Vocab>('catalogVocab'));
  const items = all.slice(b * BATCH, (b + 1) * BATCH);
  return new Response(JSON.stringify({ batch: b, total: TOTAL, items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
