/**
 * 3D stage controller (small, always bundled). three.js itself is a separate chunk loaded with import() only when
 *   (a) the stage is within ~1 viewport (IntersectionObserver) AND
 *   (b) the visitor has interacted at least once (scroll / wheel / touch / pointer / key).
 * Lighthouse never scrolls -> never downloads three. Until ready, the SVG poster fills the exact canvas box.
 * Reduced motion: nothing here runs; CSS shows the static exploded SVG with every callout.
 */
import { onPage, prefersReducedMotion } from '../../../scripts/lifecycle';
import { FINISH_EVENT, currentFinish, finishColors } from './finish';
import type { FinishId } from '../data';
import type { StageApi } from '../three/scene';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

onPage(() => {
  const stage = document.querySelector<HTMLElement>('[data-isola-stage]');
  if (!stage) return;
  if (prefersReducedMotion()) return;

  const canvas = stage.querySelector<HTMLCanvasElement>('[data-stage-canvas]')!;
  const titleA = stage.querySelector<HTMLElement>('[data-phase="a"]');
  const titleB = stage.querySelector<HTMLElement>('[data-phase="b"]');
  const hint = stage.querySelector<HTMLElement>('[data-stage-hint]');
  const notes = [...stage.querySelectorAll<HTMLElement>('[data-note]')];
  const narrowMq = window.matchMedia('(max-width: 719px)');

  const ac = new AbortController();
  const firstAc = new AbortController();
  let scrollAc: AbortController | null = null;
  let api: StageApi | null = null;
  let near = false, inView = false, interacted = false, loading = false, disposed = false;
  let raf = 0;
  let lastP = -1;

  stage.classList.add('is-live');

  const progress = () => {
    const r = stage.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp01(-r.top / total) : 0;
  };

  const paint = () => {
    raf = 0;
    const p = progress();
    if (p === lastP) return;
    lastP = p;
    if (titleA) titleA.style.opacity = String(1 - smooth(0.34, 0.44, p));
    if (titleB) { const o = smooth(0.46, 0.56, p); titleB.style.opacity = String(o); titleB.style.transform = `translateY(${(1 - o) * 14}px)`; }
    if (hint) hint.style.opacity = String(1 - smooth(0.04, 0.14, p));
    const narrow = narrowMq.matches;
    notes.forEach((el, i) => {
      let o: number;
      if (narrow) {
        const s = 0.56 + i * 0.08;
        o = smooth(s, s + 0.04, p) * (i === notes.length - 1 ? 1 : 1 - smooth(s + 0.07, s + 0.1, p));
      } else {
        const s = 0.58 + i * 0.06;
        o = smooth(s, s + 0.05, p);
      }
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 12}px)`;
      el.toggleAttribute('data-on', o > 0.5);
    });
    api?.setProgress(p);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

  const load = async () => {
    if (loading || !near || !interacted) return;
    loading = true;
    try {
      const { createStage } = await import('../three/scene');
      if (disposed) return;
      api = createStage(canvas, { colors: finishColors(currentFinish()), narrow: () => narrowMq.matches });
      api.setVisible(inView);
      api.setProgress(progress());
      requestAnimationFrame(() => stage.classList.add('is-3d'));
    } catch {
      stage.classList.add('is-static'); // no WebGL: keep the SVG views
    }
  };

  const onFirst = () => { interacted = true; firstAc.abort(); load(); };
  for (const ev of ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const) {
    window.addEventListener(ev, onFirst, { passive: true, signal: firstAc.signal });
  }

  const nearIo = new IntersectionObserver(([e]) => { near = e.isIntersecting; load(); }, { rootMargin: '100% 0px 100% 0px' });
  nearIo.observe(stage);
  const viewIo = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    api?.setVisible(inView);
    if (inView && !scrollAc) {
      scrollAc = new AbortController();
      window.addEventListener('scroll', schedule, { passive: true, signal: scrollAc.signal });
      window.addEventListener('resize', schedule, { passive: true, signal: scrollAc.signal });
      schedule();
    } else if (!inView && scrollAc) {
      scrollAc.abort();
      scrollAc = null;
    }
  });
  viewIo.observe(stage);

  document.addEventListener(FINISH_EVENT, (e) => {
    api?.setFinish(finishColors((e as CustomEvent<FinishId>).detail));
  }, { signal: ac.signal });
  narrowMq.addEventListener('change', () => { lastP = -1; schedule(); }, { signal: ac.signal });

  return () => {
    disposed = true;
    ac.abort(); firstAc.abort(); scrollAc?.abort();
    nearIo.disconnect(); viewIo.disconnect();
    if (raf) cancelAnimationFrame(raf);
    api?.dispose();
    api = null;
  };
});
