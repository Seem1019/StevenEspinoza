/**
 * Orchestrator flow view: one "Orquestador" node wired to the four agents, packets travelling along the
 * wires, a status per node and a short chat-like log. Markup is server-rendered by
 * src/components/site/AgentFlow.astro; this class only updates it. Driven by the engine clock (pausable).
 */
import type { Actor, AgentId, AgentLabels, NodeStatus, Phase } from './types';
import { AGENTS, PHASES } from './types';
import { clamp, easeInOut } from './motion';

interface Packet { from: Actor; to: Actor; start: number; dur: number; el: SVGRectElement }

const MAX_LOG = 40;
const PACKET_MS = 620;
const SVG_NS = 'http://www.w3.org/2000/svg';

export class Flow {
  readonly root: HTMLElement;
  private labels: AgentLabels;
  private reduced: boolean;
  private wires = new Map<AgentId, SVGPathElement>();
  private layer: SVGGElement | null;
  private log: HTMLElement | null;
  private packets: Packet[] = [];
  private status = new Map<Actor, NodeStatus>();

  constructor(root: HTMLElement, labels: AgentLabels, reduced: boolean) {
    this.root = root;
    this.labels = labels;
    this.reduced = reduced;
    root.querySelectorAll<SVGPathElement>('[data-wire]').forEach((p) => this.wires.set(p.dataset.wire as AgentId, p));
    this.layer = root.querySelector<SVGGElement>('[data-packets]');
    this.log = root.querySelector<HTMLElement>('[data-flow-log]');
  }

  reset() {
    this.packets.forEach((p) => p.el.remove());
    this.packets = [];
    this.log?.replaceChildren();
    AGENTS.forEach((a) => this.setStatus(a, 'idle'));
    this.setFocus(null);
    this.setPhase('kickoff');
    this.root.dataset.flowState = 'idle';
  }

  setPhase(p: Phase) {
    this.root.dataset.phase = p;
    const i = PHASES.indexOf(p);
    this.root.querySelectorAll<HTMLElement>('[data-phase-step]').forEach((li) => {
      const j = PHASES.indexOf(li.dataset.phaseStep as Phase);
      li.dataset.state = j < i ? 'done' : j === i ? 'current' : 'next';
      if (j === i) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    const orch = this.root.querySelector<HTMLElement>('[data-node="orch"] [data-node-status]');
    if (orch) orch.textContent = this.labels.phases[p];
    this.root.querySelectorAll<HTMLElement>('[data-flow-phase]').forEach((el) => (el.textContent = this.labels.phases[p]));
    this.root.dataset.flowState = 'running';
  }

  setStatus(id: Actor, s: NodeStatus) {
    if (id === 'orch') return;
    this.status.set(id, s);
    this.root.querySelectorAll<HTMLElement>(`[data-node="${id}"]`).forEach((n) => {
      n.dataset.status = s;
      const label = n.querySelector<HTMLElement>('[data-node-status]');
      if (label) label.textContent = this.labels.status[s];
    });
    this.wires.get(id)?.setAttribute('data-status', s);
  }

  getStatus(id: AgentId) { return this.status.get(id) ?? 'idle'; }

  setFocus(id: AgentId | null) {
    this.root.querySelectorAll<HTMLElement>('[data-node]').forEach((n) => {
      if (n.dataset.node === id) n.dataset.focus = '';
      else delete n.dataset.focus;
    });
  }

  /** A packet travels from → to along the wires (agent → agent goes through the orchestrator). */
  send(from: Actor, to: Actor, start: number | null) {
    if (start === null || this.reduced || !this.layer || from === to) return;
    const el = document.createElementNS(SVG_NS, 'rect');
    el.setAttribute('width', '9');
    el.setAttribute('height', '9');
    el.setAttribute('x', '-4.5');
    el.setAttribute('y', '-4.5');
    el.setAttribute('rx', '1.5');
    el.setAttribute('class', `ag-packet ag-packet--${from === 'orch' ? to : from}`);
    this.layer.append(el);
    const hops = from !== 'orch' && to !== 'orch' ? 2 : 1;
    this.packets.push({ from, to, start, dur: PACKET_MS * hops, el });
  }

  tick(now: number) {
    if (!this.packets.length) return;
    this.packets = this.packets.filter((p) => {
      const k = clamp((now - p.start) / p.dur, 0, 1);
      const pt = this.pointAt(p, easeInOut(k));
      if (pt) p.el.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      if (k >= 1) { p.el.remove(); return false; }
      return true;
    });
  }

  /** Drop packets in flight (skip to the end). */
  flush() { this.packets.forEach((p) => p.el.remove()); this.packets = []; }

  private pointAt(p: Packet, k: number) {
    const along = (agent: AgentId, t: number, outward: boolean) => {
      const w = this.wires.get(agent);
      if (!w) return null;
      const len = w.getTotalLength();
      return w.getPointAtLength(len * (outward ? t : 1 - t));
    };
    if (p.from === 'orch') return along(p.to as AgentId, k, true);
    if (p.to === 'orch') return along(p.from as AgentId, k, false);
    return k < 0.5 ? along(p.from as AgentId, k * 2, false) : along(p.to as AgentId, (k - 0.5) * 2, true);
  }

  addLog(from: Actor, to: Actor | undefined, text: string) {
    if (!this.log) return;
    const li = document.createElement('li');
    li.className = 'ag-log__row';
    li.dataset.from = from;
    const who = document.createElement('b');
    who.className = 'ag-log__who';
    who.textContent = this.labels.names[from];
    li.append(who);
    if (to) {
      const dest = document.createElement('span');
      dest.className = 'ag-log__to';
      dest.dataset.to = to;
      dest.textContent = `→ ${this.labels.names[to]}`;
      li.append(dest);
    }
    const msg = document.createElement('span');
    msg.className = 'ag-log__msg';
    msg.textContent = text;
    li.append(msg);
    this.log.append(li);
    while (this.log.childElementCount > MAX_LOG) this.log.firstElementChild?.remove();
    this.log.scrollTop = this.log.scrollHeight;
    const last = this.root.querySelector<HTMLElement>('[data-flow-last]');
    if (last) { last.textContent = `${this.labels.names[from]}: ${text}`; last.dataset.from = from; }
  }

  done() {
    AGENTS.forEach((a) => this.setStatus(a, 'done'));
    this.setFocus(null);
    this.setPhase('close');
    this.root.dataset.flowState = 'done';
  }
}
