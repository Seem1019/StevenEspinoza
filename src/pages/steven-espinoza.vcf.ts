import type { APIRoute } from 'astro';
import { buildVCard } from '../lib/vcard';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ? new URL(import.meta.env.BASE_URL, site).href : undefined;
  return new Response(buildVCard(siteUrl), {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  });
};
