import type { Scene } from '../types';

/**
 * Home intro (≈39 s). The agents build the REAL home in place: every target is already in the
 * initial HTML (src/pages/[lang]/index.astro); this script only decides how it is revealed.
 * Messages: i18n `home` → intro.say.* / intro.flags.*
 *
 * Errors (left visible until the review): oversized headline, card out of the staircase,
 * low-contrast CTA, nav link in the other language, wrong figure in the stats strip.
 */
const pile = (i: number) => ({ x: 34 - i * 10, y: -82 * i + i * 7, r: [-4, 3, -2, 5, -3][i] });

const scene: Scene = {
  id: 'home',
  ns: 'home',
  prefix: 'intro',
  duration: 39,
  errors: [
    { id: 'nav-lang', target: '.site-header__nav a:nth-child(2)', owner: 'copy', flag: 'navLang', swapKey: { ns: 'common', key: 'nav.showcase' } },
    { id: 'title-size', target: 'h-title', owner: 'design', flag: 'titleSize', xf: { s: 1.2 }, origin: '0 0' },
    { id: 'cta-contrast', target: '[data-build=h-ctas] .btn--primary', owner: 'design', flag: 'ctaContrast', paint: { 'background-color': '#3a2c25', color: '#6e5a50' } },
    { id: 'card-off', target: 'h-card3', owner: 'frontend', flag: 'cardOff', xf: { x: -46, y: 4, r: -1.5 } },
    { id: 'metric-typo', target: '.hero__metrics div:nth-child(1) dd', owner: 'frontend', flag: 'metricTypo', swap: ['90', '900'] },
  ],
  events: [
    // --- kickoff: the start button became the orchestrator; cursors come out of it ---------------
    { at: 0, do: 'phase', phase: 'kickoff' },
    { at: 0.15, do: 'spawn', target: '[data-intro-origin]' },
    { at: 1.3, do: 'assign', to: 'design', say: 'aDesign' },
    { at: 1.6, do: 'assign', to: 'copy', say: 'aCopy' },
    { at: 1.9, do: 'assign', to: 'frontend', say: 'aFrontend' },
    { at: 2.2, do: 'assign', to: 'qa', status: 'idle', say: 'aQa' },
    { at: 2.5, do: 'say', agent: 'qa', say: 'qaWait' },

    // --- build: Design lays out header + grid --------------------------------------------------
    { at: 2.8, do: 'phase', phase: 'build' },
    { at: 2.8, do: 'move', agent: 'design', target: 'h-header', anchor: 'tl' },
    { at: 3.6, do: 'reveal', target: 'h-header', state: 'skeleton' },
    { at: 3.6, do: 'select', agent: 'design', target: 'h-header' },
    { at: 3.8, do: 'say', agent: 'design', say: 'dHeader' },
    { at: 4.6, do: 'deselect', agent: 'design' },
    { at: 4.6, do: 'grid', agent: 'design', target: '.hero__grid', cols: 12 },
    { at: 4.7, do: 'move', agent: 'design', target: 'h-title', anchor: 'tl' },
    { at: 5.3, do: 'reveal', target: 'h-title', state: 'skeleton' },
    { at: 5.5, do: 'reveal', target: 'h-lead', state: 'skeleton' },
    { at: 5.7, do: 'reveal', target: 'h-ctas', state: 'skeleton' },
    { at: 5.9, do: 'reveal', target: 'h-metrics', state: 'skeleton' },
    { at: 5.5, do: 'err', error: 'nav-lang' },
    { at: 5.5, do: 'reveal', target: 'h-header', state: 'content' },

    // Copy asks Design about the headline; Design walks over and answers (→ oversized headline)
    { at: 4.2, do: 'move', agent: 'copy', target: 'h-title', anchor: 'l' },
    { at: 5.9, do: 'say', agent: 'copy', to: 'design', say: 'cAsk' },
    { at: 6.4, do: 'move', agent: 'design', target: 'h-title', anchor: 'tr' },
    { at: 7.2, do: 'select', agent: 'design', target: 'h-title' },
    { at: 7.3, do: 'say', agent: 'design', to: 'copy', say: 'dAnswer' },
    { at: 7.9, do: 'deselect', agent: 'design' },
    { at: 7.9, do: 'err', error: 'title-size' },
    { at: 7.9, do: 'reveal', target: 'h-title', state: 'content' },
    { at: 7.9, do: 'type', agent: 'copy', target: 'h-title', dur: 2.1 },

    // Frontend piles the five demo cards and drags them into the staircase (card 3 lands off)
    { at: 3.2, do: 'place', target: 'h-card1', xf: pile(0) },
    { at: 3.2, do: 'place', target: 'h-card2', xf: pile(1) },
    { at: 3.2, do: 'place', target: 'h-card3', xf: pile(2) },
    { at: 3.2, do: 'place', target: 'h-card4', xf: pile(3) },
    { at: 3.2, do: 'place', target: 'h-card5', xf: pile(4) },
    { at: 3.3, do: 'move', agent: 'frontend', target: 'h-card1', anchor: 'r' },
    { at: 4.0, do: 'reveal', target: 'h-card1' },
    { at: 4.1, do: 'reveal', target: 'h-card2' },
    { at: 4.2, do: 'reveal', target: 'h-card3' },
    { at: 4.3, do: 'reveal', target: 'h-card4' },
    { at: 4.4, do: 'reveal', target: 'h-card5' },
    { at: 4.6, do: 'say', agent: 'frontend', say: 'fCards' },
    { at: 5.0, do: 'move', agent: 'frontend', target: 'h-card5', anchor: 'r', dur: 0.4 },
    { at: 5.45, do: 'drag', agent: 'frontend', target: 'h-card5', dur: 0.5 },
    { at: 6.0, do: 'move', agent: 'frontend', target: 'h-card4', anchor: 'r', dur: 0.5 },
    { at: 6.6, do: 'drag', agent: 'frontend', target: 'h-card4', dur: 0.75 },
    { at: 7.5, do: 'move', agent: 'frontend', target: 'h-card3', anchor: 'r', dur: 0.5 },
    { at: 8.1, do: 'drag', agent: 'frontend', target: 'h-card3', error: 'card-off', dur: 0.75 },
    { at: 9.0, do: 'move', agent: 'frontend', target: 'h-card2', anchor: 'r', dur: 0.5 },
    { at: 9.6, do: 'drag', agent: 'frontend', target: 'h-card2', dur: 0.7 },
    { at: 10.4, do: 'move', agent: 'frontend', target: 'h-card1', anchor: 'r', dur: 0.45 },
    { at: 10.9, do: 'drag', agent: 'frontend', target: 'h-card1', dur: 0.6 },
    { at: 11.6, do: 'say', agent: 'frontend', say: 'fStairs' },

    // Copy writes the paragraph; Frontend waits for it before mounting the buttons
    { at: 10.3, do: 'move', agent: 'copy', target: 'h-lead', anchor: 'tl' },
    { at: 10.9, do: 'reveal', target: 'h-lead', state: 'content' },
    { at: 10.9, do: 'type', agent: 'copy', target: 'h-lead', dur: 2.6 },
    { at: 12.2, do: 'move', agent: 'frontend', target: 'h-ctas', anchor: 'r' },
    { at: 12.9, do: 'say', agent: 'frontend', to: 'copy', say: 'fWait' },
    { at: 13.8, do: 'say', agent: 'copy', to: 'frontend', say: 'cHandoff' },
    { at: 14.3, do: 'err', error: 'cta-contrast' },
    { at: 14.3, do: 'reveal', target: 'h-ctas', state: 'content' },
    { at: 14.3, do: 'select', agent: 'frontend', target: 'h-ctas' },
    { at: 14.9, do: 'deselect', agent: 'frontend' },
    { at: 14.6, do: 'deliver', agent: 'copy', say: 'cDone' },
    { at: 14.8, do: 'move', agent: 'copy', target: 'h-header', anchor: 'tr' },

    // Stats strip counts up (and one figure ends wrong)
    { at: 15.0, do: 'move', agent: 'frontend', target: 'h-metrics', anchor: 'l' },
    { at: 15.6, do: 'reveal', target: 'h-metrics', state: 'content' },
    { at: 15.6, do: 'count', agent: 'frontend', target: '.hero__metrics div:nth-child(1) dd', dur: 1.1 },
    { at: 15.8, do: 'count', agent: 'frontend', target: '.hero__metrics div:nth-child(2) dd', dur: 1.0 },
    { at: 16.9, do: 'err', error: 'metric-typo' },
    { at: 17.1, do: 'deliver', agent: 'frontend', say: 'fDone' },
    { at: 13.5, do: 'move', agent: 'design', target: '.site-header__mark', anchor: 'center' },
    { at: 14.2, do: 'say', agent: 'design', say: 'dTokens' },
    { at: 16.2, do: 'grid', target: '.hero__grid', cols: 0 },
    { at: 16.4, do: 'deliver', agent: 'design', say: 'dDone' },

    // --- review: QA sweeps, flags, the orchestrator reassigns, each agent fixes --------------------
    { at: 17.6, do: 'phase', phase: 'review' },
    { at: 17.6, do: 'assign', to: 'qa', say: 'aReview' },
    { at: 17.8, do: 'move', agent: 'qa', target: 'h-header', anchor: 'tr' },
    { at: 18.5, do: 'sweep', agent: 'qa', target: '.site-header, .hero', dur: 3.2 },
    { at: 22.0, do: 'say', agent: 'qa', to: 'orch', say: 'qaFound' },
    { at: 22.2, do: 'deliver', agent: 'qa' },

    // 1. headline → Design resizes it
    { at: 22.6, do: 'assign', to: 'design', status: 'fixing', say: 'rTitle' },
    { at: 22.8, do: 'move', agent: 'design', target: 'h-title', anchor: 'br' },
    { at: 23.6, do: 'select', agent: 'design', target: 'h-title' },
    { at: 23.8, do: 'resize', agent: 'design', target: 'h-title', error: 'title-size', dur: 0.95 },
    { at: 24.9, do: 'deselect', agent: 'design' },
    { at: 24.9, do: 'say', agent: 'design', say: 'dFixTitle' },

    // 2. card → Frontend drags it back into the staircase
    { at: 24.6, do: 'assign', to: 'frontend', status: 'fixing', say: 'rCard' },
    { at: 24.8, do: 'move', agent: 'frontend', target: 'h-card3', anchor: 'r' },
    { at: 25.6, do: 'select', agent: 'frontend', target: 'h-card3' },
    { at: 25.8, do: 'drag', agent: 'frontend', target: 'h-card3', error: 'card-off', dur: 0.8 },
    { at: 26.7, do: 'deselect', agent: 'frontend' },
    { at: 26.8, do: 'say', agent: 'frontend', say: 'fFixCard' },

    // 3. CTA contrast → Design picks the brand orange from the logo and applies it
    { at: 26.4, do: 'assign', to: 'design', status: 'fixing', say: 'rCta' },
    { at: 26.6, do: 'move', agent: 'design', target: '.site-header__mark', anchor: 'center' },
    { at: 27.4, do: 'pick', agent: 'design', color: '#ff5a1f' },
    { at: 27.5, do: 'say', agent: 'design', say: 'dPick' },
    { at: 28.2, do: 'move', agent: 'design', target: '[data-build=h-ctas] .btn--primary', anchor: 'center' },
    { at: 29.1, do: 'fix', agent: 'design', error: 'cta-contrast', dur: 0.6 },
    { at: 29.8, do: 'say', agent: 'design', say: 'dFixCta' },

    // 4. nav link → Copy retypes it in the right language
    { at: 28.6, do: 'assign', to: 'copy', status: 'fixing', say: 'rNav' },
    { at: 28.8, do: 'move', agent: 'copy', target: '.site-header__nav a:nth-child(2)', anchor: 'l' },
    { at: 29.6, do: 'select', agent: 'copy', target: '.site-header__nav a:nth-child(2)' },
    { at: 29.8, do: 'type', agent: 'copy', target: '.site-header__nav a:nth-child(2)', error: 'nav-lang', dur: 0.9 },
    { at: 30.9, do: 'deselect', agent: 'copy' },
    { at: 31.0, do: 'say', agent: 'copy', say: 'cFixNav' },

    // 5. figure → Frontend re-rolls it to the real value
    { at: 31.0, do: 'assign', to: 'frontend', status: 'fixing', say: 'rMetric' },
    { at: 31.2, do: 'move', agent: 'frontend', target: '.hero__metrics div:nth-child(1) dd', anchor: 'r' },
    { at: 32.0, do: 'select', agent: 'frontend', target: '.hero__metrics div:nth-child(1)' },
    { at: 32.2, do: 'count', agent: 'frontend', target: '.hero__metrics div:nth-child(1) dd', error: 'metric-typo', dur: 0.8 },
    { at: 33.1, do: 'deselect', agent: 'frontend' },
    { at: 33.2, do: 'say', agent: 'frontend', say: 'fFixMetric' },

    // deliveries + QA re-check
    { at: 25.4, do: 'deliver', agent: 'design' },
    { at: 30.2, do: 'deliver', agent: 'design', say: 'dDelivered' },
    { at: 31.6, do: 'deliver', agent: 'copy' },
    { at: 33.6, do: 'deliver', agent: 'frontend', say: 'fDelivered' },
    { at: 33.8, do: 'assign', to: 'qa', say: 'aRecheck' },
    { at: 34.0, do: 'move', agent: 'qa', target: 'h-header', anchor: 'tr', dur: 0.6 },
    { at: 34.6, do: 'sweep', agent: 'qa', target: '.site-header, .hero', dur: 1.6 },

    // --- close ----------------------------------------------------------------------------------
    { at: 36.3, do: 'phase', phase: 'close' },
    { at: 36.3, do: 'say', agent: 'qa', to: 'orch', say: 'qaOk' },
    { at: 36.5, do: 'approve' },
    { at: 36.6, do: 'deliver', agent: 'qa' },
    { at: 38.2, do: 'park' },
  ],
};

export default scene;
