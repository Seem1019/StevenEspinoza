/**
 * Lumbre page script (small, CSS does the heavy lifting):
 *  - world: rail jumps + aria-current, header/footer section jumps, `.is-live` on visible scenes (ambient fx)
 *  - menu: tabs synced to ?menu= (setParams, no history)
 *  - reservation sheet: ?reserva=1 via openUi/closeUi, deep link, Back closes, simulated confirmation
 */
import { onPage, prefersReducedMotion } from '../../../scripts/lifecycle';
import { onUrlState, openUi, closeUi, adoptDeepLink, setParams } from '../../../scripts/url-state';

const scrollToY = (top: number) =>
  window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

/* ---------------- world + in-page jumps ---------------- */
onPage(() => {
  const world = document.querySelector<HTMLElement>('[data-lb-world]');
  if (!world) return;
  const ac = new AbortController();
  const { signal } = ac;
  const track = world.querySelector<HTMLElement>('.lb-track')!;
  const worldMode = () => getComputedStyle(track).display !== 'none';
  const scenes = [...world.querySelectorAll<HTMLElement>('[data-scene]')];
  const segs = [...world.querySelectorAll<HTMLElement>('[data-seg]')];
  const stops = [...world.querySelectorAll<HTMLButtonElement>('[data-lb-rail]')];
  const key = (el: Element) => (el as HTMLElement).dataset.scene ?? (el as HTMLElement).dataset.seg ?? '';
  const sceneOf = (k: string) => scenes.find((s) => s.dataset.scene === k);
  const targets = () => (worldMode() ? segs : scenes);

  document.addEventListener(
    'click',
    (e) => {
      const el = e.target as Element | null;
      const rail = el?.closest<HTMLElement>('[data-lb-rail]');
      if (rail) {
        const k = rail.dataset.lbRail!;
        const target = targets().find((t) => key(t) === k);
        if (target) scrollToY(k === 'entrada' ? docTop(world) : docTop(target));
        return;
      }
      const go = el?.closest<HTMLElement>('[data-lb-goto]');
      if (go) {
        const target = document.getElementById(go.dataset.lbGoto!);
        if (target) scrollToY(docTop(target) - 8);
        return;
      }
      if (el?.closest('[data-lb-top]')) scrollToY(0);
    },
    { signal },
  );

  // aria-current: the segment/scene crossing the viewport's centre line
  const setCurrent = (k: string) =>
    stops.forEach((b) => (b.dataset.lbRail === k ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
  const centre = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.isIntersecting && setCurrent(key(en.target))),
    { rootMargin: '-50% 0px -50% 0px' },
  );
  // ambient loops run only while their scene can be seen
  const live = new IntersectionObserver((entries) =>
    entries.forEach((en) => sceneOf(key(en.target))?.classList.toggle('is-live', en.isIntersecting)),
  );
  const observe = () => {
    centre.disconnect();
    live.disconnect();
    targets().forEach((t) => { centre.observe(t); live.observe(t); });
  };
  observe();
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', observe, { signal });

  return () => { ac.abort(); centre.disconnect(); live.disconnect(); };
});

/* ---------------- menu tabs ---------------- */
onPage(() => {
  const root = document.querySelector<HTMLElement>('[data-lb-menu]');
  if (!root) return;
  const ac = new AbortController();
  const { signal } = ac;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const keys = tabs.map((t) => t.dataset.tab!);
  const valid = (k: string | null) => (k && keys.includes(k) ? k : keys[0]);

  const show = (k: string, focus = false, reveal = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === k;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      if (on && reveal) {
        const list = t.parentElement!;
        const x = t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2;
        list.scrollTo({ left: x, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });
    root.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach((p) => (p.hidden = p.dataset.panel !== k));
  };
  const choose = (k: string, focus = false) => {
    show(k, focus, true);
    setParams({ menu: k === keys[0] ? null : k });
  };

  root.addEventListener(
    'click',
    (e) => {
      const tab = (e.target as Element).closest<HTMLButtonElement>('[role="tab"]');
      if (tab) choose(tab.dataset.tab!);
    },
    { signal },
  );
  root.addEventListener(
    'keydown',
    (e) => {
      const tab = (e.target as Element).closest<HTMLButtonElement>('[role="tab"]');
      if (!tab) return;
      const i = keys.indexOf(tab.dataset.tab!);
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: keys.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      choose(keys[(next + keys.length) % keys.length], true);
    },
    { signal },
  );

  const sync = (url: URL) => show(valid(url.searchParams.get('menu')));
  const off = onUrlState(sync);
  const initial = new URL(location.href);
  sync(initial);
  // a shared ?menu= link lands on the menu
  if (initial.searchParams.has('menu') && !initial.searchParams.has('reserva')) {
    requestAnimationFrame(() => window.scrollTo({ top: docTop(root) - 8, behavior: 'auto' }));
  }
  return () => { ac.abort(); off(); };
});

/* ---------------- reservation sheet ---------------- */
onPage(() => {
  const dlg = document.querySelector<HTMLDialogElement>('[data-lb-sheet]');
  if (!dlg) return;
  const ac = new AbortController();
  const { signal } = ac;
  const lang = dlg.dataset.lang || 'es';
  const s = JSON.parse(dlg.dataset.strings || '{}') as Record<string, string>;
  const form = dlg.querySelector<HTMLFormElement>('[data-lb-form]')!;
  const done = dlg.querySelector<HTMLElement>('[data-lb-done]')!;
  const err = dlg.querySelector<HTMLElement>('[data-lb-error]')!;
  const partyOut = dlg.querySelector<HTMLOutputElement>('[data-lb-party]')!;
  const dayInputs = [...dlg.querySelectorAll<HTMLInputElement>('input[name="day"]')];
  const timeInputs = [...dlg.querySelectorAll<HTMLInputElement>('input[name="time"]')];
  let party = 2;
  let opener: HTMLElement | null = null;

  // day chips relative to today (Monday closed); a few slots "full" per day, deterministic
  const today = new Date();
  const days = dayInputs.map((_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
  const dow = new Intl.DateTimeFormat(lang, { weekday: 'short' });
  const long = new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' });
  dayInputs.forEach((input, i) => {
    const d = days[i];
    const chip = input.closest('label')!;
    const closed = d.getDay() === 1;
    chip.querySelector('[data-dow]')!.textContent = closed ? s.closed : i === 0 ? s.today : i === 1 ? s.tomorrow : dow.format(d);
    chip.querySelector('[data-dom]')!.textContent = String(d.getDate());
    input.disabled = closed;
    input.setAttribute('aria-label', closed ? `${long.format(d)} · ${s.closed}` : long.format(d));
  });
  const firstOpen = dayInputs.find((i) => !i.disabled);

  const applySlots = () => {
    const di = Number(dayInputs.find((i) => i.checked)?.value ?? 0);
    timeInputs.forEach((input, j) => {
      const full = (di * 3 + j * 2) % 7 === 0;
      input.disabled = full;
      if (full && input.checked) input.checked = false;
      input.closest('label')!.title = full ? s.full : '';
      input.setAttribute('aria-label', full ? `${input.value} · ${s.full}` : input.value);
    });
  };
  const setParty = (n: number) => {
    party = Math.min(10, Math.max(1, n));
    partyOut.textContent = party === 1 ? s.person : s.people.replace('{n}', String(party));
  };
  const reset = () => {
    form.reset();
    form.hidden = false;
    done.hidden = true;
    err.textContent = '';
    if (firstOpen) firstOpen.checked = true;
    setParty(2);
    applySlots();
  };
  reset();

  const sync = (url: URL) => {
    const want = url.searchParams.get('reserva') === '1';
    if (want && !dlg.open) { reset(); dlg.showModal(); }
    else if (!want && dlg.open) dlg.close();
  };

  document.addEventListener(
    'click',
    (e) => {
      const trigger = (e.target as Element | null)?.closest<HTMLElement>('[data-lb-reserve]');
      if (!trigger) return;
      opener = trigger;
      openUi({ reserva: '1' });
      sync(new URL(location.href));
    },
    { signal },
  );
  dlg.addEventListener('close', () => {
    if (new URL(location.href).searchParams.has('reserva')) closeUi({ reserva: null });
    opener?.focus({ preventScroll: true });
  }, { signal });
  dlg.addEventListener('click', (e) => {
    const el = e.target as Element;
    if (el === dlg || el.closest('[data-lb-close]')) dlg.close();
    else if (el.closest('[data-lb-again]')) { reset(); dayInputs.find((i) => i.checked)?.focus(); }
    else if (el.closest<HTMLElement>('[data-lb-step]')) setParty(party + Number(el.closest<HTMLElement>('[data-lb-step]')!.dataset.lbStep));
  }, { signal });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'day') applySlots();
    if (t.name === 'time') err.textContent = '';
  }, { signal });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const day = dayInputs.find((i) => i.checked);
    const time = timeInputs.find((i) => i.checked);
    if (!day || !time) { err.textContent = s.errorTime; timeInputs.find((i) => !i.disabled)?.focus(); return; }
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const who = party === 1 ? s.person : s.people.replace('{n}', String(party));
    const when = long.format(days[Number(day.value)]);
    const summary = `${who} · ${when} · ${time.value}` + (name ? ` · ${s.doneFor.replace('{name}', name)}` : '');
    dlg.querySelector('[data-lb-summary]')!.textContent = summary;
    form.hidden = true;
    done.hidden = false;
    dlg.querySelector<HTMLElement>('[data-lb-done-title]')!.focus();
  }, { signal });

  const off = onUrlState(sync);
  adoptDeepLink(['reserva']);
  sync(new URL(location.href));
  return () => { ac.abort(); off(); if (dlg.open) dlg.close(); };
});
