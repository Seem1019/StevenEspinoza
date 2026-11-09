/**
 * Brinco client: catalog (batches + index, infinite scroll, filters), quick view, cart drawer + simulated checkout,
 * prize wheel, social-proof toasts, flash countdown. Called from onPage() → returns cleanup.
 * URL is the source of truth for open UI: ?product, ?cart(&checkout), ?filters, ?spin. Filter values via setParams.
 */
import { prefersReducedMotion, yieldToMain } from '../../../scripts/lifecycle';
import { onUrlState, openUi, closeUi, setParams, adoptDeepLink } from '../../../scripts/url-state';
import { decode, claimed, BADGES, type Tuple, type Product } from '../catalog';
import { money, compact, dec1, fill, CAT_SLUGS } from '../format';

type Dict = Record<string, any>;
interface Data {
  lang: string; loc: string; sprite: string; api: string; total: number; batch: number; batches: number; free: number;
  coupon: { code: string; pct: number }; ship: [number, number]; bg: string[]; cats: string[]; seed: Tuple[];
  s: Record<string, Dict>;
}
interface Line { id: number; q: number; n: string; p: number; o: number; i: number; b: number }
interface Cart { lines: Line[]; coupon: string | null; ship: 'std' | 'exp'; city: number; pay: string }
interface Filters { cat: number; sort: string; q: string; min: number; max: number }

const UI_KEYS = ['product', 'cart', 'checkout', 'filters', 'spin'];
const WHEEL_PRIZE = 4; // index of "-15%" segment
const WHEEL_TURN = 360 * 6 - (WHEEL_PRIZE * 45 + 22.5);
const SORTS = ['pop', 'low', 'high', 'off', 'rating'];
const CART_KEY = 'brinco:cart:v1';

const store = (kind: 'local' | 'session') => ({
  get(k: string): string | null { try { return (kind === 'local' ? localStorage : sessionStorage).getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { (kind === 'local' ? localStorage : sessionStorage).setItem(k, v); } catch { /* private mode */ } },
});
const LS = store('local');
const SS = store('session');
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function initBrinco(): (() => void) | void {
  const dataEl = document.getElementById('b-data');
  const grid = document.querySelector<HTMLUListElement>('[data-grid]');
  if (!dataEl || !grid) return;
  const D = JSON.parse(dataEl.textContent || '{}') as Data;
  const S = D.s;
  const loc = D.loc;
  const M = (cents: number) => money(cents, loc);
  const reduced = prefersReducedMotion();

  const ac = new AbortController();
  const signal = ac.signal;
  const timers = new Set<number>();
  const rafs = new Set<number>();
  const later = (fn: () => void, ms: number) => { const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const every = (fn: () => void, ms: number) => { const id = window.setInterval(fn, ms); timers.add(id); return id; };
  const stop = (id: number | undefined) => { if (id === undefined) return; clearTimeout(id); clearInterval(id); timers.delete(id); };
  const raf = (fn: () => void) => { const id = requestAnimationFrame(() => { rafs.delete(id); fn(); }); rafs.add(id); return id; };
  const on = (el: EventTarget | null | undefined, ev: string, fn: (e: any) => void, opts: AddEventListenerOptions = {}) => el?.addEventListener(ev, fn, { ...opts, signal });
  const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
  const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll(sel)] as T[];

  const known = new Map<number, Product>();
  D.seed.forEach((t) => known.set(t[0], decode(t)));

  // ---------------------------------------------------------------- Catalog index / batches
  let index: Product[] | null = null;
  let indexP: Promise<Product[]> | null = null;
  const ensureIndex = () => {
    if (index) return Promise.resolve(index);
    indexP ??= fetch(`${D.api}all.json`)
      .then((r) => r.json())
      .then((j: { items: Tuple[] }) => {
        index = j.items.map(decode);
        index.forEach((p) => known.set(p.id, p));
        return index;
      })
      .catch((e) => { indexP = null; throw e; });
    return indexP;
  };
  const fetchBatch = (b: number) =>
    fetch(`${D.api}${b}.json`).then((r) => r.json()).then((j: { items: Tuple[] }) => j.items.map((t) => { const p = decode(t); known.set(p.id, p); return p; }));

  // ---------------------------------------------------------------- Card rendering
  const tpl = q<HTMLTemplateElement>('#b-card-tpl');
  const makeCard = (p: Product, anim: boolean): HTMLElement => {
    const li = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    li.dataset.id = String(p.id);
    li.style.setProperty('--bg', D.bg[p.bg]);
    if (anim && !reduced) li.classList.add('is-new');
    const art = q('.bc__art', li);
    art.dataset.quick = String(p.id);
    art.setAttribute('aria-label', fill(S.card.view, { name: p.name }));
    q('use', li).setAttribute('href', `${D.sprite}#i${p.icon}`);
    q('.bc__off', li).textContent = `-${p.off}%`;
    const badge = q('.bc__badge', li);
    const bk = BADGES[p.badge];
    badge.hidden = !bk;
    badge.dataset.b = bk;
    badge.textContent = bk ? S.badges[bk] : '';
    q('.bc__name', li).textContent = p.name;
    q('.bc__now', li).textContent = M(p.price);
    q('.bc__was', li).textContent = M(p.orig);
    q('.bc__rate', li).textContent = dec1(p.rating, loc);
    q('.bc__sold', li).textContent = fill(S.card.sold, { n: compact(p.sold, loc) });
    const low = q('.bc__low', li);
    low.dataset.on = p.stock <= 11 ? '1' : '0';
    low.textContent = fill(S.card.low, { n: p.stock });
    const add = q('.bc__add', li);
    add.dataset.add = String(p.id);
    add.setAttribute('aria-label', fill(S.card.addLabel, { name: p.name }));
    return li;
  };

  // ---------------------------------------------------------------- Filters state
  const F: Filters = { cat: -1, sort: 'pop', q: '', min: 0, max: 0 };
  const readFilters = (url: URL) => {
    const sp = url.searchParams;
    F.cat = CAT_SLUGS.indexOf(sp.get('cat') || '');
    F.sort = SORTS.includes(sp.get('sort') || '') ? sp.get('sort')! : 'pop';
    F.q = (sp.get('q') || '').slice(0, 60);
    F.min = [30, 50, 70].includes(Number(sp.get('min'))) ? Number(sp.get('min')) : 0;
    const mx = Number(sp.get('max'));
    F.max = mx >= 5 && mx < 90 ? Math.round(mx / 5) * 5 : 0;
  };
  const filterParams = () => ({
    cat: F.cat >= 0 ? CAT_SLUGS[F.cat] : null, sort: F.sort !== 'pop' ? F.sort : null, q: F.q || null,
    min: F.min ? String(F.min) : null, max: F.max ? String(F.max) : null,
  });
  const isFiltered = () => F.cat >= 0 || F.sort !== 'pop' || !!F.q || !!F.min || !!F.max;
  const compute = (all: Product[]) => {
    let arr = all;
    if (F.cat >= 0) arr = arr.filter((p) => p.cat === F.cat);
    if (F.min) arr = arr.filter((p) => p.off >= F.min);
    if (F.max) arr = arr.filter((p) => p.price <= F.max * 100);
    if (F.q) {
      const terms = norm(F.q).split(/\s+/).filter(Boolean);
      arr = arr.filter((p) => { const h = norm(`${p.name} ${D.cats[p.cat]}`); return terms.every((t) => h.includes(t)); });
    }
    arr = [...arr];
    const by: Record<string, (a: Product, b: Product) => number> = {
      pop: (a, b) => a.id - b.id, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price,
      off: (a, b) => b.off - a.off || a.id - b.id, rating: (a, b) => b.rating - a.rating || b.sold - a.sold,
    };
    return arr.sort(by[F.sort]);
  };

  const catalogSec = q('[data-catalog]');
  const sentinel = q('[data-sentinel]');
  const moreBtn = q<HTMLButtonElement>('[data-more]');
  const loadingEl = q('[data-loading]');
  const endEl = q('[data-end]');
  const emptyEl = q('[data-empty]');
  const countEl = q('[data-count]');
  const searchingEl = q('[data-searching]');
  const searchInput = q<HTMLInputElement>('#b-q');
  const sortSelect = q<HTMLSelectElement>('[data-sort]');
  const maxRange = q<HTMLInputElement>('[data-f-max]');
  const maxOut = q('[data-f-max-out]');
  const applyBtn = q('[data-f-apply]');
  const filterN = q('[data-filter-n]');

  let list: Product[] | null = null; // null = default order via batches
  let rendered = grid.children.length;

  /*
   * CLS guard: every batch that will load automatically (up to 5) has its box reserved from the start
   * by "ghost" cards (clones of a real card, same height) at the end of the grid. Incoming cards
   * REPLACE ghosts in place, so nothing below the grid (final band, footer) can be on screen when the
   * grid changes. Ghosts are cheap: content-visibility: auto skips their rendering offscreen.
   */
  const ghostTpl = grid.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
  if (ghostTpl) {
    ghostTpl.dataset.ghost = '';
    ghostTpl.removeAttribute('data-id');
    ghostTpl.classList.remove('is-new');
    ghostTpl.setAttribute('aria-hidden', 'true');
    ghostTpl.setAttribute('inert', '');
  }
  const ghostEls = () => [...grid.querySelectorAll<HTMLElement>(':scope > [data-ghost]')];
  const syncGhosts = () => {
    if (!ghostTpl) return;
    const want = autoCount < 5 ? Math.max(0, Math.min((5 - autoCount) * D.batch, totalNow() - rendered)) : 0;
    const have = ghostEls();
    if (have.length > want) have.slice(want).forEach((g) => g.remove());
    else if (have.length < want) {
      const frag = document.createDocumentFragment();
      for (let k = have.length; k < want; k++) frag.append(ghostTpl.cloneNode(true));
      grid.append(frag);
    }
  };
  let autoCount = 0;
  let busy = false;
  let gen = 0;
  const totalNow = () => (list ? list.length : D.total);

  const syncFilterUI = () => {
    qa('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === (F.cat >= 0 ? CAT_SLUGS[F.cat] : ''))));
    qa('[data-min]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.min) === F.min)));
    qa('[data-sortv]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sortv === F.sort)));
    sortSelect.value = F.sort;
    maxRange.value = String(F.max || 90);
    maxOut.textContent = F.max ? fill(S.filters.priceUpTo, { v: M(F.max * 100) }) : S.filters.priceAny;
    const n = (F.cat >= 0 ? 1 : 0) + (F.min ? 1 : 0) + (F.max ? 1 : 0) + (F.q ? 1 : 0);
    filterN.hidden = n === 0;
    filterN.textContent = String(n);
  };
  const updateMeta = () => {
    const n = totalNow();
    countEl.textContent = fill(S.catalog.results, { n });
    applyBtn.textContent = fill(S.filters.apply, { n });
    emptyEl.hidden = n > 0;
    searchingEl.hidden = !F.q;
    searchingEl.textContent = F.q ? fill(S.catalog.searching, { q: F.q }) : '';
    const done = rendered >= n;
    endEl.hidden = !done || n === 0 || n <= D.batch;
    moreBtn.hidden = done || autoCount < 5;
    loadingEl.hidden = !busy;
    syncGhosts();
  };

  const renderItems = (items: Product[], g: number) =>
    new Promise<void>((res) => {
      let i = 0;
      const step = () => {
        if (g !== gen) return res();
        const frag = document.createDocumentFragment();
        for (let k = 0; k < 8 && i < items.length; k++, i++) {
          const card = makeCard(items[i], true);
          const ghost = grid.querySelector(':scope > [data-ghost]');
          if (ghost) ghost.replaceWith(card); // same box -> no layout shift
          else frag.append(card);
        }
        grid.append(frag);
        if (i < items.length) raf(step);
        else res();
      };
      raf(step);
    });

  /*
   * Trigger = the FIRST ghost, not the sentinel. Ghosts reserve all auto batches up front, so the sentinel
   * sits below ~120 empty cards and would only fire once the reader had scrolled through all of them.
   * Watching the first ghost (1200px early) loads each batch while the reader is still on the previous one.
   */
  const reobserve = () => {
    io.disconnect();
    io.observe(grid.querySelector(':scope > [data-ghost]') ?? sentinel);
  };
  const loadMore = async (auto: boolean) => {
    if (busy || rendered >= totalNow()) return;
    if (auto && autoCount >= 5) { updateMeta(); return; }
    const g = gen;
    busy = true;
    let failed = false;
    updateMeta();
    try {
      let items: Product[];
      if (list) items = list.slice(rendered, rendered + D.batch);
      else if (index) items = index.slice(rendered, rendered + D.batch);
      else items = await fetchBatch(Math.floor(rendered / D.batch));
      if (g !== gen) return;
      await renderItems(items, g);
      if (g !== gen) return;
      rendered += items.length;
      if (auto) autoCount++;
    } catch {
      failed = true; /* offline: keep what we have, retry calmly instead of in a tight loop */
    } finally {
      if (g === gen) { busy = false; updateMeta(); if (auto) { if (failed) later(reobserve, 4000); else reobserve(); } }
    }
  };
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) loadMore(true); }, { rootMargin: '1200px 0px' });
  syncGhosts();
  reobserve();
  on(moreBtn, 'click', () => loadMore(false));

  const scrollToCatalog = () => {
    if (catalogSec.getBoundingClientRect().top < 0 || catalogSec.getBoundingClientRect().top > innerHeight * 0.6)
      catalogSec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };
  const applyFilters = async (scroll = false) => {
    syncFilterUI();
    setParams(filterParams());
    const g = ++gen;
    busy = false;
    try { await ensureIndex(); } catch { return; }
    if (g !== gen || !index) return;
    list = compute(index);
    const first = list.slice(0, D.batch);
    grid.replaceChildren(...first.map((p) => makeCard(p, false)));
    rendered = first.length;
    autoCount = 0;
    updateMeta();
    if (scroll) scrollToCatalog();
    reobserve();
  };
  const resetFilters = () => { Object.assign(F, { cat: -1, sort: 'pop', q: '', min: 0, max: 0 }); searchInput.value = ''; applyFilters(); };

  // warm the index on first intent (never on an idle page)
  const warm = () => { ensureIndex().catch(() => {}); };
  ['pointerdown', 'focusin'].forEach((ev) => qa('.b-toolbar, .b-search').forEach((el) => on(el, ev, warm, { once: true })));

  on(document, 'click', (e: MouseEvent) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-cat]');
    if (b) { F.cat = CAT_SLUGS.indexOf(b.dataset.cat || ''); applyFilters(); return; }
    const m = (e.target as Element).closest<HTMLElement>('[data-min]');
    if (m) { F.min = Number(m.dataset.min); applyFilters(); return; }
    const s = (e.target as Element).closest<HTMLElement>('[data-sortv]');
    if (s) { F.sort = s.dataset.sortv!; applyFilters(); return; }
    if ((e.target as Element).closest('[data-clear]')) resetFilters();
  });
  on(sortSelect, 'change', () => { F.sort = sortSelect.value; applyFilters(); });
  let rangeT: number | undefined;
  on(maxRange, 'input', () => {
    const v = Number(maxRange.value);
    F.max = v >= 90 ? 0 : v;
    maxOut.textContent = F.max ? fill(S.filters.priceUpTo, { v: M(F.max * 100) }) : S.filters.priceAny;
    stop(rangeT);
    rangeT = later(() => applyFilters(), 140);
  });
  let searchT: number | undefined;
  on(searchInput, 'input', () => {
    stop(searchT);
    searchT = later(() => { F.q = searchInput.value.trim().slice(0, 60); applyFilters(); }, 220);
  });
  on(q('[data-search]'), 'submit', (e: Event) => {
    e.preventDefault();
    stop(searchT);
    F.q = searchInput.value.trim().slice(0, 60);
    applyFilters(true);
    if (matchMedia('(max-width: 719px)').matches) searchInput.blur();
  });
  qa('[data-scroll-catalog]').forEach((b) => on(b, 'click', () => catalogSec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })));

  // ---------------------------------------------------------------- Cart state
  const loadCart = (): Cart => {
    try {
      const c = JSON.parse(LS.get(CART_KEY) || 'null');
      if (c && Array.isArray(c.lines)) return { ship: 'std', city: 0, pay: 'card', coupon: null, ...c };
    } catch { /* ignore */ }
    return { lines: [], coupon: null, ship: 'std', city: 0, pay: 'card' };
  };
  let cart = loadCart();
  const saveCart = () => LS.set(CART_KEY, JSON.stringify(cart));
  const totals = () => {
    const sub = cart.lines.reduce((s, l) => s + l.p * l.q, 0);
    const disc = cart.coupon ? Math.round((sub * D.coupon.pct) / 100) : 0;
    const net = sub - disc;
    const freeOk = net >= D.free * 100;
    const ship = cart.lines.length === 0 ? 0 : cart.ship === 'exp' ? Math.round(D.ship[1] * 100) : freeOk ? 0 : Math.round(D.ship[0] * 100);
    const save = cart.lines.reduce((s, l) => s + (l.o - l.p) * l.q, 0) + disc;
    const count = cart.lines.reduce((s, l) => s + l.q, 0);
    return { sub, disc, net, ship, total: net + ship, save, count, freeOk, remaining: Math.max(0, D.free * 100 - net) };
  };

  const countBadge = q('[data-cart-count]');
  const liveEl = q('[data-cart-live]');
  const cartBtn = q('.b-cartbtn');
  const sticky = q('[data-sticky]');
  const bump = () => {
    countBadge.classList.remove('is-bump');
    void countBadge.offsetWidth;
    countBadge.classList.add('is-bump');
  };
  const renderBadge = (doBump = false) => {
    const t = totals();
    countBadge.textContent = String(t.count);
    countBadge.dataset.n = String(t.count);
    liveEl.textContent = fill(S.header.cartCount, { n: t.count });
    if (doBump && !reduced) bump();
    renderSticky(t);
  };
  const shipText = (t: ReturnType<typeof totals>, dict: Dict) => (t.freeOk ? dict.unlocked : fill(dict.remaining, { amount: M(t.remaining) }));
  const renderSticky = (t = totals()) => {
    const show = t.count > 0;
    sticky.classList.toggle('is-on', show);
    sticky.setAttribute('aria-hidden', String(!show));
    q('button', sticky).tabIndex = show ? 0 : -1;
    document.body.classList.toggle('b-has-sticky', show);
    q('[data-sticky-text]', sticky).textContent = shipText(t, S.sticky);
    q('[data-sticky-bar]', sticky).style.transform = `scaleX(${Math.min(1, t.net / (D.free * 100))})`;
  };

  const addToCart = (p: Product, n: number) => {
    const line = cart.lines.find((l) => l.id === p.id);
    if (line) line.q = Math.min(99, line.q + n);
    else cart.lines.push({ id: p.id, q: n, n: p.name, p: p.price, o: p.orig, i: p.icon, b: p.bg });
    saveCart();
    renderBadge(true);
    if (cartDlg.open) renderCart();
  };
  const setQty = (id: number, n: number) => {
    if (n <= 0) cart.lines = cart.lines.filter((l) => l.id !== id);
    else { const l = cart.lines.find((x) => x.id === id); if (l) l.q = Math.min(99, n); }
    saveCart();
    renderBadge(true);
    renderCart();
  };

  const burst = (el: HTMLElement) => {
    if (reduced) return;
    const colors = ['#FF3B1D', '#0B0C10', '#A1A1AA', '#FF3B1D', '#D4D4D8', '#52525B'];
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'b-burst';
      const a = (i / 8) * Math.PI * 2;
      s.style.setProperty('--dx', `${Math.cos(a) * 46}px`);
      s.style.setProperty('--dy', `${Math.sin(a) * 30}px`);
      s.style.setProperty('--c', colors[i % colors.length]);
      el.append(s);
      later(() => s.remove(), 620);
    }
  };
  const flashAdded = (btn: HTMLElement, label: string, restore: string) => {
    const txt = btn.querySelector('span:not(.b-burst)') ?? btn;
    btn.classList.remove('is-added');
    void btn.offsetWidth;
    btn.classList.add('is-added');
    txt.textContent = label;
    burst(btn);
    later(() => { btn.classList.remove('is-added'); txt.textContent = restore; }, 1300);
  };

  // ---------------------------------------------------------------- Dialog plumbing
  const qv = q<HTMLDialogElement>('#b-qv');
  const cartDlg = q<HTMLDialogElement>('#b-cart');
  const filtersDlg = q<HTMLDialogElement>('#b-filters');
  const wheelDlg = q<HTMLDialogElement>('#b-wheel');
  const openers = new Map<HTMLDialogElement, HTMLElement | null>();
  const anyUrlDialogOpen = () => [qv, cartDlg, filtersDlg, wheelDlg].some((d) => d.open);
  /** Open a URL-backed dialog. If another one is open, replace its entry instead of stacking history. */
  const openKey = (params: Record<string, string>, opener?: HTMLElement | null) => {
    const clear = Object.fromEntries(UI_KEYS.map((k) => [k, null]));
    const target = params.product ? qv : params.cart ? cartDlg : params.filters ? filtersDlg : wheelDlg;
    if (opener !== undefined) openers.set(target, opener);
    if (anyUrlDialogOpen()) setParams({ ...clear, ...params });
    else openUi(params);
    sync(new URL(location.href));
  };
  const bindClose = (dlg: HTMLDialogElement, keys: string[], after?: () => void) => {
    on(dlg, 'close', () => {
      const url = new URL(location.href);
      if (keys.some((k) => url.searchParams.has(k))) closeUi(Object.fromEntries(keys.map((k) => [k, null])));
      after?.();
      const o = openers.get(dlg);
      openers.delete(dlg);
      if (o?.isConnected && !document.querySelector('dialog[open]')) o.focus({ preventScroll: true });
    });
    on(dlg, 'click', (e: MouseEvent) => { if (e.target === dlg) dlg.close(); });
    qa('[data-close]', dlg).forEach((b) => on(b, 'click', () => dlg.close()));
  };

  // ---------------------------------------------------------------- Quick view
  let qvProduct: Product | null = null;
  let qvQty = 1;
  let viewTimer: number | undefined;
  const qvEl = (k: string) => q(`[data-qv-${k}]`, qv);
  const fillQuick = (p: Product) => {
    qvProduct = p;
    qvQty = 1;
    q('[data-qv-art]', qv).style.setProperty('--bg', D.bg[p.bg]);
    qvEl('icon').setAttribute('href', `${D.sprite}#i${p.icon}`);
    qvEl('off').textContent = `-${p.off}%`;
    const bk = BADGES[p.badge];
    qvEl('badge').hidden = !bk;
    qvEl('badge').textContent = bk ? S.badges[bk] : '';
    qvEl('cat').textContent = D.cats[p.cat];
    qvEl('name').textContent = p.name;
    qvEl('rate').textContent = dec1(p.rating, loc);
    qvEl('sold').textContent = fill(S.card.sold, { n: compact(p.sold, loc) });
    qvEl('price').textContent = M(p.price);
    qvEl('orig').textContent = M(p.orig);
    qvEl('save').textContent = fill(S.quick.save, { amount: M(p.orig - p.price) });
    qvEl('stock').textContent = fill(S.quick.stock, { n: p.stock });
    qvEl('bar').style.transform = `scaleX(${claimed(p) / 100})`;
    qvEl('qty').textContent = '1';
    qvEl('done').hidden = true;
    let viewers = 9 + ((p.id * 13) % 41);
    qvEl('viewing').textContent = fill(S.quick.viewing, { n: viewers });
    stop(viewTimer);
    viewTimer = every(() => {
      viewers = Math.max(4, viewers + Math.round(Math.random() * 6 - 3));
      qvEl('viewing').textContent = fill(S.quick.viewing, { n: viewers });
    }, 3500);
  };
  const showQuick = async (id: number) => {
    let p = known.get(id);
    if (!p) { try { await ensureIndex(); } catch { /* ignore */ } p = known.get(id); }
    if (!new URL(location.href).searchParams.has('product')) return;
    if (!p) { closeUi({ product: null }); return; }
    if (qvProduct?.id !== p.id || !qv.open) fillQuick(p);
    if (!qv.open) qv.showModal();
  };
  bindClose(qv, ['product'], () => { stop(viewTimer); qvProduct = null; });
  on(qvEl('dec'), 'click', () => { qvQty = Math.max(1, qvQty - 1); qvEl('qty').textContent = String(qvQty); });
  on(qvEl('inc'), 'click', () => { qvQty = Math.min(20, qvQty + 1); qvEl('qty').textContent = String(qvQty); });
  on(qvEl('add'), 'click', async () => {
    if (!qvProduct) return;
    const p = qvProduct;
    const btn = qvEl('add');
    flashAdded(btn, S.quick.added, S.quick.add);
    await new Promise((r) => raf(() => r(null)));
    await yieldToMain();
    addToCart(p, qvQty);
    qvEl('done').hidden = false;
  });
  on(qvEl('gocart'), 'click', () => openKey({ cart: '1' }, cartBtn));

  // ---------------------------------------------------------------- Cart drawer + checkout
  const VIEWS = ['cart', 'shipping', 'pay', 'done'];
  let view = 'cart';
  const lineTpl = q<HTMLTemplateElement>('#b-line-tpl');
  const linesEl = q('[data-lines]', cartDlg);
  const nameOf = (l: Line) => known.get(l.id)?.name ?? l.n;
  const renderCart = () => {
    const t = totals();
    const empty = cart.lines.length === 0;
    if (empty && (view === 'shipping' || view === 'pay')) { view = 'cart'; setParams({ checkout: null }); }
    qa('[data-view]', cartDlg).forEach((v) => (v.hidden = v.dataset.view !== view));
    const step = VIEWS.indexOf(view);
    qa('[data-steps] li', cartDlg).forEach((li, i) => li.classList.toggle('is-on', i <= step));
    q('[data-co-back]', cartDlg).hidden = !(view === 'shipping' || view === 'pay');
    // lines
    const frag = document.createDocumentFragment();
    for (const l of cart.lines) {
      const li = lineTpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
      const name = nameOf(l);
      li.dataset.id = String(l.id);
      li.style.setProperty('--bg', D.bg[l.b]);
      q('use', li).setAttribute('href', `${D.sprite}#i${l.i}`);
      q('.bl__name', li).textContent = name;
      q('.bl__price strong', li).textContent = M(l.p * l.q);
      q('.bl__price s', li).textContent = M(l.o * l.q);
      q('output', li).textContent = String(l.q);
      q('[role="group"]', li).setAttribute('aria-label', name);
      q('[data-line-dec]', li).setAttribute('aria-label', fill(S.cart.less, { name }));
      q('[data-line-inc]', li).setAttribute('aria-label', fill(S.cart.more, { name }));
      q('[data-line-rm]', li).setAttribute('aria-label', fill(S.cart.remove, { name }));
      frag.append(li);
    }
    linesEl.replaceChildren(frag);
    q('[data-cart-empty]', cartDlg).hidden = !empty;
    // shipping progress
    const prog = q('[data-ship-progress]', cartDlg);
    prog.hidden = empty || view === 'done';
    prog.classList.toggle('is-free', t.freeOk);
    q('[data-ship-text]', prog).textContent = shipText(t, S.cart);
    q('[data-ship-bar]', prog).style.transform = `scaleX(${Math.min(1, t.net / (D.free * 100))})`;
    // totals
    const foot = q('[data-totals]', cartDlg);
    foot.hidden = empty || view === 'done';
    q('[data-sub]', foot).textContent = M(t.sub);
    q('[data-coupon-row]', foot).hidden = !cart.coupon;
    q('[data-nocoupon-row]', foot).hidden = !!cart.coupon || view !== 'cart';
    q('[data-coupon-label]', foot).textContent = fill(S.cart.coupon, { code: cart.coupon || '' });
    q('[data-coupon-amt]', foot).textContent = `-${M(t.disc)}`;
    q('[data-shipcost]', foot).textContent = t.ship === 0 ? S.cart.free : M(t.ship);
    q('[data-total]', foot).textContent = M(t.total);
    q('[data-savings]', foot).textContent = fill(S.cart.savings, { amount: M(t.save) });
    const next = q('[data-co-next]', foot);
    next.textContent = view === 'cart' ? S.cart.checkout : view === 'shipping' ? S.checkout.next : fill(S.checkout.pay, { amount: M(t.total) });
    // checkout choices
    const freeStd = t.net >= D.free * 100;
    q('[data-ship-std]', cartDlg).textContent = freeStd ? S.cart.free : M(Math.round(D.ship[0] * 100));
    qa('[data-ship]', cartDlg).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.ship === cart.ship)));
    qa('[data-pay]', cartDlg).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.pay === cart.pay)));
    q<HTMLSelectElement>('[data-city]', cartDlg).value = String(cart.city);
    q('[data-cart-title]', cartDlg).textContent = view === 'cart' ? S.cart.title : S.checkout.steps[step];
    if (view === 'done') q('[data-order-id]', cartDlg).textContent = fill(S.checkout.doneOrder, { id: SS.get('brinco:order') || '' });
  };
  const showCart = (v: string | null) => {
    let want = v && VIEWS.includes(v) ? v : 'cart';
    if (want === 'done' && !SS.get('brinco:order')) want = 'cart';
    if ((want === 'shipping' || want === 'pay') && cart.lines.length === 0) want = 'cart';
    if (want !== (v || 'cart')) setParams({ checkout: want === 'cart' ? null : want });
    view = want;
    renderCart();
    if (!cartDlg.open) cartDlg.showModal();
  };
  const goView = (v: string) => {
    setParams({ checkout: v === 'cart' ? null : v });
    view = v;
    renderCart();
    q('.b-view:not([hidden])', cartDlg)?.scrollTo(0, 0);
  };
  bindClose(cartDlg, ['cart', 'checkout'], () => { if (view === 'done') { view = 'cart'; } });
  on(linesEl, 'click', (e: MouseEvent) => {
    const t = e.target as Element;
    const li = t.closest<HTMLElement>('.bl');
    if (!li) return;
    const id = Number(li.dataset.id);
    const l = cart.lines.find((x) => x.id === id);
    if (!l) return;
    if (t.closest('[data-line-inc]')) setQty(id, l.q + 1);
    else if (t.closest('[data-line-dec]')) setQty(id, l.q - 1);
    else if (t.closest('[data-line-rm]')) {
      li.classList.add('is-out');
      later(() => setQty(id, 0), reduced ? 0 : 200);
    }
  });
  on(q('[data-coupon-remove]', cartDlg), 'click', () => { cart.coupon = null; saveCart(); renderCart(); renderBadge(); });
  on(q('[data-cart-explore]', cartDlg), 'click', () => { cartDlg.close(); later(() => catalogSec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }), 60); });
  on(q('[data-co-back]', cartDlg), 'click', () => goView(view === 'pay' ? 'shipping' : 'cart'));
  on(q('[data-done-close]', cartDlg), 'click', () => cartDlg.close());
  qa('[data-ship]', cartDlg).forEach((b) => on(b, 'click', () => { cart.ship = b.dataset.ship as Cart['ship']; saveCart(); renderCart(); }));
  qa('[data-pay]', cartDlg).forEach((b) => on(b, 'click', () => { cart.pay = b.dataset.pay!; saveCart(); renderCart(); }));
  on(q('[data-city]', cartDlg), 'change', (e: Event) => { cart.city = Number((e.target as HTMLSelectElement).value); saveCart(); });
  on(q('[data-co-next]', cartDlg), 'click', async (e: MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (view === 'cart') goView('shipping');
    else if (view === 'shipping') goView('pay');
    else if (view === 'pay') {
      btn.disabled = true;
      btn.textContent = '…';
      await new Promise((r) => later(() => r(null), reduced ? 200 : 900));
      SS.set('brinco:order', `BR-${String(Math.floor(100000 + Math.random() * 899999))}`);
      cart = { ...cart, lines: [], coupon: null };
      saveCart();
      renderBadge();
      btn.disabled = false;
      goView('done');
    }
  });

  // ---------------------------------------------------------------- Filters drawer
  bindClose(filtersDlg, ['filters'], () => setParams(filterParams()));
  on(applyBtn, 'click', () => { filtersDlg.close(); later(scrollToCatalog, 80); });
  on(q('[data-open-filters]'), 'click', (e: MouseEvent) => { warm(); openKey({ filters: '1' }, e.currentTarget as HTMLElement); });

  // ---------------------------------------------------------------- Wheel
  const wheelSvg = q<SVGElement>('#b-wheel-svg');
  const spinBtn = q<HTMLButtonElement>('[data-spin]', wheelDlg);
  const ticket = q('[data-ticket]', wheelDlg);
  const useBtn = q('[data-use-coupon]', wheelDlg);
  const resultEl = q('[data-wheel-result]', wheelDlg);
  const showResult = () => {
    SS.set('brinco:spun', '1');
    spinBtn.hidden = true;
    ticket.hidden = false;
    if (!reduced) ticket.classList.add('is-won');
    resultEl.innerHTML = '';
    const strong = document.createElement('span');
    strong.textContent = fill(S.wheel.won, { prize: S.wheel.prize });
    const small = document.createElement('small');
    small.textContent = cart.coupon ? fill(S.wheel.applied, { code: D.coupon.code, pct: D.coupon.pct }) : fill(S.wheel.wonText, { code: D.coupon.code });
    resultEl.append(strong, small);
    useBtn.hidden = !!cart.coupon;
  };
  const prepWheel = () => {
    if (SS.get('brinco:spun') === '1') {
      wheelSvg.classList.remove('is-spinning');
      wheelSvg.style.transform = `rotate(${WHEEL_TURN % 360}deg)`;
      showResult();
    } else {
      spinBtn.hidden = false;
      spinBtn.disabled = false;
      spinBtn.textContent = S.wheel.spin;
      ticket.hidden = true;
      useBtn.hidden = true;
      resultEl.textContent = '';
    }
  };
  const showWheel = () => {
    SS.set('brinco:wheel-seen', '1');
    if (!wheelDlg.open) { prepWheel(); wheelDlg.showModal(); }
  };
  bindClose(wheelDlg, ['spin'], () => { delete wheelDlg.dataset.auto; });
  on(spinBtn, 'click', () => {
    spinBtn.disabled = true;
    spinBtn.textContent = S.wheel.spinning;
    if (reduced) { wheelSvg.style.transform = `rotate(${WHEEL_TURN % 360}deg)`; showResult(); return; }
    wheelSvg.classList.add('is-spinning');
    raf(() => { wheelSvg.style.transform = `rotate(${WHEEL_TURN}deg)`; });
    let done = false;
    const finish = () => { if (done) return; done = true; showResult(); };
    on(wheelSvg, 'transitionend', finish, { once: true });
    later(finish, 4600);
  });
  const saveCoupon = () => { cart.coupon = D.coupon.code; saveCart(); };
  const applyCoupon = () => {
    saveCoupon();
    renderBadge(true);
    toastOk(fill(S.wheel.applied, { code: D.coupon.code, pct: D.coupon.pct }));
    if (cartDlg.open) renderCart();
  };
  on(useBtn, 'click', () => {
    const from = ticket.getBoundingClientRect();
    saveCoupon(); // persist first: the visual flight is only feedback
    wheelDlg.close();
    if (reduced || !from.width) { applyCoupon(); return; }
    const fly = ticket.cloneNode(true) as HTMLElement;
    fly.classList.remove('is-won');
    fly.classList.add('b-fly');
    Object.assign(fly.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px` });
    document.body.append(fly);
    const to = cartBtn.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = fly.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(0.78)`, opacity: 1, filter: 'blur(0px)', offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.16)`, opacity: 0.2, filter: 'blur(2px)' },
      ],
      { duration: 820, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    );
    anim.onfinish = () => { fly.remove(); applyCoupon(); };
    signal.addEventListener('abort', () => fly.remove());
  });
  // auto-open once per session after ~8 s (no history entry: it wasn't the user's action)
  const tryAuto = () => {
    if (SS.get('brinco:wheel-seen') || cart.coupon) return;
    if (document.querySelector('dialog[open]') || document.hidden) { later(tryAuto, 5000); return; }
    wheelDlg.dataset.auto = '1';
    showWheel();
  };
  later(tryAuto, 8000);

  // generic triggers
  on(document, 'click', (e: MouseEvent) => {
    const t = e.target as Element;
    const add = t.closest<HTMLElement>('[data-add]');
    if (add) {
      const p = known.get(Number(add.dataset.add));
      if (!p) return;
      flashAdded(add, S.card.added, S.card.add);
      raf(() => { yieldToMain().then(() => addToCart(p, 1)); });
      return;
    }
    const qk = t.closest<HTMLElement>('[data-quick]');
    if (qk) { openKey({ product: qk.dataset.quick! }, qk); return; }
    const oc = t.closest<HTMLElement>('[data-open-cart]');
    if (oc) { openKey({ cart: '1' }, oc.closest('.b-sticky') ? cartBtn : oc); return; }
    const ow = t.closest<HTMLElement>('[data-open-wheel]');
    if (ow) { SS.set('brinco:wheel-seen', '1'); openKey({ spin: '1' }, ow.closest('dialog') ? cartBtn : ow); }
  });

  // ---------------------------------------------------------------- Toasts (social proof, sample data)
  const toastBox = q('[data-toasts]');
  const removeToast = (el: HTMLElement) => { el.classList.add('is-out'); later(() => el.remove(), 320); };
  const toastOk = (msg: string) => {
    const el = document.createElement('div');
    el.className = 'b-toast b-toast--ok is-in';
    el.textContent = msg;
    toastBox.append(el);
    later(() => removeToast(el), 3600);
  };
  let socialTimer: number | undefined;
  const socialOff = () => SS.get('brinco:toasts') === 'off';
  const socialTick = () => {
    if (socialOff()) return;
    if (document.hidden || document.querySelector('dialog[open]')) return;
    const pool = [...known.values()];
    const p = pool[Math.floor(Math.random() * pool.length)];
    const cities = S.social.cities as string[];
    const el = document.createElement('div');
    el.className = 'b-toast is-in';
    el.style.setProperty('--bg', D.bg[p.bg]);
    el.innerHTML = `<span class="b-toast__art"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="${D.sprite}#i${p.icon}"/></svg></span><div><p></p><small></small></div><button type="button" class="b-x"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6v12M15 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>`;
    q('p', el).textContent = fill(S.social.bought, { city: cities[Math.floor(Math.random() * cities.length)], product: p.name });
    q('small', el).textContent = `${fill(S.social.ago, { n: 1 + Math.floor(Math.random() * 9) })} · ${S.social.sample}`;
    const pause = q('button', el);
    pause.setAttribute('aria-label', S.social.pause);
    on(pause, 'click', () => { SS.set('brinco:toasts', 'off'); stop(socialTimer); qa('.b-toast', toastBox).forEach(removeToast); });
    toastBox.append(el);
    later(() => el.isConnected && removeToast(el), 5600);
  };
  if (!socialOff()) later(() => { socialTick(); socialTimer = every(socialTick, 16000); }, 13000);

  // ---------------------------------------------------------------- Flash countdown (to local midnight)
  const cd = { h: q('[data-cd="h"]'), m: q('[data-cd="m"]'), s: q('[data-cd="s"]') };
  const tick = () => {
    const now = new Date();
    const mid = new Date(now);
    mid.setHours(24, 0, 0, 0);
    const left = Math.max(0, Math.floor((mid.getTime() - now.getTime()) / 1000));
    const pad = (n: number) => String(n).padStart(2, '0');
    cd.h.textContent = pad(Math.floor(left / 3600));
    cd.m.textContent = pad(Math.floor((left % 3600) / 60));
    cd.s.textContent = pad(left % 60);
  };
  tick();
  every(tick, 1000);

  // ---------------------------------------------------------------- URL sync
  function sync(url: URL) {
    const sp = url.searchParams;
    const pid = sp.get('product');
    if (pid) showQuick(Number(pid));
    else if (qv.open) qv.close();
    if (sp.has('cart')) showCart(sp.get('checkout'));
    else if (cartDlg.open) cartDlg.close();
    if (sp.has('filters')) { if (!filtersDlg.open) { syncFilterUI(); updateMeta(); filtersDlg.showModal(); } }
    else if (filtersDlg.open) filtersDlg.close();
    if (sp.has('spin')) showWheel();
    else if (wheelDlg.open && wheelDlg.dataset.auto !== '1') wheelDlg.close();
  }
  const offUrl = onUrlState((url) => {
    sync(url);
    // history entries hold older filter values: in-memory filters win, rewrite the landed entry
    setParams(filterParams());
  });

  // ---------------------------------------------------------------- Init
  readFilters(new URL(location.href));
  searchInput.value = F.q;
  syncFilterUI();
  if (isFiltered()) applyFilters();
  renderBadge();
  adoptDeepLink(UI_KEYS);
  sync(new URL(location.href));

  return () => {
    ac.abort();
    io.disconnect();
    offUrl();
    timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
    rafs.forEach((id) => cancelAnimationFrame(id));
    [qv, cartDlg, filtersDlg, wheelDlg].forEach((d) => d.open && d.close());
    document.body.classList.remove('b-has-sticky');
  };
}
