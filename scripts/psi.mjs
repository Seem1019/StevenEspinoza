/**
 * PageSpeed Insights API (mobile) for PUBLIC URLs, after deploying.
 * Usage: npm run psi -- https://seem1019.github.io/StevenEspinoza/es/ [more urls]
 *        (no args → all main pages under SITE, default https://seem1019.github.io/StevenEspinoza/)
 * Optional: PSI_API_KEY env var (without it the API works but is rate-limited).
 * Writes reports/psi.md. New sites have no CrUX field data for weeks: lab scores are what counts.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const SITE = (process.env.SITE ?? 'https://seem1019.github.io/StevenEspinoza/').replace(/\/?$/, '/');
const PATHS = ['es/', 'en/', 'es/showcase/', 'es/demos/brinco/', 'es/demos/lumbre/', 'es/demos/isola/', 'es/demos/turnio/'];
const urls = process.argv.slice(2).length ? process.argv.slice(2) : PATHS.map((p) => SITE + p);
const key = process.env.PSI_API_KEY ? `&key=${process.env.PSI_API_KEY}` : '';
const cats = ['performance', 'accessibility', 'best-practices', 'seo'];

const rows = [];
for (const url of urls) {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${cats.map((c) => `&category=${c}`).join('')}${key}`;
  const res = await fetch(api);
  if (!res.ok) { console.log(`ERR ${url}: ${res.status} ${await res.text()}`); continue; }
  const j = await res.json();
  const lhr = j.lighthouseResult;
  const s = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
  const a = (k) => lhr.audits[k]?.displayValue ?? '-';
  const field = j.loadingExperience?.overall_category ?? 'no field data (CrUX) yet';
  const row = `| ${url} | ${s('performance')} | ${s('accessibility')} | ${s('best-practices')} | ${s('seo')} | ${a('largest-contentful-paint')} | ${a('cumulative-layout-shift')} | ${a('total-blocking-time')} | ${field} |`;
  rows.push(row);
  console.log(row);
}
const md = [
  `# PageSpeed Insights (mobile) — ${new Date().toISOString()}`,
  '',
  '| URL | Perf | A11y | BP | SEO | LCP | CLS | TBT | Field (CrUX) |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows,
].join('\n');
await mkdir('reports', { recursive: true });
await writeFile('reports/psi.md', md + '\n');
console.log('\nreports/psi.md written');
