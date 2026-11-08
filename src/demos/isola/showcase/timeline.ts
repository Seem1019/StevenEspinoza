import type { Timeline } from '../../../showcase/types';

/** Scripted build of the Isola H1 miniature (BuildPreview.astro). Logs: isola.showcase.logs.* */
const timeline: Timeline = {
  slug: 'isola',
  duration: 20000,
  steps: [
    // 0–6 s: design + frontend -> skeletons (big blocks first, then nested)
    { at: 0, agent: 'design', log: 'tokens' },
    { at: 400, agent: 'design', log: 'grid', target: 'nav', state: 'skeleton' },
    { at: 900, agent: 'frontend', log: 'hero', target: 'hero', state: 'skeleton' },
    { at: 1500, agent: 'frontend', log: 'explode', target: 'explode', state: 'skeleton' },
    { at: 2100, agent: 'frontend', log: 'features', target: 'features', state: 'skeleton' },
    { at: 2700, agent: 'frontend', log: 'specs', target: 'specs', state: 'skeleton' },
    { at: 3200, agent: 'frontend', log: 'cta', target: 'cta', state: 'skeleton' },
    { at: 3600, agent: 'frontend', log: 'footer', target: 'footer', state: 'skeleton' },
    { at: 4200, agent: 'design', log: 'type', target: 'hero-title', state: 'skeleton' },
    { at: 4450, agent: 'design', log: 'type', target: 'hero-copy', state: 'skeleton' },
    { at: 4700, agent: 'frontend', log: 'product', target: 'hero-product', state: 'skeleton' },
    { at: 5200, agent: 'design', log: 'callouts', target: 'callouts', state: 'skeleton' },
    { at: 5700, agent: 'frontend', log: 'hero', target: 'hero-cta', state: 'skeleton' },

    // 6–14 s: copy + frontend -> content
    { at: 6200, agent: 'frontend', log: 'nav', target: 'nav', state: 'content' },
    { at: 6800, agent: 'copy', log: 'heroCopy', target: 'hero-title', state: 'content' },
    { at: 7400, agent: 'copy', log: 'heroCopy', target: 'hero-copy', state: 'content' },
    { at: 8000, agent: 'copy', log: 'priceCopy', target: 'hero-cta', state: 'content' },
    { at: 8600, agent: 'frontend', log: 'productPaint', target: 'hero-product', state: 'content' },
    { at: 6500, agent: 'frontend', log: 'hero', target: 'hero', state: 'content' },
    { at: 9800, agent: 'frontend', log: 'explode', target: 'explode', state: 'content' },
    { at: 10400, agent: 'copy', log: 'calloutsCopy', target: 'callouts', state: 'content' },
    { at: 11100, agent: 'copy', log: 'featuresCopy', target: 'features', state: 'content' },
    { at: 11900, agent: 'copy', log: 'specsCopy', target: 'specs', state: 'content' },
    { at: 12700, agent: 'copy', log: 'ctaCopy', target: 'cta', state: 'content' },
    { at: 13400, agent: 'frontend', log: 'footer', target: 'footer', state: 'content' },

    // 14–18 s: frontend -> motion
    { at: 14200, agent: 'frontend', log: 'motionStage', target: 'hero-product', state: 'motion' },
    { at: 15000, agent: 'frontend', log: 'motionExplode', target: 'explode', state: 'motion' },
    { at: 15800, agent: 'frontend', log: 'motionCallouts', target: 'callouts', state: 'motion' },
    { at: 16700, agent: 'frontend', log: 'motionReveal', target: 'features', state: 'motion' },

    // 18–20 s: QA
    { at: 17900, agent: 'qa', log: 'qaContrast' },
    { at: 18400, agent: 'qa', log: 'qaCls' },
    { at: 18900, agent: 'qa', log: 'qaLcp' },
    { at: 19400, agent: 'qa', log: 'qaKeyboard' },
    { at: 19900, agent: 'qa', log: 'qaThree' },
  ],
};

export default timeline;
