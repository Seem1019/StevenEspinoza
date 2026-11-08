/**
 * Home intro controller. The real home is in the initial HTML; an inline <head> script decides before
 * the first paint whether to show the start gate (html[data-intro="gate"]): not for reduced motion,
 * bots, deep links or a visitor who already saw it in this session (sessionStorage, try/catch).
 * If this module never runs, that inline script drops the gate after 4 s → plain home.
 *
 * The engine itself (engine.ts + flow.ts) is a dynamic import: fetched when idle or on the first click.
 */
import type { AgentLabels, ResolvedScene } from './types';
import type { AgentEngine, EngineStatus } from './engine';

const KEY = 'se-intro';
const markSeen = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode: fine */ } };

interface Payload { scene: ResolvedScene; labels: AgentLabels }
type Mods = [typeof import('./engine'), typeof import('./flow')];

export function mountIntro(): (() => void) | void {
  const html = document.documentElement;
  const gate = document.querySelector<HTMLElement>('[data-intro-gate]');
  const start = document.querySelector<HTMLButtonElement>('[data-intro-start]');
  const skipGate = document.querySelector<HTMLButtonElement>('[data-intro-skip]');
  const panel = document.getElementById('intro-flow');
  const panelSkip = document.querySelector<HTMLButtonElement>('[data-intro-panel-skip]');
  const replay = document.querySelector<HTMLButtonElement>('[data-intro-replay]');
  const dataEl = document.getElementById('intro-data');
  if (!gate || !start || !skipGate || !panel || !panelSkip || !replay || !dataEl) return;
  (window as unknown as { __introReady?: boolean }).__introReady = true;

  const data = JSON.parse(dataEl.textContent || '{}') as Payload;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ac = new AbortController();
  const signal = ac.signal;
  let engine: AgentEngine | null = null;
  let host: HTMLElement | null = null;
  let mods: Promise<Mods> | null = null;
  let anims: Animation[] = [];
  let timers: number[] = [];
  let runId = 0;
  const load = () => (mods ??= Promise.all([import('./engine'), import('./flow')]));

  const showReplay = (on: boolean) => { replay.hidden = !on || reduced; };

  const finishIntro = () => {
    if (html.dataset.intro === 'build' && window.scrollY > 0) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    html.removeAttribute('data-intro');
    gate.hidden = true;
    gate.classList.remove('is-morphing');
    panel.setAttribute('data-leaving', '');
    timers.push(window.setTimeout(() => { panel.hidden = true; panel.removeAttribute('data-leaving'); }, 360));
    showReplay(true);
  };

  const onStatus = (s: EngineStatus) => {
    html.dataset.introStatus = s;
    if (s === 'done') finishIntro();
  };

  // Keep the floating panel away from what the focused agent is working on (desktop only).
  let side: 'right' | 'left' = 'right';
  const onFocus = (r: DOMRect) => {
    if (window.innerWidth < 640) return;
    const p = panel.getBoundingClientRect();
    const dx = document.documentElement.clientWidth - 32 - p.width;
    const hits = (left: number) => r.right > left - 12 && r.left < left + p.width + 12 && r.bottom > p.top - 12 && r.top < p.bottom + 12;
    if (!hits(p.left)) return;
    const otherLeft = side === 'right' ? p.left - dx : p.left + dx;
    if (hits(otherLeft)) return; // both corners busy: stay put
    side = side === 'right' ? 'left' : 'right';
    panel.style.transform = side === 'left' ? `translateX(${-dx}px)` : '';
  };

  const run = async (origin: HTMLElement, id: number) => {
    const [{ AgentEngine }, { Flow }] = await load();
    if (id !== runId) return; // skipped while loading
    engine?.destroy();
    host?.remove();
    host = document.createElement('div');
    host.className = 'ag-host-page';
    document.body.append(host);
    document.querySelectorAll('[data-intro-origin]').forEach((el) => el.removeAttribute('data-intro-origin'));
    origin.setAttribute('data-intro-origin', '');
    const mobile = window.innerWidth < 640;
    const flow = new Flow(panel, data.labels, reduced);
    engine = new AgentEngine({
      scene: data.scene, root: document.body, frame: null, host, flow, labels: data.labels, reduced,
      follow: true, insets: { top: 72, bottom: mobile ? 84 : 24 }, onStatus, onFocus,
    });
    engine.play();
  };

  /** The start button turns into the orchestrator node; the cursors come out of it. */
  const morph = () => {
    const bg = gate.querySelector<HTMLElement>('.ag-gate__bg')!;
    const fade = [...gate.querySelectorAll<HTMLElement>('.ag-gate__caption, .ag-gate__skip, .ag-gate__label')];
    const b = bg.getBoundingClientRect();
    panel.hidden = false;
    panel.style.opacity = '0';
    const node = [...panel.querySelectorAll<HTMLElement>('[data-node="orch"], .ag-mini__phase')].find((el) => el.offsetParent !== null) ?? panel;
    const n = node.getBoundingClientRect();
    const sq = 44;
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const dx = n.left + n.width / 2 - (b.left + b.width / 2);
    const dy = n.top + n.height / 2 - (b.top + b.height / 2);
    anims = [
      ...fade.map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })),
      bg.animate(
        [
          { transform: 'none', offset: 0 },
          { transform: `scale(${sq / b.width}, ${sq / b.height})`, offset: 0.32 },
          { transform: `scale(${(sq * 1.18) / b.width}, ${(sq * 1.18) / b.height})`, offset: 0.42 },
          { transform: `scale(${sq / b.width}, ${sq / b.height})`, offset: 0.52 },
          { transform: `translate(${dx}px, ${dy}px) scale(${n.width / b.width}, ${n.height / b.height})`, offset: 1 },
        ],
        { duration: 1500, easing: ease, fill: 'forwards' },
      ),
      bg.animate([{ opacity: 1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], { duration: 1650, fill: 'forwards' }),
      panel.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 1050, easing: ease, fill: 'forwards' }),
    ];
    timers.push(window.setTimeout(() => {
      panel.style.opacity = '';
      anims.forEach((a) => a.cancel());
      anims = [];
      gate.hidden = true;
      gate.classList.remove('is-morphing');
    }, 1700));
  };

  const begin = (origin: HTMLElement, fromGate: boolean) => {
    markSeen();
    html.dataset.intro = 'build';
    showReplay(false);
    if (fromGate) { gate.classList.add('is-morphing'); morph(); }
    else {
      window.scrollTo({ top: 0, behavior: 'auto' });
      panel.hidden = false;
      panel.style.transform = '';
      side = 'right';
    }
    const id = ++runId;
    run(origin, id).catch(() => finishIntro());
  };

  const skipAll = () => {
    markSeen();
    anims.forEach((a) => a.cancel());
    anims = [];
    panel.style.opacity = '';
    runId++;
    if (engine && engine.state !== 'done' && engine.state !== 'idle') engine.skip();
    else finishIntro();
  };

  start.addEventListener('click', () => begin(start, true), { signal });
  skipGate.addEventListener('click', skipAll, { signal });
  panelSkip.addEventListener('click', skipAll, { signal });
  replay.addEventListener('click', () => begin(replay, false), { signal });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && html.dataset.intro) skipAll(); }, { signal });

  if (html.dataset.intro === 'gate') {
    // fetch the engine while the visitor reads the gate
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(() => void load()); else timers.push(window.setTimeout(() => void load(), 600));
  } else {
    showReplay(true);
  }

  return () => {
    ac.abort();
    anims.forEach((a) => a.cancel());
    timers.forEach((t) => clearTimeout(t));
    engine?.destroy();
    host?.remove();
    html.removeAttribute('data-intro');
  };
}
