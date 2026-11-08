/**
 * Showcase engine: plays a ResolvedTimeline against a cloned BuildPreview.
 * Generic: it only knows data-build parts, agent ids and log strings.
 *
 * DOM contract (see src/pages/[lang]/showcase/index.astro):
 *   [data-sc-root]
 *     [data-sc-stage-viewport] > [data-sc-stage-sizer] > [data-sc-stage]   (preview is cloned here)
 *     template[data-sc-preview="<slug>"]
 *     [data-sc-agent="<id>"] > [data-sc-status], [data-sc-log]
 *     [data-sc-progress], [data-sc-time], [data-sc-layers]
 */
import type { AgentId, BuildState, ResolvedTimeline } from './types';

type Step = ResolvedTimeline['steps'][number];
export type EngineStatus = 'idle' | 'running' | 'done';

interface Labels { working: string; done: string; idle: string }

interface TypingLine { el: HTMLElement; text: string; start: number }

const MS_PER_CHAR = 14;
const MAX_LINES_PER_AGENT = 40;

export class BuildEngine {
  private root: HTMLElement;
  private timelines: Map<string, ResolvedTimeline>;
  private reduced: boolean;
  private labels: Labels;
  private onStatus: (s: EngineStatus) => void;

  private slug = '';
  private tl: ResolvedTimeline | null = null;
  private stage: HTMLElement;
  private viewport: HTMLElement;
  private sizer: HTMLElement;
  private parts = new Map<string, HTMLElement[]>();
  private stepIndex = 0;
  private elapsed = 0;
  private lastTick = 0;
  private raf = 0;
  private typing: TypingLine[] = [];
  private status: EngineStatus = 'idle';
  private scale = 1;
  private ro: ResizeObserver;
  private lastScrollTarget = '';

  constructor(root: HTMLElement, timelines: ResolvedTimeline[], opts: { reduced: boolean; labels: Labels; onStatus: (s: EngineStatus) => void }) {
    this.root = root;
    this.timelines = new Map(timelines.map((t) => [t.slug, t]));
    this.reduced = opts.reduced;
    this.labels = opts.labels;
    this.onStatus = opts.onStatus;
    this.stage = root.querySelector<HTMLElement>('[data-sc-stage]')!;
    this.viewport = root.querySelector<HTMLElement>('[data-sc-stage-viewport]')!;
    this.sizer = root.querySelector<HTMLElement>('[data-sc-stage-sizer]')!;
    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(this.viewport);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  /** Mount the preview of `slug` with every part hidden. */
  load(slug: string): void {
    const tl = this.timelines.get(slug);
    const tpl = this.root.querySelector<HTMLTemplateElement>(`template[data-sc-preview="${slug}"]`);
    if (!tl || !tpl) return;
    this.stop();
    this.slug = slug;
    this.tl = { ...tl, steps: [...tl.steps].sort((a, b) => a.at - b.at) };
    this.stage.replaceChildren(tpl.content.cloneNode(true));
    this.parts.clear();
    this.stage.querySelectorAll<HTMLElement>('[data-build]').forEach((el) => {
      el.dataset.buildState = 'hidden';
      const id = el.dataset.build!;
      const list = this.parts.get(id) ?? [];
      list.push(el);
      this.parts.set(id, list);
    });
    this.stepIndex = 0;
    this.elapsed = 0;
    this.typing = [];
    this.lastScrollTarget = '';
    this.root.querySelectorAll<HTMLElement>('[data-sc-log]').forEach((l) => l.replaceChildren());
    this.setAgentStatus(null, 'idle');
    this.viewport.scrollTop = 0;
    this.fit();
    this.updateHud();
    this.setStatus('idle');
  }

  play(): void {
    if (!this.tl) return;
    if (this.status === 'done' || this.stepIndex > 0) this.load(this.slug);
    this.setStatus('running');
    this.lastTick = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Apply everything that is left instantly. */
  skip(): void {
    if (!this.tl) return;
    if (this.status === 'idle') this.setStatus('running');
    cancelAnimationFrame(this.raf);
    while (this.stepIndex < this.tl.steps.length) this.apply(this.tl.steps[this.stepIndex++], true);
    this.typing.forEach((l) => (l.el.textContent = l.text));
    this.typing = [];
    this.elapsed = this.tl.duration;
    this.finish();
  }

  replay(): void {
    this.load(this.slug);
    this.play();
  }

  destroy(): void {
    this.stop();
    this.ro.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  get current() { return this.slug; }

  // --- internals -------------------------------------------------------------

  private stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private onVisibility = () => {
    // Pause the clock while the tab is hidden; resume without jumping ahead.
    if (document.hidden) this.stop();
    else if (this.status === 'running') {
      this.lastTick = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  private tick = (now: number) => {
    if (!this.tl) return;
    this.elapsed += Math.min(now - this.lastTick, 100);
    this.lastTick = now;
    const steps = this.tl.steps;
    while (this.stepIndex < steps.length && steps[this.stepIndex].at <= this.elapsed) {
      this.apply(steps[this.stepIndex++], false);
    }
    this.typeLines(now);
    this.updateHud();
    if (this.stepIndex >= steps.length && this.elapsed >= this.tl.duration && this.typing.length === 0) {
      this.finish();
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private apply(step: Step, instant: boolean) {
    if (step.target && step.state) this.setPart(step.target, step.state, instant);
    this.log(step.agent, step.text, instant);
    this.setAgentStatus(step.agent, 'working');
  }

  private setPart(id: string, state: BuildState, instant: boolean) {
    const els = this.parts.get(id);
    if (!els) return;
    els.forEach((el) => {
      el.dataset.buildState = state;
      if (!instant && !this.reduced) {
        el.setAttribute('data-build-active', '');
        window.setTimeout(() => el.removeAttribute('data-build-active'), 700);
      }
    });
    if (!instant) this.scrollTo(els[0], id);
  }

  private scrollTo(el: HTMLElement, id: string) {
    if (id === this.lastScrollTarget) return;
    this.lastScrollTarget = id;
    // offsetTop is in unscaled preview pixels; the stage is scaled by `this.scale`.
    let top = 0;
    let node: HTMLElement | null = el;
    while (node && node !== this.stage) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
    const target = Math.max(0, top * this.scale - this.viewport.clientHeight * 0.25);
    this.viewport.scrollTo({ top: target, behavior: this.reduced ? 'auto' : 'smooth' });
  }

  private log(agent: AgentId, text: string, instant: boolean) {
    const box = this.root.querySelector<HTMLElement>(`[data-sc-agent="${agent}"] [data-sc-log]`);
    if (!box) return;
    const li = document.createElement('li');
    box.append(li);
    while (box.childElementCount > MAX_LINES_PER_AGENT) box.firstElementChild?.remove();
    if (instant || this.reduced) li.textContent = text;
    else this.typing.push({ el: li, text, start: performance.now() });
    box.scrollTop = box.scrollHeight;
  }

  private typeLines(now: number) {
    if (!this.typing.length) return;
    this.typing = this.typing.filter((l) => {
      const n = Math.floor((now - l.start) / MS_PER_CHAR);
      l.el.textContent = l.text.slice(0, n);
      return n < l.text.length;
    });
  }

  private setAgentStatus(agent: AgentId | null, status: 'idle' | 'working' | 'done') {
    this.root.querySelectorAll<HTMLElement>('[data-sc-agent]').forEach((panel) => {
      const id = panel.dataset.scAgent as AgentId;
      let s = panel.dataset.status as 'idle' | 'working' | 'done' | undefined;
      if (agent === null) s = status;
      else if (id === agent) s = status;
      else if (s === 'working') s = 'done';
      panel.dataset.status = s ?? 'idle';
      const label = panel.querySelector<HTMLElement>('[data-sc-status]');
      if (label) label.textContent = this.labels[(s ?? 'idle') as keyof Labels];
    });
  }

  private finish() {
    this.stop();
    // Everything visible at the end, whatever the script left out.
    this.parts.forEach((els) => els.forEach((el) => { if (el.dataset.buildState === 'hidden' || el.dataset.buildState === 'skeleton') el.dataset.buildState = 'content'; }));
    this.setAgentStatus(null, 'done');
    this.updateHud();
    this.viewport.scrollTo({ top: 0, behavior: this.reduced ? 'auto' : 'smooth' });
    this.setStatus('done');
  }

  private setStatus(s: EngineStatus) {
    this.status = s;
    this.root.dataset.scStatus = s;
    this.onStatus(s);
  }

  private updateHud() {
    if (!this.tl) return;
    const total = this.tl.steps.length;
    const p = Math.min(1, this.elapsed / this.tl.duration);
    const bar = this.root.querySelector<HTMLElement>('[data-sc-progress]');
    bar?.style.setProperty('--p', String(p));
    bar?.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    const time = this.root.querySelector('[data-sc-time]');
    if (time) time.textContent = `${(this.elapsed / 1000).toFixed(1)} / ${(this.tl.duration / 1000).toFixed(0)} s`;
    const layers = this.root.querySelector('[data-sc-layers]');
    if (layers) layers.textContent = `${this.stepIndex}/${total}`;
  }

  private fit() {
    this.scale = this.viewport.clientWidth / 1280;
    this.stage.style.transform = `scale(${this.scale})`;
    // offsetHeight ignores the transform -> unscaled preview height.
    this.sizer.style.height = `${Math.ceil(this.stage.offsetHeight * this.scale)}px`;
  }
}
