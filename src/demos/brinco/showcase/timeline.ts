import type { Timeline } from '../../../showcase/types';

/** Scripted build choreography for the Brinco preview (≈20 s). Logs live in i18n brinco.showcase.logs.*. */
const timeline: Timeline = {
  slug: 'brinco',
  duration: 20000,
  steps: [
    // 0–6 s: skeletons, big blocks first
    { at: 0, agent: 'design', log: 'tokens' },
    { at: 500, agent: 'design', log: 'type' },
    { at: 1000, agent: 'design', log: 'layout', target: 'header', state: 'skeleton' },
    { at: 1500, agent: 'frontend', log: 'skTicker', target: 'ticker', state: 'skeleton' },
    { at: 2100, agent: 'frontend', log: 'skHero', target: 'hero', state: 'skeleton' },
    { at: 2600, agent: 'design', log: 'skWheel', target: 'wheel', state: 'skeleton' },
    { at: 3200, agent: 'frontend', log: 'skFlash', target: 'flash', state: 'skeleton' },
    { at: 3800, agent: 'frontend', log: 'skGrid', target: 'grid', state: 'skeleton' },
    { at: 4400, agent: 'frontend', log: 'skCards', target: 'card1', state: 'skeleton' },
    { at: 4700, agent: 'frontend', log: 'skCards', target: 'card3', state: 'skeleton' },
    { at: 5000, agent: 'design', log: 'skHeader', target: 'title', state: 'skeleton' },
    { at: 5500, agent: 'frontend', log: 'skFooter', target: 'footer', state: 'skeleton' },
    // 6–14 s: content
    { at: 6200, agent: 'copy', log: 'cTicker', target: 'ticker', state: 'content' },
    { at: 6800, agent: 'copy', log: 'cHeader', target: 'header', state: 'content' },
    { at: 7500, agent: 'copy', log: 'cHero', target: 'hero', state: 'content' },
    { at: 7900, agent: 'copy', log: 'cHero', target: 'title', state: 'content' },
    { at: 8600, agent: 'frontend', log: 'cWheel', target: 'wheel', state: 'content' },
    { at: 9300, agent: 'frontend', log: 'cFlash', target: 'flash', state: 'content' },
    { at: 9900, agent: 'frontend', log: 'cGrid', target: 'grid', state: 'content' },
    { at: 10500, agent: 'copy', log: 'cCards', target: 'card1', state: 'content' },
    { at: 10900, agent: 'copy', log: 'cCards', target: 'card2', state: 'content' },
    { at: 11300, agent: 'copy', log: 'cCards', target: 'card3', state: 'content' },
    { at: 11700, agent: 'copy', log: 'cCards', target: 'card4', state: 'content' },
    { at: 12100, agent: 'copy', log: 'cCards', target: 'card5', state: 'content' },
    { at: 12800, agent: 'frontend', log: 'batches' },
    { at: 13400, agent: 'copy', log: 'cFooter', target: 'footer', state: 'content' },
    // 14–18 s: motion
    { at: 14200, agent: 'frontend', log: 'mTicker', target: 'ticker', state: 'motion' },
    { at: 15000, agent: 'frontend', log: 'mWheel', target: 'wheel', state: 'motion' },
    { at: 15800, agent: 'frontend', log: 'mFlash', target: 'flash', state: 'motion' },
    { at: 16300, agent: 'frontend', log: 'cFlash', target: 'timer', state: 'motion' },
    { at: 17000, agent: 'frontend', log: 'mCards', target: 'card2', state: 'motion' },
    // 18–20 s: QA
    { at: 18000, agent: 'qa', log: 'qaContrast' },
    { at: 18500, agent: 'qa', log: 'qaCls' },
    { at: 19000, agent: 'qa', log: 'qaLcp' },
    { at: 19600, agent: 'qa', log: 'qaKeys' },
  ],
};

export default timeline;
