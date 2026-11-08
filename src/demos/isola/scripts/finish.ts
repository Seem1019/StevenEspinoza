/**
 * Finish (colour) state. Source of truth: data-finish on [data-isola-root]; mirrored to ?finish= with setParams
 * (no history entry). Every listener (radios, price labels, 3D model) reacts to FINISH_EVENT.
 */
import { setParams } from '../../../scripts/url-state';
import { defaultFinish, getFinish, isFinish, type FinishId } from '../data';

export const FINISH_EVENT = 'isola:finish';

export const root = () => document.querySelector<HTMLElement>('[data-isola-root]');

export function currentFinish(): FinishId {
  const v = root()?.dataset.finish;
  return isFinish(v) ? v : defaultFinish;
}

export function applyFinish(id: FinishId, updateUrl = true): void {
  const r = root();
  if (!r) return;
  r.dataset.finish = id;
  if (updateUrl) setParams({ finish: id === defaultFinish ? null : id });
  document.dispatchEvent(new CustomEvent<FinishId>(FINISH_EVENT, { detail: id }));
}

export const finishColors = (id: FinishId) => {
  const f = getFinish(id);
  return { shell: f.shell, plate: f.plate, cushion: f.cushion, metal: f.metal };
};

interface I18n { currency: string; current: string; names: Record<FinishId, string>; lang: string }
let cache: I18n | null = null;
export function i18n(): I18n {
  const r = root();
  if (!cache || cache.lang !== r?.dataset.lang) cache = JSON.parse(r?.dataset.i18n ?? '{}') as I18n;
  return cache;
}
export const money = (n: number) => i18n().currency.replace('{n}', new Intl.NumberFormat(i18n().lang).format(n));
