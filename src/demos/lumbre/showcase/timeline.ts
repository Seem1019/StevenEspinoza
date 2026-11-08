import type { Timeline } from '../../../showcase/types';

/** Scripted build choreography for the Lumbre preview (≈20 s). Logs live in i18n lumbre.showcase.logs.*. */
const timeline: Timeline = {
  slug: 'lumbre',
  duration: 20000,
  steps: [
    // 0–6 s: skeletons, big blocks first, then nested
    { at: 0, agent: 'design', log: 'tokens' },
    { at: 500, agent: 'design', log: 'type' },
    { at: 1000, agent: 'frontend', log: 'nav', target: 'nav', state: 'skeleton' },
    { at: 1600, agent: 'frontend', log: 'stage', target: 'hero', state: 'skeleton' },
    { at: 2200, agent: 'frontend', log: 'track' },
    { at: 2700, agent: 'design', log: 'strips', target: 'strip-barra', state: 'skeleton' },
    { at: 3000, agent: 'design', log: 'strips', target: 'strip-cocina', state: 'skeleton' },
    { at: 3300, agent: 'design', log: 'strips', target: 'strip-mesa', state: 'skeleton' },
    { at: 3800, agent: 'frontend', log: 'menuGrid', target: 'menu-head', state: 'skeleton' },
    { at: 4200, agent: 'frontend', log: 'tabs', target: 'tabs', state: 'skeleton' },
    { at: 4600, agent: 'frontend', log: 'menuGrid', target: 'dishes', state: 'skeleton' },
    { at: 5000, agent: 'frontend', log: 'reserve', target: 'reserve', state: 'skeleton' },
    { at: 5400, agent: 'frontend', log: 'footer', target: 'footer', state: 'skeleton' },
    { at: 5700, agent: 'design', log: 'rail', target: 'rail', state: 'skeleton' },
    // 6–14 s: content
    { at: 6200, agent: 'copy', log: 'nav', target: 'nav', state: 'content' },
    { at: 6800, agent: 'design', log: 'layers', target: 'hero', state: 'content' },
    { at: 7400, agent: 'copy', log: 'copyHero', target: 'hero-copy', state: 'content' },
    { at: 8000, agent: 'frontend', log: 'rail', target: 'rail', state: 'content' },
    { at: 8600, agent: 'copy', log: 'copyScenes', target: 'strip-barra', state: 'content' },
    { at: 9100, agent: 'copy', log: 'copyScenes', target: 'strip-cocina', state: 'content' },
    { at: 9600, agent: 'copy', log: 'copyScenes', target: 'strip-mesa', state: 'content' },
    { at: 10300, agent: 'copy', log: 'copyMenu', target: 'menu-head', state: 'content' },
    { at: 10900, agent: 'frontend', log: 'tabs', target: 'tabs', state: 'content' },
    { at: 11500, agent: 'copy', log: 'copyMenu', target: 'dishes', state: 'content' },
    { at: 12300, agent: 'copy', log: 'copyCta', target: 'reserve', state: 'content' },
    { at: 13100, agent: 'copy', log: 'copyInfo', target: 'footer', state: 'content' },
    // 14–18 s: motion
    { at: 14100, agent: 'frontend', log: 'motionCam', target: 'hero', state: 'motion' },
    { at: 15000, agent: 'frontend', log: 'motionParallax', target: 'strip-barra', state: 'motion' },
    { at: 15900, agent: 'frontend', log: 'motionFire', target: 'strip-cocina', state: 'motion' },
    { at: 16800, agent: 'frontend', log: 'motionFire', target: 'strip-mesa', state: 'motion' },
    { at: 17500, agent: 'frontend', log: 'motionFallback' },
    // 18–20 s: QA
    { at: 18000, agent: 'qa', log: 'qaLcp' },
    { at: 18500, agent: 'qa', log: 'qaCls' },
    { at: 19000, agent: 'qa', log: 'qaContrast' },
    { at: 19500, agent: 'qa', log: 'qaKeyboard' },
    { at: 19900, agent: 'qa', log: 'qaMotion' },
  ],
};

export default timeline;
