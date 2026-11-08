/**
 * Lighthouse (mobile, same lab engine as PageSpeed Insights) over `astro preview`.
 * Usage: npm run build && npm run lighthouse [-- path1 path2 ...]
 * Writes reports/lighthouse/<page>.html|json and reports/lighthouse/summary.md
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const PORT = 4330;
const BASE = `http://localhost:${PORT}/steven-espinoza/`;
const DEFAULT_PATHS = ['es/', 'en/', 'es/showcase/', 'es/demos/brinco/', 'es/demos/lumbre/', 'es/demos/isola/', 'es/demos/turnio/'];
const paths = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PATHS;
const OUT = 'reports/lighthouse';
const TARGET = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 };

async function waitFor(url, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`preview did not start at ${url}`);
}

const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
let chrome;
try {
  await waitFor(BASE + 'es/');
  await mkdir(OUT, { recursive: true });
  chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-first-run'] });
  const rows = [];
  for (const p of paths) {
    const url = BASE + p;
    const res = await lighthouse(url, { port: chrome.port, output: ['html', 'json'], logLevel: 'error' }); // default config = mobile
    const lhr = res.lhr;
    const name = p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
    await writeFile(`${OUT}/${name}.html`, res.report[0]);
    await writeFile(`${OUT}/${name}.json`, res.report[1]);
    const s = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
    const a = (k) => lhr.audits[k]?.displayValue ?? '-';
    const row = { page: p, perf: s('performance'), a11y: s('accessibility'), bp: s('best-practices'), seo: s('seo'), lcp: a('largest-contentful-paint'), cls: a('cumulative-layout-shift'), tbt: a('total-blocking-time'), fcp: a('first-contentful-paint') };
    const ok = row.perf >= TARGET.performance && row.a11y >= TARGET.accessibility && row.bp >= TARGET['best-practices'] && row.seo >= TARGET.seo;
    row.ok = ok ? 'yes' : 'NO';
    rows.push(row);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${p}  perf ${row.perf} a11y ${row.a11y} bp ${row.bp} seo ${row.seo}  LCP ${row.lcp} CLS ${row.cls} TBT ${row.tbt}`);
    if (!ok) {
      const failing = Object.values(lhr.audits).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable').slice(0, 8).map((x) => `   - ${x.id}: ${x.displayValue ?? x.score}`);
      console.log(failing.join('\n'));
    }
  }
  const md = [
    `# Lighthouse (mobile, lab) — ${new Date().toISOString()}`,
    '',
    '| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | Meets target |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.page} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.fcp} | ${r.ok} |`),
  ].join('\n');
  await writeFile(`${OUT}/summary.md`, md + '\n');
  console.log(`\n${OUT}/summary.md written`);
} finally {
  await chrome?.kill();
  preview.kill();
  if (process.platform === 'win32' && preview.pid) spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
}
