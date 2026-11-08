/**
 * Agents engine — scene contract (shared by the home intro and "Agentes en vivo").
 *
 * It is a SCRIPTED choreography (no real AI). A scene is just data:
 *   - errors: 3–5 deliberate mistakes (what is wrong, on which element, who fixes it)
 *   - events: a time-sorted list. Each event drives at the same time the cursors, the orchestrator
 *     flow, the message log and the page. Times are in SECONDS from the start.
 *
 * Where scenes live:
 *   - home:  src/showcase/scenes/home.ts            (messages in i18n `home` → intro.say.* / intro.flags.*)
 *   - demos: src/demos/<slug>/showcase/timeline.ts  (messages in i18n `<slug>` → showcase.say.* / showcase.flags.*)
 *
 * Targets: a `data-build` id ("hero") or any CSS selector (".hero__title", "[data-build=card2] .price"),
 * resolved inside the engine root. The engine (src/showcase/engine.ts) knows nothing about any scene.
 */
export type AgentId = 'design' | 'frontend' | 'copy' | 'qa';
export type Actor = AgentId | 'orch';
export const AGENTS: AgentId[] = ['design', 'frontend', 'copy', 'qa'];
/** Cursor / node colours: Diseño coral, Frontend cian, Copy amarillo, QA verde. */
export const AGENT_COLORS: Record<AgentId, string> = { design: '#ff7a45', frontend: '#4cc9f0', copy: '#ffd166', qa: '#3ddc97' };

export type Phase = 'kickoff' | 'build' | 'review' | 'close';
export const PHASES: Phase[] = ['kickoff', 'build', 'review', 'close'];

/** Orchestrator-flow node state. */
export type NodeStatus = 'idle' | 'working' | 'done' | 'fixing';

/**
 * hidden   -> invisible (opacity 0), space reserved (no CLS)
 * skeleton -> grey block of the exact final size
 * content  -> final content, static
 * motion   -> final content + its animations (CSS under [data-build-state="motion"])
 */
export type BuildState = 'hidden' | 'skeleton' | 'content' | 'motion';

/** Transform offsets (px / deg / factors). Missing fields = identity. Only transform → no layout shift. */
export interface Xf { x?: number; y?: number; r?: number; s?: number; sx?: number; sy?: number }

/** Point of the target's box the cursor goes to. */
export type Anchor = 'center' | 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r' | 't' | 'b' | 'end';

export interface SceneError {
  id: string;
  target: string;
  /** Agent that fixes it in the review phase. */
  owner: AgentId;
  /** Message key of QA's marker label (`<prefix>.flags.<flag>`). */
  flag: string;
  /** Wrong transform (overflowing size, misaligned position, distorted ratio, overlap). */
  xf?: Xf;
  origin?: string;
  /** Wrong paint, CSS properties in kebab-case (low contrast). Paint only: never layout. */
  paint?: Record<string, string>;
  /** Wrong text: replace `correct` with `wrong` inside the target text. */
  swap?: [correct: string, wrong: string];
  /** Wrong language: the same i18n key in the OTHER language (resolved at build time). */
  swapKey?: { ns: string; key: string };
}

export type Action =
  | 'phase'    // { phase }
  | 'spawn'    // cursors come out of `target` (or the frame centre)
  | 'assign'   // orchestrator → `to`: packet + status (`status`, default working) + optional `say`
  | 'deliver'  // `agent` → orchestrator: packet + status done + optional `say`
  | 'say'      // speech bubble next to `agent` + log line (optional `to`: also sends a packet)
  | 'move'     // `agent` cursor travels to `target` (`anchor`, `dur`)
  | 'select'   // selection box with handles around `target`
  | 'deselect'
  | 'reveal'   // set `state` on `target` (one or many elements)
  | 'place'    // put `target` instantly at offset `xf` (e.g. a pile, before a drag)
  | 'drag'     // `agent` drags `target` from its offset to `xf` (default: its place). With `error`: applies or fixes it
  | 'resize'   // same as drag, cursor on the bottom-right handle
  | 'type'     // `agent` types the text of `target` letter by letter (`dur`). With `error`: fixes a text error
  | 'count'    // digits of `target` roll until they settle (`dur`). With `error`: fixes a text error
  | 'grid'     // layout-grid guides over `target` (`cols`; 0 hides)
  | 'pick'     // eyedropper samples `color` at the cursor
  | 'fix'      // `agent` applies the fix of `error` (paint transitions back; uses the picked colour)
  | 'err'      // apply `error` silently during the build
  | 'sweep'    // QA scans `target` top → bottom (`dur`) and flags every active error it crosses
  | 'approve'  // QA sign-off: every node → done
  | 'park';    // cursors leave

export interface Ev {
  /** Seconds from the start of the scene. */
  at: number;
  do: Action;
  agent?: Actor;
  target?: string;
  to?: Actor;
  /** Message key (`<prefix>.say.<key>`). */
  say?: string;
  state?: BuildState;
  xf?: Xf;
  /** Seconds. */
  dur?: number;
  anchor?: Anchor;
  error?: string;
  color?: string;
  phase?: Phase;
  status?: NodeStatus;
  cols?: number;
}

export interface Scene {
  id: string;
  /** i18n namespace holding the messages. */
  ns: string;
  /** Key prefix inside the namespace: `<prefix>.say.*`, `<prefix>.flags.*`. */
  prefix: string;
  /** Seconds (30–45). */
  duration: number;
  errors: SceneError[];
  events: Ev[];
}

// --- serialized form embedded in the page (built by resolve.ts) -------------------------------

export interface ResolvedError {
  id: string;
  target: string;
  owner: AgentId;
  flag: string;
  xf?: Xf;
  origin?: string;
  paint?: Record<string, string>;
  swap?: [string, string];
}

export interface ResolvedEvent extends Omit<Ev, 'say' | 'at' | 'dur'> {
  /** ms */
  at: number;
  /** ms */
  dur?: number;
  text?: string;
}

export interface ResolvedScene {
  id: string;
  /** ms */
  duration: number;
  errors: ResolvedError[];
  events: ResolvedEvent[];
}

/** Translated labels shared by every scene (i18n namespace `agents`). */
export interface AgentLabels {
  names: Record<Actor, string>;
  status: Record<NodeStatus, string>;
  phases: Record<Phase, string>;
  fixed: string;
}
