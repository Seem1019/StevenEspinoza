import type { Timeline } from '../../../showcase/types';

/** Scripted build of the Turnio landing (simulation, not real-time generation). */
const timeline: Timeline = {
  slug: 'turnio',
  duration: 20000,
  steps: [
    // 0–6 s · design + frontend: skeletons, big blocks first
    { at: 0, agent: 'design', log: 'tokens' },
    { at: 400, agent: 'frontend', log: 'grid' },
    { at: 800, agent: 'frontend', log: 'header', target: 'header', state: 'skeleton' },
    { at: 1300, agent: 'design', log: 'hero', target: 'hero-copy', state: 'skeleton' },
    { at: 1800, agent: 'frontend', log: 'mock', target: 'mock', state: 'skeleton' },
    { at: 2400, agent: 'design', log: 'logos', target: 'logos', state: 'skeleton' },
    { at: 2900, agent: 'frontend', log: 'benefits', target: 'benefits', state: 'skeleton' },
    { at: 3400, agent: 'design', log: 'steps' },
    { at: 3900, agent: 'frontend', log: 'pricing', target: 'pricing', state: 'skeleton' },
    { at: 4400, agent: 'frontend', log: 'faq', target: 'faq', state: 'skeleton' },
    { at: 4800, agent: 'design', log: 'footer', target: 'final', state: 'skeleton' },
    { at: 5100, agent: 'frontend', log: 'footer', target: 'footer', state: 'skeleton' },
    { at: 5400, agent: 'frontend', log: 'floating', target: 'toast', state: 'skeleton' },
    { at: 5700, agent: 'frontend', log: 'floating', target: 'widget', state: 'skeleton' },
    { at: 5900, agent: 'design', log: 'hero', target: 'hero-cta', state: 'skeleton' },

    // 6–14 s · copy + frontend: real content
    { at: 6200, agent: 'frontend', log: 'header', target: 'header', state: 'content' },
    { at: 6800, agent: 'copy', log: 'copyHero', target: 'hero-copy', state: 'content' },
    { at: 7500, agent: 'copy', log: 'copySub', target: 'hero-cta', state: 'content' },
    { at: 8200, agent: 'copy', log: 'copyMock', target: 'mock', state: 'content' },
    { at: 8800, agent: 'frontend', log: 'floating', target: 'toast', state: 'content' },
    { at: 9200, agent: 'frontend', log: 'floating', target: 'widget', state: 'content' },
    { at: 9800, agent: 'copy', log: 'copyProof', target: 'logos', state: 'content' },
    { at: 10500, agent: 'copy', log: 'copyBenefits', target: 'benefits', state: 'content' },
    { at: 11800, agent: 'copy', log: 'copyPricing', target: 'pricing', state: 'content' },
    { at: 12500, agent: 'copy', log: 'copyFaq', target: 'faq', state: 'content' },
    { at: 13100, agent: 'copy', log: 'copyFinal', target: 'final', state: 'content' },
    { at: 13600, agent: 'frontend', log: 'footer', target: 'footer', state: 'content' },

    // 14–18 s · frontend: motion
    { at: 14200, agent: 'frontend', log: 'motionToast', target: 'toast', state: 'motion' },
    { at: 14900, agent: 'frontend', log: 'motionToast', target: 'widget', state: 'motion' },
    { at: 15600, agent: 'frontend', log: 'motionSlot', target: 'mock', state: 'motion' },
    { at: 16300, agent: 'frontend', log: 'motionReveal', target: 'pricing', state: 'motion' },
    { at: 17200, agent: 'frontend', log: 'motionReduced' },

    // 18–20 s · qa
    { at: 18000, agent: 'qa', log: 'qaContrast' },
    { at: 18400, agent: 'qa', log: 'qaCls' },
    { at: 18800, agent: 'qa', log: 'qaLcp' },
    { at: 19200, agent: 'qa', log: 'qaKeyboard' },
    { at: 19500, agent: 'qa', log: 'qaUrl' },
    { at: 19900, agent: 'qa', log: 'done' },
  ],
};

export default timeline;
