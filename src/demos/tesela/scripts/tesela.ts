/**
 * Tesela Studio client script. The URL is the single source of truth for in-page UI:
 *   ?case=<id>        case study dialog (openUi / closeUi, Back closes, deep-linkable)
 *   ?brief=<format>   project brief dialog (any | sprint | pilot | team)
 * Theme: data-theme on <body> (toggle stored in localStorage; default follows the system).
 * Everything visual (scroll-driven hero, tiles, stacked panels) is CSS; this file only wires UI.
 */
import { onPage, prefersReducedMotion } from '../../../scripts/lifecycle';
import { onUrlState, openUi, closeUi, setParams, adoptDeepLink } from '../../../scripts/url-state';

const CASES = ['pliego', 'rutero', 'acopio'];
const FORMATS = ['any', 'sprint', 'pilot', 'team'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KEY = 'tesela-theme';

onPage(() => {
  const root = document.body;
  const page = document.querySelector<HTMLElement>('.ts-page');
  const caseDlg = document.getElementById('ts-case') as HTMLDialogElement | null;
  const briefDlg = document.getElementById('ts-brief') as HTMLDialogElement | null;
  if (!page || !caseDlg || !briefDlg || !root.classList.contains('tesela')) return;
  const ac = new AbortController();
  const { signal } = ac;
  let opener: HTMLElement | null = null;

  // --- theme ---------------------------------------------------------------------------------
  const themeBtn = page.querySelector<HTMLButtonElement>('[data-ts-theme]')!;
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches);
  const labelTheme = () => themeBtn.setAttribute('aria-label', (isDark() ? themeBtn.dataset.light : themeBtn.dataset.dark) ?? '');
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  } catch { /* storage blocked: follow the system */ }
  labelTheme();
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    labelTheme();
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  }, { signal });
  systemDark.addEventListener('change', labelTheme, { signal });

  // --- mobile menu (in-capsule disclosure) --------------------------------------------------
  const nav = page.querySelector<HTMLElement>('[data-ts-nav]')!;
  const burger = nav.querySelector<HTMLButtonElement>('[data-ts-burger]')!;
  const setMenu = (open: boolean) => {
    nav.toggleAttribute('data-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', (open ? burger.dataset.close : burger.dataset.open) ?? '');
  };
  burger.addEventListener('click', () => setMenu(!nav.hasAttribute('data-open')), { signal });
  nav.addEventListener('click', (e) => { if ((e.target as Element).closest('.ts-link, .ts-links__cta')) setMenu(false); }, { signal });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.hasAttribute('data-open')) { setMenu(false); burger.focus(); }
  }, { signal });
  document.addEventListener('click', (e) => { if (nav.hasAttribute('data-open') && !nav.contains(e.target as Node)) setMenu(false); }, { signal });

  // --- active section pill -----------------------------------------------------------------
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('[data-ts-link]')];
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const id = (en.target as HTMLElement).dataset.tsSection;
      links.forEach((l) => l.setAttribute('aria-current', String(l.dataset.tsLink === id)));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  page.querySelectorAll('[data-ts-section]').forEach((s) => io.observe(s));
  const heroIo = new IntersectionObserver(([en]) => {
    if (en?.isIntersecting) links.forEach((l) => l.removeAttribute('aria-current'));
  }, { rootMargin: '-45% 0px -50% 0px' });
  const hero = page.querySelector('.ts-hero');
  if (hero) heroIo.observe(hero);

  // --- hero painting: loaded on the first scroll (the window is fully clipped until then) ---------------
  const frame = page.querySelector<HTMLElement>('[data-ts-frame]');
  const loadPainting = () => {
    if (!frame || frame.dataset.loaded || getComputedStyle(frame).display === 'none') return;
    frame.dataset.loaded = '1';
    frame.querySelectorAll<HTMLSourceElement | HTMLImageElement>('[data-srcset]').forEach((el) => {
      el.setAttribute('srcset', el.dataset.srcset!);
      if (el instanceof HTMLImageElement && el.dataset.src) el.src = el.dataset.src;
    });
  };
  if (scrollY > 0) loadPainting();
  else addEventListener('scroll', loadPainting, { passive: true, once: true, signal });

  // --- operation cards over the paintings: queued -> running -> done while their panel is on screen ------
  const medias = [...page.querySelectorAll<HTMLElement>('.ts-step__media')];
  let opIo: IntersectionObserver | null = null;
  if (!prefersReducedMotion() && 'IntersectionObserver' in window) {
    medias.forEach((m) => (m.dataset.op = 'idle'));
    opIo = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const m = en.target as HTMLElement;
        if (en.isIntersecting && en.intersectionRatio >= 0.5) m.dataset.op = 'run';
        else if (!en.isIntersecting) m.dataset.op = 'idle'; // replays the next time it comes into view
      }
    }, { threshold: [0, 0.5] });
    medias.forEach((m) => opIo!.observe(m));
  }

  // --- dialogs -------------------------------------------------------------------------------
  const panels = [...caseDlg.querySelectorAll<HTMLElement>('[data-case-panel]')];
  const form = briefDlg.querySelector<HTMLFormElement>('[data-ts-form]')!;
  const viewForm = briefDlg.querySelector<HTMLElement>('[data-view="form"]')!;
  const viewOk = briefDlg.querySelector<HTMLElement>('[data-view="success"]')!;
  const live = briefDlg.querySelector<HTMLElement>('[data-ts-live]')!;
  const fmt = briefDlg.querySelector<HTMLSelectElement>('[data-ts-format]')!;
  const name = form.elements.namedItem('name') as HTMLInputElement;
  const email = form.elements.namedItem('email') as HTMLInputElement;

  const setError = (field: HTMLInputElement, msg: string) => {
    const err = document.getElementById(field.getAttribute('aria-describedby') || '');
    if (err) err.textContent = msg;
    if (msg) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  };
  const resetBrief = () => {
    form.reset();
    setError(name, '');
    setError(email, '');
    viewForm.hidden = false;
    viewOk.hidden = true;
    live.textContent = '';
  };

  const sync = (url: URL) => {
    const p = url.searchParams;
    const brief = p.get('brief');
    const id = p.get('case');
    const wantBrief = !!brief && FORMATS.includes(brief);
    const wantCase = !wantBrief && !!id && CASES.includes(id);

    if (wantCase) {
      panels.forEach((el) => { el.hidden = el.dataset.casePanel !== id; });
      caseDlg.setAttribute('aria-labelledby', `ts-case-${id}`);
      if (!caseDlg.open) caseDlg.showModal();
      caseDlg.querySelector('.ts-dlg__panel')?.scrollTo(0, 0);
    } else if (caseDlg.open) caseDlg.close();

    if (wantBrief) {
      if (!briefDlg.open) { resetBrief(); briefDlg.showModal(); }
      fmt.value = brief!;
    } else if (briefDlg.open) briefDlg.close();
  };

  page.addEventListener('click', (e) => {
    const el = e.target as Element;
    const b = el.closest<HTMLElement>('[data-ts-brief]');
    if (b) {
      opener = b;
      openUi({ brief: b.dataset.tsBrief || 'any', case: null });
      sync(new URL(location.href));
      return;
    }
    const c = el.closest<HTMLElement>('[data-ts-case]');
    if (c) {
      opener = c;
      openUi({ case: c.dataset.tsCase! });
      sync(new URL(location.href));
      return;
    }
    if (el.closest('[data-ts-brief-from-case]')) {
      // same history entry: Back from the brief returns to the page, not to the case
      setParams({ case: null, brief: 'any' });
      sync(new URL(location.href));
    }
  }, { signal });

  for (const [dlg, key] of [[caseDlg, 'case'], [briefDlg, 'brief']] as const) {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || (e.target as Element).closest('[data-ts-close]')) dlg.close();
    }, { signal });
    dlg.addEventListener('close', () => {
      if (new URL(location.href).searchParams.has(key)) closeUi({ [key]: null });
      if (!caseDlg.open && !briefDlg.open) { opener?.focus(); opener = null; }
    }, { signal });
  }

  fmt.addEventListener('change', () => setParams({ brief: fmt.value }), { signal });
  name.addEventListener('input', () => { if (name.value.trim()) setError(name, ''); }, { signal });
  email.addEventListener('input', () => { if (email.hasAttribute('aria-invalid') && EMAIL_RE.test(email.value.trim())) setError(email, ''); }, { signal });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = name.value.trim();
    const v = email.value.trim();
    const nameErr = document.getElementById('ts-name-err')!;
    const emailErr = document.getElementById('ts-email-err')!;
    const nMsg = n ? '' : nameErr.dataset.required!;
    const eMsg = !v ? emailErr.dataset.required! : !EMAIL_RE.test(v) ? emailErr.dataset.invalid! : '';
    setError(name, nMsg);
    setError(email, eMsg);
    if (nMsg || eMsg) { (nMsg ? name : email).focus(); return; }
    // Simulated success: nothing leaves the browser.
    const title = viewOk.querySelector<HTMLElement>('[data-ts-ok-title]')!;
    const text = viewOk.querySelector<HTMLElement>('[data-ts-ok-text]')!;
    title.textContent = (title.dataset.tpl ?? '').replace('{name}', n.split(' ')[0]);
    text.textContent = (text.dataset.tpl ?? '').replace('{email}', v);
    viewForm.hidden = true;
    viewOk.hidden = false;
    live.textContent = title.textContent;
    requestAnimationFrame(() => title.focus());
  }, { signal });

  const off = onUrlState(sync);
  adoptDeepLink(['case', 'brief']);
  sync(new URL(location.href));

  return () => {
    ac.abort();
    off();
    io.disconnect();
    heroIo.disconnect();
    opIo?.disconnect();
    if (caseDlg.open) caseDlg.close();
    if (briefDlg.open) briefDlg.close();
  };
});
