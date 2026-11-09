import type { Scene } from '../../../showcase/types';

/**
 * Brinco build (≈37 s) inside the simulated browser. Targets: data-build ids of BuildPreview.astro.
 * Messages: i18n `brinco` → showcase.say.* / showcase.flags.*
 * Errors: unreadable CTA text, a price out of line in the grid, an untranslated cart button.
 */
const pile = (i: number) => ({ x: -243 * i + i * 9, y: i * 7, r: [0, 4, -2, 3, -4][i] });

const scene: Scene = {
  id: 'brinco',
  ns: 'brinco',
  prefix: 'showcase',
  duration: 37,
  errors: [
    { id: 'cta-contrast', target: '[data-build=title] .bpb-btn--l', owner: 'design', flag: 'ctaContrast', paint: { color: '#e4e4e7' } },
    { id: 'price-off', target: '[data-build=card2] .bpb-card__price', owner: 'frontend', flag: 'priceOff', xf: { x: 26, y: -16 } },
    { id: 'add-lang', target: '[data-build=card4] .bpb-card__add', owner: 'copy', flag: 'addLang', swapKey: { ns: 'brinco', key: 'card.add' } },
  ],
  events: [
    { at: 0, do: 'phase', phase: 'kickoff' },
    { at: 0.1, do: 'spawn' },
    { at: 1.1, do: 'assign', to: 'design', say: 'aDesign' },
    { at: 1.4, do: 'assign', to: 'copy', say: 'aCopy' },
    { at: 1.7, do: 'assign', to: 'frontend', say: 'aFrontend' },
    { at: 2.0, do: 'assign', to: 'qa', status: 'idle', say: 'aQa' },

    { at: 2.4, do: 'phase', phase: 'build' },
    // Design: bars + layout grid
    { at: 2.4, do: 'move', agent: 'design', target: 'header', anchor: 'tl' },
    { at: 3.1, do: 'reveal', target: 'ticker', state: 'skeleton' },
    { at: 3.2, do: 'reveal', target: 'header', state: 'skeleton' },
    { at: 3.2, do: 'select', agent: 'design', target: 'header' },
    { at: 3.4, do: 'say', agent: 'design', say: 'dPalette' },
    { at: 4.2, do: 'deselect', agent: 'design' },
    { at: 4.2, do: 'reveal', target: 'hero', state: 'content' },
    { at: 4.2, do: 'reveal', target: 'title', state: 'skeleton' },
    { at: 4.3, do: 'reveal', target: 'wheel', state: 'skeleton' },
    { at: 4.3, do: 'grid', agent: 'design', target: 'hero', cols: 12 },
    { at: 4.6, do: 'reveal', target: 'flash', state: 'skeleton' },
    { at: 4.8, do: 'reveal', target: 'grid', state: 'skeleton' },
    { at: 5.0, do: 'reveal', target: 'header', state: 'content' },
    { at: 5.0, do: 'reveal', target: 'ticker', state: 'content' },

    // Copy asks, Design answers, Copy types the headline
    { at: 3.0, do: 'move', agent: 'copy', target: 'title', anchor: 'l' },
    { at: 5.2, do: 'say', agent: 'copy', to: 'design', say: 'cAsk' },
    { at: 5.6, do: 'move', agent: 'design', target: 'title', anchor: 'tr' },
    { at: 6.3, do: 'say', agent: 'design', to: 'copy', say: 'dAnswer' },
    { at: 6.6, do: 'err', error: 'cta-contrast' },
    { at: 6.6, do: 'reveal', target: 'title', state: 'content' },
    { at: 6.6, do: 'type', agent: 'copy', target: '.bpb-h1', dur: 1.5 },
    { at: 8.3, do: 'type', agent: 'copy', target: '.bpb-sub', dur: 1.4 },

    // Frontend: the wheel grows into place
    { at: 3.4, do: 'move', agent: 'frontend', target: 'wheel', anchor: 'center' },
    { at: 4.4, do: 'say', agent: 'frontend', say: 'fWheel' },
    { at: 5.6, do: 'place', target: 'wheel', xf: { s: 0.55, r: -24 } },
    { at: 5.6, do: 'reveal', target: 'wheel', state: 'content' },
    { at: 6.0, do: 'select', agent: 'frontend', target: 'wheel' },
    { at: 6.2, do: 'resize', agent: 'frontend', target: 'wheel', dur: 1.0 },
    { at: 7.4, do: 'deselect', agent: 'frontend' },
    { at: 7.6, do: 'move', agent: 'frontend', target: 'flash', anchor: 'tl' },
    { at: 8.3, do: 'reveal', target: 'flash', state: 'content' },
    { at: 8.4, do: 'reveal', target: 'timer', state: 'content' },
    { at: 8.6, do: 'say', agent: 'frontend', say: 'fFlash' },

    // Grid: cards arrive in a pile and get dragged into columns
    { at: 9.4, do: 'move', agent: 'frontend', target: 'grid', anchor: 'tl' },
    { at: 9.6, do: 'say', agent: 'copy', to: 'frontend', say: 'cHandoff' },
    { at: 10.0, do: 'reveal', target: 'grid', state: 'content' },
    { at: 10.0, do: 'place', target: 'card1', xf: pile(0) },
    { at: 10.0, do: 'place', target: 'card2', xf: pile(1) },
    { at: 10.0, do: 'place', target: 'card3', xf: pile(2) },
    { at: 10.0, do: 'place', target: 'card4', xf: pile(3) },
    { at: 10.0, do: 'place', target: 'card5', xf: pile(4) },
    { at: 10.0, do: 'err', error: 'price-off' },
    { at: 10.0, do: 'err', error: 'add-lang' },
    { at: 10.1, do: 'reveal', target: 'card1' },
    { at: 10.2, do: 'reveal', target: 'card2' },
    { at: 10.3, do: 'reveal', target: 'card3' },
    { at: 10.4, do: 'reveal', target: 'card4' },
    { at: 10.5, do: 'reveal', target: 'card5' },
    { at: 10.6, do: 'move', agent: 'frontend', target: 'card5', anchor: 't', dur: 0.5 },
    { at: 11.2, do: 'drag', agent: 'frontend', target: 'card5', dur: 0.8 },
    { at: 12.1, do: 'move', agent: 'frontend', target: 'card4', anchor: 't', dur: 0.45 },
    { at: 12.6, do: 'drag', agent: 'frontend', target: 'card4', dur: 0.7 },
    { at: 13.4, do: 'move', agent: 'frontend', target: 'card3', anchor: 't', dur: 0.4 },
    { at: 13.8, do: 'drag', agent: 'frontend', target: 'card3', dur: 0.6 },
    { at: 14.5, do: 'move', agent: 'frontend', target: 'card2', anchor: 't', dur: 0.4 },
    { at: 14.9, do: 'drag', agent: 'frontend', target: 'card2', dur: 0.5 },
    { at: 15.5, do: 'say', agent: 'frontend', say: 'fGrid' },

    // Design: footer + motion
    { at: 10.2, do: 'grid', target: 'hero', cols: 0 },
    { at: 11.0, do: 'move', agent: 'design', target: 'footer', anchor: 'l' },
    { at: 11.6, do: 'reveal', target: 'footer', state: 'skeleton' },
    { at: 12.8, do: 'reveal', target: 'footer', state: 'content' },
    { at: 13.0, do: 'deliver', agent: 'design', say: 'dDone' },
    { at: 14.0, do: 'deliver', agent: 'copy', say: 'cDone' },
    { at: 16.0, do: 'reveal', target: 'ticker', state: 'motion' },
    { at: 16.0, do: 'reveal', target: 'wheel', state: 'motion' },
    { at: 16.1, do: 'reveal', target: 'flash', state: 'motion' },
    { at: 16.1, do: 'reveal', target: 'timer', state: 'motion' },
    { at: 16.3, do: 'deliver', agent: 'frontend', say: 'fDone' },

    // Review
    { at: 16.8, do: 'phase', phase: 'review' },
    { at: 16.8, do: 'assign', to: 'qa', say: 'aReview' },
    { at: 17.0, do: 'move', agent: 'qa', target: 'ticker', anchor: 'tr' },
    { at: 17.7, do: 'sweep', agent: 'qa', dur: 4.2 },
    { at: 22.1, do: 'say', agent: 'qa', to: 'orch', say: 'qaFound' },
    { at: 22.3, do: 'deliver', agent: 'qa' },

    { at: 22.6, do: 'assign', to: 'frontend', status: 'fixing', say: 'rPrice' },
    { at: 22.8, do: 'move', agent: 'frontend', target: '[data-build=card2] .bpb-card__price', anchor: 'l' },
    { at: 23.6, do: 'select', agent: 'frontend', target: '[data-build=card2] .bpb-card__price' },
    { at: 23.8, do: 'drag', agent: 'frontend', target: '[data-build=card2] .bpb-card__price', error: 'price-off', dur: 0.75 },
    { at: 24.7, do: 'deselect', agent: 'frontend' },
    { at: 24.8, do: 'say', agent: 'frontend', say: 'fFixPrice' },

    { at: 24.4, do: 'assign', to: 'copy', status: 'fixing', say: 'rLang' },
    { at: 24.6, do: 'move', agent: 'copy', target: '[data-build=card4] .bpb-card__add', anchor: 'l' },
    { at: 25.5, do: 'select', agent: 'copy', target: '[data-build=card4] .bpb-card__add' },
    { at: 25.7, do: 'type', agent: 'copy', target: '[data-build=card4] .bpb-card__add', error: 'add-lang', dur: 0.8 },
    { at: 26.6, do: 'deselect', agent: 'copy' },
    { at: 26.7, do: 'say', agent: 'copy', say: 'cFixLang' },

    { at: 26.8, do: 'assign', to: 'design', status: 'fixing', say: 'rCta' },
    { at: 27.0, do: 'move', agent: 'design', target: '.bpb-logo b', anchor: 'center' },
    { at: 27.9, do: 'pick', agent: 'design', color: '#111111' },
    { at: 28.0, do: 'say', agent: 'design', say: 'dPick' },
    { at: 28.7, do: 'move', agent: 'design', target: '[data-build=title] .bpb-btn--l', anchor: 'center' },
    { at: 29.6, do: 'fix', agent: 'design', error: 'cta-contrast', dur: 0.6 },
    { at: 30.3, do: 'say', agent: 'design', say: 'dFixCta' },

    { at: 25.2, do: 'deliver', agent: 'frontend' },
    { at: 27.2, do: 'deliver', agent: 'copy' },
    { at: 30.7, do: 'deliver', agent: 'design' },
    { at: 31.0, do: 'assign', to: 'qa', say: 'aRecheck' },
    { at: 31.2, do: 'move', agent: 'qa', target: 'ticker', anchor: 'tr', dur: 0.7 },
    { at: 32.0, do: 'sweep', agent: 'qa', dur: 2.2 },

    { at: 34.4, do: 'phase', phase: 'close' },
    { at: 34.4, do: 'say', agent: 'qa', to: 'orch', say: 'qaOk' },
    { at: 34.6, do: 'approve' },
    { at: 34.7, do: 'deliver', agent: 'qa' },
    { at: 36.4, do: 'park' },
  ],
};

export default scene;
