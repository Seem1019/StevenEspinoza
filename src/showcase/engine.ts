/**
 * Agents engine: plays a ResolvedScene over real DOM. Shared by the home intro and "Agentes en vivo".
 *
 * One clock (pausable, frozen while the tab is hidden) drives everything: cursors (curved paths, tools,
 * speech bubbles), selections, typing, drags/resizes, deliberate errors and their fixes, QA's sweep, and
 * the orchestrator flow (Flow). Page changes use transform/opacity/paint only → no layout shift.
 *
 * Generic: it only knows targets (data-build ids or selectors), agent ids and resolved strings.
 * skip() applies the rest of the script instantly (final, corrected state); reset() restores the DOM.
 */
import type { AgentId, AgentLabels, Anchor, Phase, ResolvedError, ResolvedEvent, ResolvedScene, Xf } from './types';
import { AGENTS, AGENT_COLORS as COLORS } from './types';
import { Flow } from './flow';
import { clamp, easeInOut, lerp, makePath, rng, travelMs, type Pt } from './motion';

export type EngineStatus = 'idle' | 'running' | 'paused' | 'done';
export interface EngineInfo { elapsed: number; duration: number; phase: Phase; found: number; fixed: number; total: number }
type Rect = { x: number; y: number; w: number; h: number };
type Tool = 'arrow' | 'move' | 'resize' | 'text' | 'dropper';

export interface EngineOptions {
  scene: ResolvedScene;
  /** Where targets are looked up. */
  root: HTMLElement;
  /** Scroll container of the targets; null = the window. */
  frame: HTMLElement | null;
  /** Overlay container covering exactly the frame's visible box (fixed full viewport for the window). */
  host: HTMLElement;
  flow: Flow;
  labels: AgentLabels;
  reduced: boolean;
  /** Keep the focused target in view by scrolling the frame. */
  follow?: boolean;
  /** Px of the frame covered by sticky UI (header on top, panel/bar at the bottom). */
  insets?: { top: number; bottom: number };
  onStatus?: (s: EngineStatus) => void;
  onTick?: (i: EngineInfo) => void;
  /** Viewport rect of the element the focused agent is working on (to move panels out of the way). */
  onFocus?: (r: DOMRect) => void;
}


/** 24×24 pointer glyphs; [path, hotspotX, hotspotY]. */
const TOOLS: Record<Tool, [string, number, number]> = {
  arrow: ['M3 2.5v17.2l4.6-4.3 3 6.6 3.1-1.4-3-6.5h6.3z', 3, 2.5],
  move: ['M12 2l3 3.2h-2v5.8h5.8v-2L22 12l-3.2 3v-2H13v5.8h2L12 22l-3-3.2h2V13H5.2v2L2 12l3.2-3v2H11V5.2H9z', 12, 12],
  resize: ['M4 4h7L8.4 6.6l9 9L20 13v7h-7l2.6-2.6-9-9L4 11z', 12, 12],
  text: ['M8 3h3l1 1 1-1h3v2h-2.5c-.3 0-.5.2-.5.5V11h2v2h-2v5.5c0 .3.2.5.5.5H16v2h-3l-1-1-1 1H8v-2h2.5c.3 0 .5-.2.5-.5V13H9v-2h2V5.5c0-.3-.2-.5-.5-.5H8z', 12, 12],
  dropper: ['M19.6 4.4a2.6 2.6 0 0 0-3.7 0l-2.3 2.3-1-1-1.6 1.6 1.1 1.1-7 7c-.5.5-.8 1.2-.8 1.9v2.3L3 20.9l1 1 1.3-1.3h2.3c.7 0 1.4-.3 1.9-.8l7-7 1.1 1.1 1.6-1.6-1-1 2.3-2.3a2.6 2.6 0 0 0 0-3.7z', 3.5, 20.5],
};
const FOCUS_ACTIONS = new Set(['move', 'select', 'drag', 'resize', 'type', 'count', 'pick', 'fix', 'sweep']);

interface Cur {
  id: AgentId;
  x: number; y: number;
  visible: boolean;
  tool: Tool;
  move: { start: number; dur: number; path: (t: number) => Pt } | null;
  follow: { el: HTMLElement; fx: number; fy: number } | null;
  pin: Pt | null;
  bubbleUntil: number;
  swatch: string | null;
  rand: () => number;
  seed: number;
  el: HTMLElement; ptr: SVGPathElement; svg: SVGSVGElement; bubble: HTMLElement; swatchEl: HTMLElement;
}
interface ErrState { def: ResolvedError; state: 'pending' | 'active' | 'flagged' | 'fixing' | 'fixed'; n: number; mark: HTMLElement | null }
interface Tween { start: number; dur: number; step: (k: number) => void; done?: () => void }

export class AgentEngine {
  private o: EngineOptions;
  private events: ResolvedEvent[];
  private errors = new Map<string, ErrState>();
  private idx = 0;
  private elapsed = 0;
  private last = 0;
  private raf = 0;
  private status: EngineStatus = 'idle';
  private tweens: Tween[] = [];
  private cursors = new Map<AgentId, Cur>();
  private sels = new Map<AgentId, { box: HTMLElement; size: HTMLElement; el: HTMLElement | null }>();
  private layer: HTMLElement;
  private sweepEl: HTMLElement;
  private gridEl: HTMLElement;
  private caretEl: HTMLElement;
  private sweep: { els: HTMLElement[]; start: number; dur: number } | null = null;
  private grid: { el: HTMLElement; color: string } | null = null;
  private caret: { span: HTMLElement | null; color: string } | null = null;
  private pristine = new Map<HTMLElement, { style: string | null; html: string }>();
  private dirtyHtml = new Set<HTMLElement>();
  private xfs = new Map<HTMLElement, Xf>();
  private phase: Phase = 'kickoff';
  private focus: AgentId | null = null;
  private found = 0;
  private fixed = 0;
  private userAt = -1e9;
  private fb = { left: 0, top: 0, w: 0, h: 0 };
  private sc = { x: 0, y: 0 };
  private ac = new AbortController();

  constructor(o: EngineOptions) {
    this.o = o;
    this.events = [...o.scene.events].sort((a, b) => a.at - b.at);
    o.scene.errors.forEach((def) => this.errors.set(def.id, { def, state: 'pending', n: 0, mark: null }));

    this.layer = document.createElement('div');
    this.layer.className = 'ag-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    this.gridEl = this.div('ag-grid');
    this.sweepEl = this.div('ag-sweep');
    this.caretEl = this.div('ag-caret');
    AGENTS.forEach((id, i) => this.cursors.set(id, this.makeCursor(id, i)));
    o.host.append(this.layer);

    const signal = this.ac.signal;
    const target: EventTarget = o.frame ?? window;
    const mark = () => (this.userAt = performance.now());
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => target.addEventListener(t, mark, { passive: true, signal }));
    document.addEventListener('visibilitychange', this.onVisibility, { signal });
    this.reset();
  }

  get state() { return this.status; }
  get duration() { return this.o.scene.duration; }

  play() {
    if (this.status === 'running') return;
    if (this.status === 'done') this.reset();
    this.setStatus('running');
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  pause() {
    if (this.status !== 'running') return;
    cancelAnimationFrame(this.raf);
    this.setStatus('paused');
  }

  resume() {
    if (this.status !== 'paused') return;
    this.setStatus('running');
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Final, corrected state right now. */
  skip() {
    if (this.status === 'done') return;
    cancelAnimationFrame(this.raf);
    this.measure();
    while (this.idx < this.events.length) this.apply(this.events[this.idx++], true);
    this.finish();
  }

  /** Back to the very beginning: DOM restored, overlay and flow cleared. */
  reset() {
    cancelAnimationFrame(this.raf);
    this.tweens = [];
    this.restore();
    this.errors.forEach((e) => { e.state = 'pending'; e.n = 0; e.mark?.remove(); e.mark = null; });
    this.cursors.forEach((c, id) => {
      c.visible = false; c.move = null; c.follow = null; c.pin = null; c.bubbleUntil = 0; c.swatch = null; c.tool = 'arrow';
      c.rand = rng(c.seed);
      c.el.classList.remove('is-on');
      this.setTool(c, 'arrow');
      this.sels.get(id)?.box.classList.remove('is-on');
      const s = this.sels.get(id);
      if (s) s.el = null;
    });
    this.sweep = null; this.grid = null; this.caret = null;
    this.sweepEl.classList.remove('is-on'); this.gridEl.classList.remove('is-on'); this.caretEl.classList.remove('is-on');
    this.o.root.querySelectorAll<HTMLElement>('[data-build]').forEach((el) => (el.dataset.buildState = 'hidden'));
    this.o.flow.reset();
    this.idx = 0; this.elapsed = 0; this.found = 0; this.fixed = 0; this.phase = 'kickoff'; this.focus = null;
    this.setStatus('idle');
    this.hud();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ac.abort();
    this.layer.remove();
  }

  // --- clock -------------------------------------------------------------------------------------

  private onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else if (this.status === 'running') { this.last = performance.now(); this.raf = requestAnimationFrame(this.tick); }
  };

  private tick = (now: number) => {
    this.elapsed += Math.min(now - this.last, 100);
    this.last = now;
    this.measure();
    while (this.idx < this.events.length && this.events[this.idx].at <= this.elapsed) this.apply(this.events[this.idx++], false);
    this.runTweens();
    this.stepSweep(false);
    this.o.flow.tick(this.elapsed);
    this.render();
    this.hud();
    if (this.idx >= this.events.length && this.elapsed >= this.o.scene.duration && !this.tweens.length) { this.finish(); return; }
    this.raf = requestAnimationFrame(this.tick);
  };

  private runTweens(instant = false) {
    if (!this.tweens.length) return;
    const finished = new Set<Tween>();
    for (const tw of this.tweens.slice()) {
      if (!instant && this.elapsed < tw.start) continue;
      const k = instant || tw.dur <= 0 ? 1 : clamp((this.elapsed - tw.start) / tw.dur, 0, 1);
      tw.step(k);
      if (k >= 1) { finished.add(tw); tw.done?.(); }
    }
    // done() callbacks may have queued new tweens: they stay in the list
    this.tweens = this.tweens.filter((t) => !finished.has(t));
    if (instant && this.tweens.length) this.runTweens(true);
  }

  private tween(start: number, dur: number, step: (k: number) => void, done?: () => void, instant = false) {
    if (instant || dur <= 0) { step(1); done?.(); return; }
    this.tweens.push({ start, dur, step, done });
  }

  private finish() {
    cancelAnimationFrame(this.raf);
    this.runTweens(true);
    this.stepSweep(true);
    this.o.flow.flush();
    this.errors.forEach((e) => { if (e.state !== 'fixed' && e.state !== 'pending') this.clearError(e); e.mark?.remove(); e.mark = null; });
    this.cursors.forEach((c) => { c.visible = false; c.el.classList.remove('is-on'); });
    this.sels.forEach((s) => { s.el = null; s.box.classList.remove('is-on'); });
    this.grid = null; this.caret = null; this.sweep = null;
    this.gridEl.classList.remove('is-on'); this.caretEl.classList.remove('is-on'); this.sweepEl.classList.remove('is-on');
    this.restore();
    this.o.flow.done();
    this.phase = 'close';
    this.elapsed = this.o.scene.duration;
    this.hud();
    this.setStatus('done');
  }

  private setStatus(s: EngineStatus) {
    this.status = s;
    this.o.onStatus?.(s);
  }

  private hud() {
    this.o.onTick?.({ elapsed: this.elapsed, duration: this.o.scene.duration, phase: this.phase, found: this.found, fixed: this.fixed, total: this.errors.size });
  }

  // --- geometry ----------------------------------------------------------------------------------

  private measure() {
    const f = this.o.frame;
    if (f) {
      const r = f.getBoundingClientRect();
      this.fb = { left: r.left + f.clientLeft, top: r.top + f.clientTop, w: f.clientWidth, h: f.clientHeight };
      this.sc = { x: f.scrollLeft, y: f.scrollTop };
    } else {
      this.fb = { left: 0, top: 0, w: document.documentElement.clientWidth, h: window.innerHeight };
      this.sc = { x: window.scrollX, y: window.scrollY };
    }
  }

  /** Element box in frame-content coordinates (scroll-independent). */
  private crect(el: Element): Rect {
    const r = el.getBoundingClientRect();
    return { x: r.left - this.fb.left + this.sc.x, y: r.top - this.fb.top + this.sc.y, w: r.width, h: r.height };
  }

  private anchor(r: Rect, a: Anchor = 'center'): Pt {
    const inset = Math.min(18, r.w * 0.2);
    switch (a) {
      case 'tl': return { x: r.x + inset, y: r.y + Math.min(14, r.h * 0.3) };
      case 'tr': return { x: r.x + r.w - inset, y: r.y + Math.min(14, r.h * 0.3) };
      case 'bl': return { x: r.x + inset, y: r.y + r.h - Math.min(10, r.h * 0.3) };
      case 'br': return { x: r.x + r.w, y: r.y + r.h };
      case 'l': return { x: r.x + inset, y: r.y + r.h / 2 };
      case 'r': case 'end': return { x: r.x + r.w - inset, y: r.y + r.h / 2 };
      case 't': return { x: r.x + r.w / 2, y: r.y + Math.min(14, r.h * 0.3) };
      case 'b': return { x: r.x + r.w / 2, y: r.y + r.h - Math.min(10, r.h * 0.3) };
      default: return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    }
  }

  private all(t?: string): HTMLElement[] {
    if (!t) return [];
    const sel = /^[\w-]+$/.test(t) ? `[data-build="${t}"]` : t;
    return [...this.o.root.querySelectorAll<HTMLElement>(sel)];
  }
  private first(t?: string) { return this.all(t)[0] ?? null; }

  private ensureVisible(el: HTMLElement) {
    if (!this.o.follow || performance.now() - this.userAt < 2500) return;
    const r = this.crect(el);
    const { top = 0, bottom = 0 } = this.o.insets ?? {};
    const h = this.fb.h;
    const usable = h - top - bottom;
    const y0 = this.sc.y;
    const needH = Math.min(r.h, usable * 0.6);
    if (r.y >= y0 + top && r.y + needH <= y0 + h - bottom) return;
    const f = this.o.frame;
    const max = f ? f.scrollHeight - f.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
    const to = clamp(r.y - top - usable * 0.22, 0, Math.max(0, max));
    const opts: ScrollToOptions = { top: to, behavior: this.o.reduced ? 'auto' : 'smooth' };
    if (f) f.scrollTo(opts);
    else window.scrollTo(opts);
  }

  // --- DOM bookkeeping (everything we change can be restored) -------------------------------------

  private touch(el: HTMLElement) {
    if (!this.pristine.has(el)) this.pristine.set(el, { style: el.getAttribute('style'), html: el.innerHTML });
  }

  private restore() {
    this.dirtyHtml.forEach((el) => { const p = this.pristine.get(el); if (p) el.innerHTML = p.html; });
    this.pristine.forEach((p, el) => {
      if (p.style === null) el.removeAttribute('style');
      else el.setAttribute('style', p.style);
      el.removeAttribute('data-ag-xf');
    });
    this.pristine.clear();
    this.dirtyHtml.clear();
    this.xfs.clear();
  }

  private getXf(el: HTMLElement): Xf { return this.xfs.get(el) ?? {}; }
  private setXf(el: HTMLElement, xf: Xf) {
    this.touch(el);
    el.setAttribute('data-ag-xf', '');
    this.xfs.set(el, xf);
    const { x = 0, y = 0, r = 0, s = 1, sx = 1, sy = 1 } = xf;
    const id = !x && !y && !r && s === 1 && sx === 1 && sy === 1;
    el.style.transform = id ? '' : `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${(s * sx).toFixed(3)}, ${(s * sy).toFixed(3)})`;
  }
  private lerpXf(a: Xf, b: Xf, k: number): Xf {
    return {
      x: lerp(a.x ?? 0, b.x ?? 0, k), y: lerp(a.y ?? 0, b.y ?? 0, k), r: lerp(a.r ?? 0, b.r ?? 0, k),
      s: lerp(a.s ?? 1, b.s ?? 1, k), sx: lerp(a.sx ?? 1, b.sx ?? 1, k), sy: lerp(a.sy ?? 1, b.sy ?? 1, k),
    };
  }

  // --- overlay elements --------------------------------------------------------------------------

  private div(cls: string) {
    const d = document.createElement('div');
    d.className = cls;
    this.layer.append(d);
    return d;
  }

  private makeCursor(id: AgentId, i: number): Cur {
    const el = this.div('ag-cur');
    el.dataset.agent = id;
    el.style.setProperty('--c', COLORS[id]);
    el.innerHTML = `<svg class="ag-cur__ptr" viewBox="0 0 24 24" width="24" height="24"><path /></svg><span class="ag-cur__name"></span><span class="ag-cur__swatch"></span><p class="ag-cur__bubble"></p>`;
    el.querySelector('.ag-cur__name')!.textContent = this.o.labels.names[id];
    const box = this.div('ag-sel');
    box.style.setProperty('--c', COLORS[id]);
    box.innerHTML = '<i></i><i></i><i></i><i></i><span class="ag-sel__size"></span>';
    this.sels.set(id, { box, size: box.querySelector('.ag-sel__size')!, el: null });
    const seed = 977 * (i + 1);
    return {
      id, x: 0, y: 0, visible: false, tool: 'arrow', move: null, follow: null, pin: null, bubbleUntil: 0, swatch: null, rand: rng(seed), seed,
      el, svg: el.querySelector('svg')!, ptr: el.querySelector('path')!, bubble: el.querySelector('.ag-cur__bubble')!, swatchEl: el.querySelector('.ag-cur__swatch')!,
    };
  }

  private setTool(c: Cur, t: Tool) {
    c.tool = t;
    const [d, hx, hy] = TOOLS[t];
    c.ptr.setAttribute('d', d);
    c.svg.style.transform = `translate(${-hx}px, ${-hy}px)`;
    c.el.dataset.tool = t;
  }

  private setFocus(id: AgentId | null) {
    if (this.focus === id) return;
    this.focus = id;
    this.o.flow.setFocus(id);
    this.cursors.forEach((c) => c.el.classList.toggle('is-dim', id !== null && c.id !== id));
  }

  // --- events ------------------------------------------------------------------------------------

  private apply(ev: ResolvedEvent, instant: boolean) {
    const I = instant || this.o.reduced;
    const flow = this.o.flow;
    const agent = ev.agent && ev.agent !== 'orch' ? (ev.agent as AgentId) : null;
    const cur = agent ? this.cursors.get(agent)! : null;
    if (agent && FOCUS_ACTIONS.has(ev.do)) this.setFocus(agent);

    switch (ev.do) {
      case 'phase':
        this.phase = ev.phase!;
        flow.setPhase(ev.phase!);
        if (ev.phase === 'review') this.hideGrid();
        break;
      case 'spawn': this.spawn(ev, I); break;
      case 'assign':
        if (!ev.to || ev.to === 'orch') break;
        flow.send('orch', ev.to, instant ? null : ev.at);
        flow.setStatus(ev.to, ev.status ?? 'working');
        if (ev.text) flow.addLog('orch', ev.to, ev.text);
        break;
      case 'deliver':
        if (!agent) break;
        flow.send(agent, 'orch', instant ? null : ev.at);
        flow.setStatus(agent, 'done');
        if (ev.text) flow.addLog(agent, 'orch', ev.text);
        break;
      case 'say':
        if (!ev.text) break;
        if (ev.agent && ev.to) flow.send(ev.agent, ev.to, instant ? null : ev.at);
        if (cur && !instant) this.bubble(cur, ev.text, ev.dur);
        flow.addLog(ev.agent ?? 'orch', ev.to, ev.text);
        break;
      case 'move': if (cur) this.moveTo(cur, ev, I); break;
      case 'select': if (agent) this.select(agent, this.first(ev.target)); break;
      case 'deselect': if (agent) this.select(agent, null); break;
      case 'reveal': this.all(ev.target).forEach((el) => (el.dataset.buildState = ev.state ?? 'content')); break;
      case 'place': this.all(ev.target).forEach((el) => this.setXf(el, ev.xf ?? {})); break;
      case 'drag': case 'resize': if (cur) this.transform(cur, ev, I); break;
      case 'type': if (cur) this.type(cur, ev, I); break;
      case 'count': if (cur) this.count(cur, ev, I); break;
      case 'grid': this.showGrid(ev, agent); break;
      case 'pick':
        if (!cur) break;
        this.setTool(cur, 'dropper');
        cur.swatch = ev.color ?? null;
        cur.swatchEl.style.background = ev.color ?? 'transparent';
        cur.el.classList.add('has-swatch');
        if (!I) { cur.el.classList.remove('is-pick'); void cur.el.offsetWidth; cur.el.classList.add('is-pick'); }
        break;
      case 'fix': if (cur) this.paintFix(cur, ev, I); break;
      case 'err': { const e = ev.error ? this.errors.get(ev.error) : null; if (e) this.applyError(e); break; }
      case 'sweep': this.startSweep(ev, I); break;
      case 'approve':
        AGENTS.forEach((a) => flow.setStatus(a, 'done'));
        this.errors.forEach((e) => { e.mark?.remove(); e.mark = null; });
        break;
      case 'park':
        this.cursors.forEach((c) => { c.visible = false; c.el.classList.remove('is-on'); });
        this.sels.forEach((s) => (s.el = null));
        this.setFocus(null);
        break;
    }
    if (instant) this.render();
  }

  private spawn(ev: ResolvedEvent, I: boolean) {
    const src = this.first(ev.target);
    const r = src ? this.crect(src) : { x: this.sc.x + this.fb.w / 2, y: this.sc.y + this.fb.h / 2, w: 0, h: 0 };
    const c0 = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const k = clamp(this.fb.w / 900, 0.45, 1);
    const spread: Pt[] = [{ x: -190, y: -120 }, { x: 170, y: -140 }, { x: -160, y: 130 }, { x: 200, y: 110 }];
    AGENTS.forEach((id, i) => {
      const c = this.cursors.get(id)!;
      const to = { x: clamp(c0.x + spread[i].x * k, this.sc.x + 24, this.sc.x + this.fb.w - 120), y: clamp(c0.y + spread[i].y * k, this.sc.y + 70, this.sc.y + this.fb.h - 60) };
      c.visible = true;
      c.el.classList.add('is-on');
      if (I) { c.x = to.x; c.y = to.y; return; }
      c.x = c0.x; c.y = c0.y;
      c.move = { start: ev.at + i * 110, dur: 820, path: makePath(c0, to, c.rand, 1.8) };
    });
  }

  private moveTo(c: Cur, ev: ResolvedEvent, I: boolean) {
    const el = this.first(ev.target);
    if (!el || !el.getClientRects().length) return;
    if (!c.swatch) this.setTool(c, 'arrow');
    c.follow = null; c.pin = null;
    c.visible = true;
    c.el.classList.add('is-on');
    const p = this.anchor(this.crect(el), ev.anchor);
    this.ensureVisible(el);
    if (this.focus === c.id) this.o.onFocus?.(el.getBoundingClientRect());
    if (I) { c.x = p.x; c.y = p.y; c.move = null; return; }
    const from = this.cursorPos(c);
    c.x = from.x; c.y = from.y;
    const d = Math.hypot(p.x - from.x, p.y - from.y);
    c.move = { start: ev.at, dur: ev.dur ?? travelMs(d), path: makePath(from, p, c.rand) };
  }

  private select(agent: AgentId, el: HTMLElement | null) {
    const s = this.sels.get(agent)!;
    if (el && !el.getClientRects().length) el = null;
    s.el = el;
    s.box.classList.toggle('is-on', !!el);
    if (el) s.size.textContent = `${el.offsetWidth} × ${el.offsetHeight}`;
  }

  private bubble(c: Cur, text: string, dur?: number) {
    c.bubble.textContent = text;
    c.bubbleUntil = this.elapsed + (dur ?? clamp(1500 + text.length * 42, 1900, 4200));
    c.el.classList.remove('has-bubble');
    void c.el.offsetWidth;
    c.el.classList.add('has-bubble');
  }

  /** Grab point of the cursor relative to the element box, as fractions (works for drag and resize). */
  private attach(c: Cur, el: HTMLElement, anchor?: Anchor) {
    const r = this.crect(el);
    if (anchor) { const p = this.anchor(r, anchor); c.x = p.x; c.y = p.y; c.move = null; }
    const pos = this.cursorPos(c);
    c.follow = { el, fx: r.w ? clamp((pos.x - r.x) / r.w, 0, 1) : 0.5, fy: r.h ? clamp((pos.y - r.y) / r.h, 0, 1) : 0.5 };
  }
  private detach(c: Cur) {
    if (!c.follow) return;
    const p = this.cursorPos(c);
    c.x = p.x; c.y = p.y; c.follow = null;
  }

  private transform(c: Cur, ev: ResolvedEvent, I: boolean) {
    const el = this.first(ev.target);
    if (!el) return;
    const e = ev.error ? this.errors.get(ev.error) ?? null : null;
    const fixing = !!e && e.state !== 'pending';
    if (e && !fixing && e.def.origin) { this.touch(el); el.style.transformOrigin = e.def.origin; }
    const from = this.getXf(el);
    const to: Xf = ev.xf ?? (e && !fixing ? e.def.xf ?? {} : {});
    if (fixing) this.markState(e!, 'fixing', c.id);
    this.setTool(c, ev.do === 'resize' ? 'resize' : 'move');
    c.visible = true;
    c.el.classList.add('is-on');
    if (!I) this.attach(c, el, ev.do === 'resize' ? 'br' : undefined);
    if (this.focus === c.id && this.o.onFocus) {
      const r = el.getBoundingClientRect();
      this.o.onFocus(new DOMRect(r.x + (to.x ?? 0) - (from.x ?? 0), r.y + (to.y ?? 0) - (from.y ?? 0), r.width, r.height));
    }
    this.tween(ev.at, ev.dur ?? 750, (k) => this.setXf(el, this.lerpXf(from, to, easeInOut(k))), () => {
      this.detach(c);
      this.setTool(c, 'arrow');
      if (e) { if (fixing) this.fixDone(e); else e.state = 'active'; }
    }, I);
  }

  private undoText(e: ErrState | null) {
    if (!e || e.state === 'pending') return false;
    const el = this.first(e.def.target);
    const p = el && this.pristine.get(el);
    if (el && p && e.def.swap) { el.innerHTML = p.html; this.dirtyHtml.delete(el); }
    this.markState(e, 'fixing', e.def.owner);
    return true;
  }

  private type(c: Cur, ev: ResolvedEvent, I: boolean) {
    const el = this.first(ev.target);
    if (!el) return;
    const e = ev.error ? this.errors.get(ev.error) ?? null : null;
    const fixing = this.undoText(e);
    if (I) { if (fixing) this.fixDone(e!); return; }
    this.touch(el);
    const spans = this.splitChars(el);
    this.dirtyHtml.add(el);
    const n = spans.length;
    this.setTool(c, 'text');
    c.visible = true;
    c.el.classList.add('is-on');
    c.move = null; c.follow = null;
    this.caret = { span: null, color: COLORS[c.id] };
    this.caretEl.style.setProperty('--c', COLORS[c.id]);
    let shown = 0;
    this.tween(ev.at, ev.dur ?? clamp(n * 42, 500, 3200), (k) => {
      const m = Math.min(n, Math.ceil(k * n));
      for (; shown < m; shown++) spans[shown].classList.add('on');
      const last = spans[Math.max(0, m - 1)];
      if (last && this.caret) {
        this.caret.span = last;
        const r = this.crect(last);
        c.pin = { x: r.x + r.w + 4, y: r.y + r.h * 0.8 };
      }
    }, () => {
      const p = this.pristine.get(el);
      if (p) el.innerHTML = p.html;
      this.dirtyHtml.delete(el);
      this.caret = null;
      if (c.pin) { c.x = c.pin.x; c.y = c.pin.y; c.pin = null; }
      this.setTool(c, 'arrow');
      if (fixing) this.fixDone(e!);
    }, false);
  }

  private splitChars(el: HTMLElement): HTMLElement[] {
    const spans: HTMLElement[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      if (!node.data.trim()) continue;
      const frag = document.createDocumentFragment();
      for (const ch of node.data) {
        if (/\s/.test(ch)) { frag.append(ch); continue; }
        const s = document.createElement('span');
        s.className = 'ag-ch';
        s.textContent = ch;
        frag.append(s);
        spans.push(s);
      }
      node.replaceWith(frag);
    }
    return spans;
  }

  private count(c: Cur, ev: ResolvedEvent, I: boolean) {
    const el = this.first(ev.target);
    if (!el) return;
    const e = ev.error ? this.errors.get(ev.error) ?? null : null;
    const fixing = this.undoText(e);
    if (I) { if (fixing) this.fixDone(e!); return; }
    this.touch(el);
    this.dirtyHtml.add(el);
    const final = el.textContent ?? '';
    const digits = [...final].map((ch, i) => (/\d/.test(ch) ? i : -1)).filter((i) => i >= 0);
    this.setTool(c, 'text');
    c.visible = true;
    c.el.classList.add('is-on');
    const rand = rng(final.length * 31 + 7);
    this.tween(ev.at, ev.dur ?? 1100, (k) => {
      const settled = Math.floor(k * (digits.length + 0.999));
      const chars = [...final];
      digits.forEach((pos, i) => { if (i >= settled) chars[pos] = String(Math.floor(rand() * 10)); });
      el.textContent = chars.join('');
    }, () => {
      el.textContent = final;
      this.setTool(c, 'arrow');
      if (fixing) this.fixDone(e!);
    });
  }

  private paintFix(c: Cur, ev: ResolvedEvent, I: boolean) {
    const e = ev.error ? this.errors.get(ev.error) : null;
    if (!e || e.state === 'pending' || e.state === 'fixed') return;
    const el = this.first(e.def.target);
    if (!el) return;
    this.markState(e, 'fixing', c.id);
    if (!I) el.style.transition = 'color 500ms, background-color 500ms, border-color 500ms, box-shadow 500ms';
    Object.keys(e.def.paint ?? {}).forEach((k) => el.style.removeProperty(k));
    if (e.def.swap) { const p = this.pristine.get(el); if (p) el.innerHTML = p.html; }
    const from = this.getXf(el);
    this.tween(ev.at, ev.dur ?? 650, (k) => { if (e.def.xf) this.setXf(el, this.lerpXf(from, {}, easeInOut(k))); }, () => {
      c.swatch = null;
      c.el.classList.remove('has-swatch', 'is-pick');
      this.setTool(c, 'arrow');
      this.fixDone(e);
    }, I);
  }

  private applyError(e: ErrState) {
    const el = this.first(e.def.target);
    if (!el) return;
    this.touch(el);
    e.state = 'active';
    if (e.def.origin) el.style.transformOrigin = e.def.origin;
    if (e.def.xf) this.setXf(el, { ...this.getXf(el), ...e.def.xf });
    Object.entries(e.def.paint ?? {}).forEach(([k, v]) => el.style.setProperty(k, v));
    const sw = e.def.swap;
    if (sw) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode as Text;
        if (t.data.includes(sw[0])) { t.data = t.data.replace(sw[0], sw[1]); this.dirtyHtml.add(el); break; }
      }
    }
  }

  /** Remove an error without animation (skip / safety net at the end). */
  private clearError(e: ErrState) {
    const el = this.first(e.def.target);
    if (el) {
      Object.keys(e.def.paint ?? {}).forEach((k) => el.style.removeProperty(k));
      if (e.def.xf) this.setXf(el, {});
      const p = this.pristine.get(el);
      if (e.def.swap && p) el.innerHTML = p.html;
    }
    e.state = 'fixed';
  }

  private fixDone(e: ErrState) {
    if (e.state === 'fixed') return;
    e.state = 'fixed';
    this.fixed++;
    this.markState(e, 'fixed');
    const mark = e.mark;
    this.tween(this.elapsed, 1300, () => {}, () => { mark?.remove(); if (e.mark === mark) e.mark = null; });
    this.hud();
  }

  private flag(e: ErrState, silent: boolean) {
    if (e.state !== 'active') return;
    const target = this.first(e.def.target);
    if (!target || !target.getClientRects().length) return; // not rendered at this width (e.g. nav on phones)
    e.state = 'flagged';
    e.n = ++this.found;
    const m = this.div('ag-mark');
    m.innerHTML = '<span class="ag-mark__badge"></span><span class="ag-mark__label"></span>';
    m.querySelector('.ag-mark__badge')!.textContent = String(e.n);
    m.querySelector('.ag-mark__label')!.textContent = e.def.flag;
    e.mark = m;
    this.markState(e, 'flagged');
    const qa = this.cursors.get('qa')!;
    if (!silent) this.bubble(qa, e.def.flag, 2200);
    this.o.flow.addLog('qa', 'orch', `${e.n}. ${e.def.flag}`);
    this.hud();
  }

  private markState(e: ErrState, s: 'flagged' | 'fixing' | 'fixed', by?: AgentId) {
    if (s !== 'flagged') e.state = s === 'fixed' ? 'fixed' : 'fixing';
    if (!e.mark) return;
    e.mark.dataset.state = s;
    if (by) e.mark.style.setProperty('--c', COLORS[by]);
    if (s === 'fixed') e.mark.querySelector('.ag-mark__label')!.textContent = this.o.labels.fixed;
  }

  private showGrid(ev: ResolvedEvent, agent: AgentId | null) {
    const el = this.first(ev.target);
    if (!el || !ev.cols) { this.hideGrid(); return; }
    this.grid = { el, color: agent ? COLORS[agent] : COLORS.design };
    this.gridEl.replaceChildren(...Array.from({ length: ev.cols }, () => document.createElement('i')));
    this.gridEl.style.setProperty('--c', this.grid.color);
    this.gridEl.classList.add('is-on');
  }
  private hideGrid() { this.grid = null; this.gridEl.classList.remove('is-on'); }

  private startSweep(ev: ResolvedEvent, I: boolean) {
    const found = this.all(ev.target);
    const els = found.length ? found : [this.o.root];
    if (I) { this.errors.forEach((e) => this.flag(e, true)); return; }
    // region fits in the frame: bring it into view once, the line travels inside it
    const r = this.union(els);
    if (this.o.follow && r.h <= this.fb.h && (r.y < this.sc.y - 1 || r.y + r.h > this.sc.y + this.fb.h + 1)) {
      const opts: ScrollToOptions = { top: Math.max(0, r.y), behavior: this.o.reduced ? 'auto' : 'smooth' };
      if (this.o.frame) this.o.frame.scrollTo(opts); else window.scrollTo(opts);
    }
    this.sweep = { els, start: ev.at, dur: ev.dur ?? 3200 };
    this.sweepEl.classList.add('is-on');
    const qa = this.cursors.get('qa')!;
    qa.visible = true; qa.move = null; qa.follow = null;
    qa.el.classList.add('is-on');
    this.setTool(qa, 'arrow');
  }

  private stepSweep(instant: boolean) {
    const s = this.sweep;
    if (!s) return;
    const r = this.union(s.els);
    const k = instant ? 1 : clamp((this.elapsed - s.start) / s.dur, 0, 1);
    const y = r.y + r.h * easeInOut(k);
    const qa = this.cursors.get('qa')!;
    qa.pin = { x: r.x + r.w * 0.86, y };
    this.errors.forEach((e) => {
      if (e.state !== 'active') return;
      const el = this.first(e.def.target);
      if (!el) return;
      const er = this.crect(el);
      if (er.y + Math.min(er.h, 60) * 0.5 <= y) this.flag(e, instant);
    });
    this.sweepEl.style.transform = `translate(${(r.x - this.sc.x).toFixed(1)}px, ${(y - this.sc.y).toFixed(1)}px)`;
    this.sweepEl.style.width = `${r.w}px`;
    // Region taller than the frame: keep the scan line in view while it travels down.
    if (this.o.follow && !instant && r.h > this.fb.h && performance.now() - this.userAt > 2500) {
      const { top = 0, bottom = 0 } = this.o.insets ?? {};
      const h = this.fb.h;
      if (y > this.sc.y + h - bottom - 70 || y < this.sc.y + top) {
        const f = this.o.frame;
        const max = f ? f.scrollHeight - f.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
        const to = clamp(y - top - (h - top - bottom) * 0.5, 0, Math.max(0, max));
        if (f) f.scrollTop = to; else window.scrollTo(0, to);
      }
    }
    if (k >= 1) {
      this.sweep = null;
      this.sweepEl.classList.remove('is-on');
      qa.x = qa.pin.x; qa.y = qa.pin.y; qa.pin = null;
    }
  }

  /** Bounding box of several elements (a sweep can cover the header + the hero). */
  private union(els: HTMLElement[]): Rect {
    const rs = els.map((e) => this.crect(e));
    const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
    return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
  }

  // --- render ------------------------------------------------------------------------------------

  private cursorPos(c: Cur): Pt {
    if (c.pin) return c.pin;
    if (c.follow) {
      const r = this.crect(c.follow.el);
      return { x: r.x + r.w * c.follow.fx, y: r.y + r.h * c.follow.fy };
    }
    if (c.move) {
      const k = clamp((this.elapsed - c.move.start) / c.move.dur, 0, 1);
      if (this.elapsed < c.move.start) return { x: c.x, y: c.y };
      const p = c.move.path(k);
      if (k >= 1) { c.x = p.x; c.y = p.y; c.move = null; }
      return p;
    }
    return { x: c.x, y: c.y };
  }

  private render() {
    const W = this.fb.w, H = this.fb.h;
    const running = this.status === 'running' && !this.o.reduced;
    this.cursors.forEach((c) => {
      if (!c.visible) return;
      const p = this.cursorPos(c);
      const idle = !c.move && !c.follow && !c.pin && running;
      const jx = idle ? Math.sin(this.elapsed / 820 + c.seed) * 1.4 : 0;
      const jy = idle ? Math.cos(this.elapsed / 1030 + c.seed) * 1.2 : 0;
      const sx = p.x - this.sc.x + jx, sy = p.y - this.sc.y + jy;
      c.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
      c.el.classList.toggle('flip-x', sx > W - 250);
      c.el.classList.toggle('flip-y', sy > H - 120);
      if (c.bubbleUntil && this.elapsed > c.bubbleUntil) { c.bubbleUntil = 0; c.el.classList.remove('has-bubble'); }
    });
    this.sels.forEach((s) => {
      if (!s.el) { s.box.classList.remove('is-on'); return; }
      s.box.classList.add('is-on');
      this.place(s.box, this.crect(s.el), 0);
    });
    this.errors.forEach((e) => {
      if (!e.mark) return;
      const el = this.first(e.def.target);
      if (!el) return;
      const r = this.crect(el);
      this.place(e.mark, r, 3);
      e.mark.classList.toggle('is-low', r.y - this.sc.y < 28);
      e.mark.classList.toggle('is-right', r.x - this.sc.x + 270 > W && r.x + r.w - this.sc.x > 270);
    });
    if (this.grid) this.place(this.gridEl, this.crect(this.grid.el), 0);
    if (this.caret?.span) {
      const r = this.crect(this.caret.span);
      this.caretEl.classList.add('is-on');
      this.caretEl.style.transform = `translate(${(r.x + r.w + 1 - this.sc.x).toFixed(1)}px, ${(r.y - this.sc.y).toFixed(1)}px)`;
      this.caretEl.style.height = `${r.h}px`;
    } else this.caretEl.classList.remove('is-on');
  }

  private place(box: HTMLElement, r: Rect, pad: number) {
    box.style.transform = `translate(${(r.x - pad - this.sc.x).toFixed(1)}px, ${(r.y - pad - this.sc.y).toFixed(1)}px)`;
    box.style.width = `${(r.w + pad * 2).toFixed(1)}px`;
    box.style.height = `${(r.h + pad * 2).toFixed(1)}px`;
  }
}

