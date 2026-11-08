/** Compact index of all 240 products (tuples) for client-side filtering, sorting and search. */
import type { APIRoute } from 'astro';
import { langPaths, useT, type Lang } from '../../../../../i18n';
import { buildCatalog, TOTAL, type Vocab } from '../../../../../demos/brinco/catalog';

export const getStaticPaths = langPaths;

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const items = buildCatalog(useT(lang, 'brinco').raw<Vocab>('catalogVocab'));
  return new Response(JSON.stringify({ total: TOTAL, items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
