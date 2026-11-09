import type { Scene } from '../../../showcase/types';

/**
 * Tesela Studio build (≈37 s) inside the simulated browser. Targets: data-build ids of BuildPreview.astro.
 * Messages: i18n `tesela` → showcase.say.* / showcase.flags.*
 * Errors: primary CTA painted in the link blue, third work card off the grid, a nav link in the other
 * language and a typo in the letter tiles.
 */
const CTA = '[data-build=hero-cta] .bp-btn--primary';
const CARD = '.bp-wcard:nth-child(3)';
const NAV = '[data-build=nav] .bp-link:nth-child(3)';
const TILE = '.bp-wcard:nth-child(1) .bp-tile:nth-child(3)';

const scene: Scene = {
  id: 'tesela',
  ns: 'tesela',
  prefix: 'showcase',
  duration: 37,
  errors: [
    { id: 'cta-blue', target: CTA, owner: 'design', flag: 'ctaBlue', paint: { 'background-color': '#3563ad' } },
    { id: 'card-off', target: CARD, owner: 'frontend', flag: 'cardOff', xf: { x: 70, y: 80, r: 2.5 } },
    { id: 'nav-lang', target: NAV, owner: 'copy', flag: 'navLang', swapKey: { ns: 'tesela', key: 'nav.process' } },
    { id: 'tile-typo', target: TILE, owner: 'copy', flag: 'tileTypo', swap: ['I', 'L'] },
  ],
  events: [
    { at: 0, do: 'phase', phase: 'kickoff' },
    { at: 0.1, do: 'spawn' },
    { at: 1.1, do: 'assign', to: 'design', say: 'aDesign' },
    { at: 1.4, do: 'assign', to: 'copy', say: 'aCopy' },
    { at: 1.7, do: 'assign', to: 'frontend', say: 'aFrontend' },
    { at: 2.0, do: 'assign', to: 'qa', status: 'idle', say: 'aQa' },

    { at: 2.4, do: 'phase', phase: 'build' },
    // Design: capsule nav, type and the landscape
    { at: 2.4, do: 'move', agent: 'design', target: 'nav', anchor: 'tl' },
    { at: 3.1, do: 'reveal', target: 'nav', state: 'skeleton' },
    { at: 3.1, do: 'select', agent: 'design', target: 'nav' },
    { at: 3.3, do: 'say', agent: 'design', say: 'dPalette' },
    { at: 4.0, do: 'deselect', agent: 'design' },
    { at: 4.0, do: 'reveal', target: 'hero-title', state: 'skeleton' },
    { at: 4.0, do: 'reveal', target: 'hero-lead', state: 'skeleton' },
    { at: 4.1, do: 'grid', agent: 'design', target: '.bp-hero', cols: 12 },
    { at: 4.8, do: 'err', error: 'nav-lang' },
    { at: 4.8, do: 'reveal', target: 'nav', state: 'content' },

    // Copy writes the headline; Design sets the type while Copy finishes
    { at: 3.2, do: 'move', agent: 'copy', target: 'hero-title', anchor: 'l' },
    { at: 5.0, do: 'reveal', target: 'hero-title', state: 'content' },
    { at: 5.0, do: 'type', agent: 'copy', target: 'hero-title', dur: 1.9 },
    { at: 6.1, do: 'move', agent: 'design', target: 'hero-title', anchor: 'tr' },
    { at: 6.6, do: 'say', agent: 'design', to: 'copy', say: 'dType' },
    { at: 7.2, do: 'say', agent: 'copy', to: 'design', say: 'cType' },
    { at: 7.2, do: 'reveal', target: 'hero-lead', state: 'content' },
    { at: 7.2, do: 'type', agent: 'copy', target: 'hero-lead', dur: 1.3 },
    { at: 8.0, do: 'move', agent: 'design', target: 'hero-cta', anchor: 'r' },
    { at: 8.6, do: 'err', error: 'cta-blue' },
    { at: 8.6, do: 'reveal', target: 'hero-cta', state: 'content' },
    { at: 8.6, do: 'select', agent: 'design', target: 'hero-cta' },
    { at: 9.2, do: 'deselect', agent: 'design' },
    { at: 9.2, do: 'grid', target: '.bp-hero', cols: 0 },

    // Frontend: landscape rises into place, then the work grid
    { at: 3.5, do: 'move', agent: 'frontend', target: 'land', anchor: 'center' },
    { at: 5.2, do: 'place', target: 'land', xf: { y: 120 } },
    { at: 5.2, do: 'reveal', target: 'land', state: 'content' },
    { at: 5.4, do: 'drag', agent: 'frontend', target: 'land', dur: 1.1 },
    { at: 6.8, do: 'say', agent: 'frontend', say: 'fLand' },

    { at: 9.4, do: 'move', agent: 'copy', target: 'services', anchor: 'tl' },
    { at: 9.9, do: 'reveal', target: 'services', state: 'skeleton' },
    { at: 10.8, do: 'reveal', target: 'services', state: 'content' },
    { at: 11.0, do: 'say', agent: 'copy', say: 'cServices' },

    { at: 8.0, do: 'move', agent: 'frontend', target: 'work', anchor: 't' },
    { at: 8.6, do: 'reveal', target: 'work', state: 'skeleton' },
    { at: 10.0, do: 'say', agent: 'copy', to: 'frontend', say: 'cHandoff' },
    { at: 10.6, do: 'err', error: 'tile-typo' },
    { at: 10.6, do: 'reveal', target: 'work', state: 'content' },
    { at: 10.7, do: 'say', agent: 'frontend', say: 'cSample' },
    { at: 11.4, do: 'place', target: CARD, xf: { x: 190, y: 40, r: 4 } },
    { at: 11.6, do: 'move', agent: 'frontend', target: CARD, anchor: 't', dur: 0.6 },
    { at: 12.3, do: 'drag', agent: 'frontend', target: CARD, error: 'card-off', dur: 0.9 },
    { at: 13.3, do: 'say', agent: 'frontend', say: 'fGrid' },

    // Design closes: process panel and footer
    { at: 10.0, do: 'move', agent: 'design', target: 'process', anchor: 'tl' },
    { at: 11.6, do: 'reveal', target: 'process', state: 'skeleton' },
    { at: 12.6, do: 'reveal', target: 'process', state: 'content' },
    { at: 12.7, do: 'reveal', target: 'inset', state: 'content' },
    { at: 12.8, do: 'say', agent: 'design', say: 'dPanel' },
    { at: 13.6, do: 'reveal', target: 'footer', state: 'content' },
    { at: 14.0, do: 'deliver', agent: 'design', say: 'dDone' },
    { at: 14.4, do: 'deliver', agent: 'copy', say: 'cDone' },
    { at: 15.0, do: 'reveal', target: 'land', state: 'motion' },
    { at: 15.1, do: 'reveal', target: 'work', state: 'motion' },
    { at: 15.2, do: 'reveal', target: 'inset', state: 'motion' },
    { at: 15.5, do: 'deliver', agent: 'frontend', say: 'fDone' },

    // Review
    { at: 16.0, do: 'phase', phase: 'review' },
    { at: 16.0, do: 'assign', to: 'qa', say: 'aReview' },
    { at: 16.2, do: 'move', agent: 'qa', target: 'nav', anchor: 'tr' },
    { at: 16.9, do: 'sweep', agent: 'qa', dur: 4.4 },
    { at: 21.5, do: 'say', agent: 'qa', to: 'orch', say: 'qaFound' },
    { at: 21.7, do: 'deliver', agent: 'qa' },

    { at: 22.0, do: 'assign', to: 'copy', status: 'fixing', say: 'rNav' },
    { at: 22.2, do: 'move', agent: 'copy', target: NAV, anchor: 'l' },
    { at: 23.0, do: 'select', agent: 'copy', target: NAV },
    { at: 23.2, do: 'type', agent: 'copy', target: NAV, error: 'nav-lang', dur: 0.7 },
    { at: 24.0, do: 'deselect', agent: 'copy' },
    { at: 24.1, do: 'say', agent: 'copy', say: 'cFixNav' },
    { at: 24.8, do: 'move', agent: 'copy', target: TILE, anchor: 'center' },
    { at: 25.7, do: 'select', agent: 'copy', target: TILE },
    { at: 25.9, do: 'type', agent: 'copy', target: TILE, error: 'tile-typo', dur: 0.4 },
    { at: 26.5, do: 'deselect', agent: 'copy' },
    { at: 26.6, do: 'say', agent: 'copy', say: 'cFixTile' },

    { at: 23.4, do: 'assign', to: 'design', status: 'fixing', say: 'rCta' },
    { at: 23.6, do: 'move', agent: 'design', target: '[data-build=nav] .bp-logo svg', anchor: 'center' },
    { at: 24.5, do: 'pick', agent: 'design', color: '#18181b' },
    { at: 24.6, do: 'say', agent: 'design', say: 'dPick' },
    { at: 25.3, do: 'move', agent: 'design', target: CTA, anchor: 'center' },
    { at: 26.2, do: 'fix', agent: 'design', error: 'cta-blue', dur: 0.6 },
    { at: 26.9, do: 'say', agent: 'design', say: 'dFixCta' },

    { at: 26.4, do: 'assign', to: 'frontend', status: 'fixing', say: 'rCard' },
    { at: 26.6, do: 'move', agent: 'frontend', target: CARD, anchor: 't' },
    { at: 27.6, do: 'select', agent: 'frontend', target: CARD },
    { at: 27.8, do: 'drag', agent: 'frontend', target: CARD, error: 'card-off', dur: 0.9 },
    { at: 28.8, do: 'deselect', agent: 'frontend' },
    { at: 28.9, do: 'say', agent: 'frontend', say: 'fFixCard' },

    { at: 27.1, do: 'deliver', agent: 'copy' },
    { at: 27.4, do: 'deliver', agent: 'design' },
    { at: 29.4, do: 'deliver', agent: 'frontend' },
    { at: 30.0, do: 'assign', to: 'qa', say: 'aRecheck' },
    { at: 30.2, do: 'move', agent: 'qa', target: 'nav', anchor: 'tr', dur: 0.7 },
    { at: 31.0, do: 'sweep', agent: 'qa', dur: 2.4 },

    { at: 33.6, do: 'phase', phase: 'close' },
    { at: 33.6, do: 'say', agent: 'qa', to: 'orch', say: 'qaOk' },
    { at: 33.8, do: 'approve' },
    { at: 33.9, do: 'deliver', agent: 'qa' },
    { at: 35.8, do: 'park' },
  ],
};

export default scene;
