/**
 * Showcase "agentes en vivo" — declarative timeline contract.
 *
 * It is a SCRIPTED choreography (no real AI). Each demo ships:
 *   - src/demos/<slug>/showcase/timeline.ts   -> default export: Timeline
 *   - src/demos/<slug>/BuildPreview.astro     -> static miniature of the demo (no JS, no network),
 *                                                designed at 1280px wide; parts marked with data-build="<id>"
 *   - log strings in src/i18n/<lang>/<slug>.json under "showcase.logs.<key>"
 *
 * The engine (src/showcase/engine.ts) knows nothing about any demo. Register the timeline in
 * src/showcase/registry.ts and the preview in src/pages/[lang]/showcase/index.astro.
 */
export type AgentId = 'design' | 'frontend' | 'copy' | 'qa';

/**
 * hidden   -> invisible (opacity 0), space reserved (no CLS)
 * skeleton -> grey wireframe block of the exact final size, content invisible
 * content  -> final content, static
 * motion   -> final content + its animations enabled (CSS under [data-build-state="motion"])
 */
export type BuildState = 'hidden' | 'skeleton' | 'content' | 'motion';

export interface TimelineStep {
  /** ms from start. Steps are sorted by the engine. */
  at: number;
  agent: AgentId;
  /** key under "showcase.logs" in the demo namespace. */
  log: string;
  /** value of a data-build attribute inside BuildPreview. */
  target?: string;
  /** state applied to target (required if target is set). */
  state?: BuildState;
}

export interface Timeline {
  slug: string;
  /** total ms (≈ 18000–24000). Last step must be <= duration. */
  duration: number;
  steps: TimelineStep[];
}

/** Serialized form embedded in the page (logs already translated). */
export interface ResolvedTimeline {
  slug: string;
  duration: number;
  steps: (Omit<TimelineStep, 'log'> & { text: string })[];
}
