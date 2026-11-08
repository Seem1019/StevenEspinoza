/** Build-time: turns a Scene (seconds + i18n keys) into the JSON the engine plays (ms + strings). */
import { locales, useT, type Lang } from '../i18n';
import type { AgentLabels, ResolvedScene, Scene } from './types';
import { AGENTS, PHASES } from './types';

export function resolveScene(scene: Scene, lang: Lang): ResolvedScene {
  const t = useT(lang, scene.ns);
  const other = locales.find((l) => l !== lang)!;
  const ms = (s: number) => Math.round(s * 1000);
  const last = Math.max(...scene.events.map((e) => e.at + (e.dur ?? 0)));
  if (last > scene.duration) throw new Error(`[scene ${scene.id}] last event ends at ${last}s, after duration ${scene.duration}s`);
  const ids = new Set(scene.errors.map((e) => e.id));
  for (const ev of scene.events) if (ev.error && !ids.has(ev.error)) throw new Error(`[scene ${scene.id}] unknown error "${ev.error}"`);
  return {
    id: scene.id,
    duration: ms(scene.duration),
    errors: scene.errors.map(({ swapKey, flag, ...e }) => ({
      ...e,
      flag: t(`${scene.prefix}.flags.${flag}`),
      swap: swapKey ? [useT(lang, swapKey.ns)(swapKey.key), useT(other, swapKey.ns)(swapKey.key)] : e.swap,
    })),
    events: scene.events.map(({ say, at, dur, ...ev }) => ({
      ...ev,
      at: ms(at),
      ...(dur !== undefined ? { dur: ms(dur) } : {}),
      ...(say ? { text: t(`${scene.prefix}.say.${say}`) } : {}),
    })),
  };
}

export function agentLabels(lang: Lang): AgentLabels {
  const t = useT(lang, 'agents');
  return {
    names: { orch: t('names.orch'), ...Object.fromEntries(AGENTS.map((a) => [a, t(`names.${a}`)])) } as AgentLabels['names'],
    status: { idle: t('status.idle'), working: t('status.working'), done: t('status.done'), fixing: t('status.fixing') },
    phases: Object.fromEntries(PHASES.map((p) => [p, t(`phases.${p}`)])) as AgentLabels['phases'],
    fixed: t('fixed'),
  };
}
