/**
 * Turnio demo client script. URL is the single source of truth:
 *   ?billing=annual  (setParams, no history)    ?tour=<tab> (setParams, no history)
 *   ?signup=<plan>   (openUi / closeUi, Back closes, deep-linkable)
 */
import { onPage } from '../../../scripts/lifecycle';
import { onUrlState, openUi, closeUi, setParams, adoptDeepLink } from '../../../scripts/url-state';

const PLANS = ['solo', 'pro', 'team'];
const TABS = ['agenda', 'reminders', 'payments', 'reports'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

onPage(() => {
  const main = document.querySelector<HTMLElement>('main.t-main');
  const dlg = document.getElementById('t-signup') as HTMLDialogElement | null;
  if (!main || !dlg) return;
  const ac = new AbortController();
  const { signal } = ac;
  let opener: HTMLElement | null = null;

  const billBtns = [...main.querySelectorAll<HTMLButtonElement>('[data-billing]')].filter((b) => b.tagName === 'BUTTON');
  const tabs = [...main.querySelectorAll<HTMLButtonElement>('[role="tab"][data-tour]')];
  const panels = [...main.querySelectorAll<HTMLElement>('[data-panel]')];
  const form = dlg.querySelector<HTMLFormElement>('[data-t-form]')!;
  const planSelect = dlg.querySelector<HTMLSelectElement>('[data-t-plan]')!;
  const viewForm = dlg.querySelector<HTMLElement>('[data-view="form"]')!;
  const viewOk = dlg.querySelector<HTMLElement>('[data-view="success"]')!;
  const live = dlg.querySelector<HTMLElement>('[data-t-live]')!;
  const email = form.elements.namedItem('email') as HTMLInputElement;
  const biz = form.elements.namedItem('business') as HTMLSelectElement;

  const applyBilling = (annual: boolean) => {
    main.dataset.billing = annual ? 'annual' : 'monthly';
    billBtns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.billing === 'annual') === annual)));
  };

  const applyTour = (key: string) => {
    tabs.forEach((t) => {
      const on = t.dataset.tour === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.dataset.panel !== key; });
  };

  const setPlan = (plan: string) => {
    dlg.dataset.plan = plan;
    planSelect.value = plan;
  };

  const setError = (field: HTMLInputElement | HTMLSelectElement, msg: string) => {
    const err = document.getElementById(field.getAttribute('aria-describedby') || '');
    if (err) err.textContent = msg;
    if (msg) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  };

  const resetForm = () => {
    form.reset();
    setError(email, '');
    setError(biz, '');
    viewForm.hidden = false;
    viewOk.hidden = true;
    live.textContent = '';
  };

  const sync = (url: URL) => {
    const p = url.searchParams;
    applyBilling(p.get('billing') === 'annual');
    const tour = p.get('tour') ?? '';
    applyTour(TABS.includes(tour) ? tour : 'agenda');
    const plan = p.get('signup');
    if (plan && PLANS.includes(plan)) {
      setPlan(plan);
      if (!dlg.open) { resetForm(); dlg.showModal(); }
    } else if (dlg.open) {
      dlg.close();
    }
  };

  // Clicks: billing, tabs, signup triggers (delegated on main)
  main.addEventListener('click', (e) => {
    const el = e.target as Element;
    const bill = el.closest<HTMLButtonElement>('button[data-billing]');
    if (bill) {
      const annual = bill.dataset.billing === 'annual';
      applyBilling(annual);
      setParams({ billing: annual ? 'annual' : null });
      return;
    }
    const tab = el.closest<HTMLButtonElement>('[role="tab"][data-tour]');
    if (tab) {
      const key = tab.dataset.tour!;
      applyTour(key);
      setParams({ tour: key === 'agenda' ? null : key });
      return;
    }
    const trig = el.closest<HTMLElement>('[data-signup]');
    if (trig) {
      const plan = trig.dataset.signup!;
      opener = trig;
      openUi({ signup: plan });
      sync(new URL(location.href));
    }
  }, { signal });

  // Tabs keyboard: arrows / Home / End move and activate
  tabs[0]?.parentElement?.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    let n = -1;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    tabs[n].focus();
    tabs[n].click();
  }, { signal });

  // Dialog
  planSelect.addEventListener('change', () => {
    setPlan(planSelect.value);
    setParams({ signup: planSelect.value });
  }, { signal });

  dlg.addEventListener('close', () => {
    if (new URL(location.href).searchParams.has('signup')) closeUi({ signup: null });
    opener?.focus();
    opener = null;
  }, { signal });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
    else if ((e.target as Element).closest('[data-t-close]')) dlg.close();
  }, { signal });

  email.addEventListener('input', () => { if (email.hasAttribute('aria-invalid') && EMAIL_RE.test(email.value.trim())) setError(email, ''); }, { signal });
  biz.addEventListener('change', () => { if (biz.value) setError(biz, ''); }, { signal });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = email.value.trim();
    const errEl = document.getElementById('t-email-err')!;
    const bizErr = document.getElementById('t-biz-err')!;
    const emailMsg = !v ? errEl.dataset.required! : !EMAIL_RE.test(v) ? errEl.dataset.invalid! : '';
    const bizMsg = biz.value ? '' : bizErr.dataset.required!;
    setError(email, emailMsg);
    setError(biz, bizMsg);
    if (emailMsg || bizMsg) {
      (emailMsg ? email : biz).focus();
      return;
    }
    // Simulated success (nothing is sent anywhere)
    const planName = dlg.querySelector(`[data-for="${dlg.dataset.plan}"] .t-sum__name`)?.textContent ?? '';
    const title = viewOk.querySelector<HTMLElement>('[data-t-success-title]')!;
    const text = viewOk.querySelector<HTMLElement>('[data-t-success-text]')!;
    title.textContent = (title.dataset.tpl ?? '').replace('{plan}', planName);
    text.textContent = (text.dataset.tpl ?? '').replace('{email}', v);
    viewForm.hidden = true;
    viewOk.hidden = false;
    live.textContent = title.textContent;
    requestAnimationFrame(() => title.focus());
  }, { signal });

  const off = onUrlState(sync);
  adoptDeepLink(['signup']);
  sync(new URL(location.href));

  return () => {
    ac.abort();
    off();
    if (dlg.open) dlg.close();
  };
});
