import type { Scene } from '../../../showcase/types';

/**
 * Isola build (≈37 s) inside the simulated browser. Targets: data-build ids of BuildPreview.astro.
 * Messages: i18n `isola` → showcase.say.* / showcase.flags.*
 * Errors: product image with the wrong proportion, callouts overlapping the exploded view,
 * "buy" button in the other language.
 */
const scene: Scene = {
  id: 'isola',
  ns: 'isola',
  prefix: 'showcase',
  duration: 37,
  errors: [
    { id: 'product-ratio', target: 'hero-product', owner: 'frontend', flag: 'productRatio', xf: { sx: 1.36, sy: 0.7 }, origin: '50% 50%' },
    { id: 'buy-lang', target: '[data-build=nav] .bp-btn', owner: 'copy', flag: 'buyLang', swapKey: { ns: 'isola', key: 'nav.buy' } },
    { id: 'notes-overlap', target: 'callouts', owner: 'design', flag: 'notesOverlap', xf: { y: -110 } },
  ],
  events: [
    { at: 0, do: 'phase', phase: 'kickoff' },
    { at: 0.1, do: 'spawn' },
    { at: 1.1, do: 'assign', to: 'design', say: 'aDesign' },
    { at: 1.4, do: 'assign', to: 'copy', say: 'aCopy' },
    { at: 1.7, do: 'assign', to: 'frontend', say: 'aFrontend' },
    { at: 2.0, do: 'assign', to: 'qa', status: 'idle', say: 'aQa' },

    { at: 2.4, do: 'phase', phase: 'build' },
    { at: 2.4, do: 'move', agent: 'design', target: 'nav', anchor: 'tl' },
    { at: 3.1, do: 'reveal', target: 'nav', state: 'skeleton' },
    { at: 3.1, do: 'select', agent: 'design', target: 'nav' },
    { at: 3.3, do: 'say', agent: 'design', say: 'dPalette' },
    { at: 4.0, do: 'deselect', agent: 'design' },
    { at: 4.0, do: 'reveal', target: 'hero', state: 'content' },
    { at: 4.0, do: 'grid', agent: 'design', target: 'hero', cols: 12 },
    { at: 4.2, do: 'reveal', target: 'hero-title', state: 'skeleton' },
    { at: 4.3, do: 'reveal', target: 'hero-copy', state: 'skeleton' },
    { at: 4.4, do: 'reveal', target: 'hero-cta', state: 'skeleton' },
    { at: 4.5, do: 'reveal', target: 'hero-product', state: 'skeleton' },
    { at: 4.9, do: 'err', error: 'buy-lang' },
    { at: 4.9, do: 'reveal', target: 'nav', state: 'content' },

    // Copy: headline + promise
    { at: 3.2, do: 'move', agent: 'copy', target: 'hero-title', anchor: 'l' },
    { at: 5.0, do: 'reveal', target: 'hero-title', state: 'content' },
    { at: 5.0, do: 'type', agent: 'copy', target: '.bp-h1', dur: 0.9 },
    { at: 6.1, do: 'reveal', target: 'hero-copy', state: 'content' },
    { at: 6.1, do: 'type', agent: 'copy', target: '.bp-promise', dur: 1.4 },
    { at: 7.7, do: 'say', agent: 'copy', say: 'cTone' },

    // Frontend asks Design for room, then drops the render in (wrong ratio)
    { at: 3.6, do: 'move', agent: 'frontend', target: 'hero-product', anchor: 'center' },
    { at: 5.4, do: 'say', agent: 'frontend', to: 'design', say: 'fAsk' },
    { at: 5.9, do: 'move', agent: 'design', target: 'hero-product', anchor: 'tr' },
    { at: 6.6, do: 'say', agent: 'design', to: 'frontend', say: 'dAnswer' },
    { at: 7.1, do: 'grid', target: 'hero', cols: 0 },
    { at: 7.3, do: 'reveal', target: 'hero-product', state: 'content' },
    { at: 7.3, do: 'place', target: 'hero-product', xf: { s: 0.5 } },
    { at: 7.5, do: 'select', agent: 'frontend', target: 'hero-product' },
    { at: 7.7, do: 'resize', agent: 'frontend', target: 'hero-product', error: 'product-ratio', dur: 1.0 },
    { at: 8.9, do: 'deselect', agent: 'frontend' },
    { at: 8.4, do: 'reveal', target: 'hero-cta', state: 'content' },
    { at: 9.0, do: 'say', agent: 'frontend', say: 'fRender' },

    // Exploded view + callouts (Design drags the notes in and they land too high)
    { at: 9.6, do: 'move', agent: 'frontend', target: 'explode', anchor: 't' },
    { at: 10.2, do: 'reveal', target: 'explode', state: 'content' },
    { at: 10.3, do: 'say', agent: 'frontend', say: 'fExplode' },
    { at: 10.0, do: 'move', agent: 'design', target: 'explode', anchor: 'bl' },
    { at: 10.8, do: 'place', target: 'callouts', xf: { y: 120, r: 1 } },
    { at: 10.9, do: 'reveal', target: 'callouts', state: 'content' },
    { at: 11.2, do: 'move', agent: 'design', target: 'callouts', anchor: 'l', dur: 0.5 },
    { at: 11.8, do: 'drag', agent: 'design', target: 'callouts', error: 'notes-overlap', dur: 0.9 },
    { at: 12.9, do: 'say', agent: 'design', say: 'dNotes' },

    // Copy fills features + specs; Frontend waits for the copy before the final band
    { at: 9.2, do: 'move', agent: 'copy', target: 'features', anchor: 'tl' },
    { at: 10.6, do: 'reveal', target: 'features', state: 'skeleton' },
    { at: 12.2, do: 'reveal', target: 'features', state: 'content' },
    { at: 12.3, do: 'say', agent: 'copy', say: 'cSpecs' },
    { at: 12.6, do: 'move', agent: 'copy', target: 'specs', anchor: 'tl' },
    { at: 13.2, do: 'reveal', target: 'specs', state: 'content' },
    { at: 13.0, do: 'move', agent: 'frontend', target: 'cta', anchor: 'l' },
    { at: 13.4, do: 'say', agent: 'frontend', to: 'copy', say: 'fWait' },
    { at: 14.3, do: 'say', agent: 'copy', to: 'frontend', say: 'cHandoff' },
    { at: 14.8, do: 'reveal', target: 'cta', state: 'content' },
    { at: 14.9, do: 'reveal', target: 'footer', state: 'content' },
    { at: 14.9, do: 'deliver', agent: 'copy', say: 'cDone' },
    { at: 15.2, do: 'deliver', agent: 'design', say: 'dDone' },
    { at: 15.4, do: 'reveal', target: 'callouts', state: 'motion' },
    { at: 15.4, do: 'reveal', target: 'features', state: 'motion' },
    { at: 15.6, do: 'deliver', agent: 'frontend', say: 'fDone' },

    // Review
    { at: 16.0, do: 'phase', phase: 'review' },
    { at: 16.0, do: 'assign', to: 'qa', say: 'aReview' },
    { at: 16.2, do: 'move', agent: 'qa', target: 'nav', anchor: 'tr' },
    { at: 16.9, do: 'sweep', agent: 'qa', dur: 4.4 },
    { at: 21.5, do: 'say', agent: 'qa', to: 'orch', say: 'qaFound' },
    { at: 21.7, do: 'deliver', agent: 'qa' },

    { at: 22.0, do: 'assign', to: 'copy', status: 'fixing', say: 'rBuy' },
    { at: 22.2, do: 'move', agent: 'copy', target: '[data-build=nav] .bp-btn', anchor: 'l' },
    { at: 23.1, do: 'select', agent: 'copy', target: '[data-build=nav] .bp-btn' },
    { at: 23.3, do: 'type', agent: 'copy', target: '[data-build=nav] .bp-btn', error: 'buy-lang', dur: 0.7 },
    { at: 24.1, do: 'deselect', agent: 'copy' },
    { at: 24.2, do: 'say', agent: 'copy', say: 'cFixBuy' },

    { at: 23.8, do: 'assign', to: 'frontend', status: 'fixing', say: 'rRatio' },
    { at: 24.0, do: 'move', agent: 'frontend', target: 'hero-product', anchor: 'br' },
    { at: 25.0, do: 'select', agent: 'frontend', target: 'hero-product' },
    { at: 25.2, do: 'resize', agent: 'frontend', target: 'hero-product', error: 'product-ratio', dur: 1.0 },
    { at: 26.3, do: 'deselect', agent: 'frontend' },
    { at: 26.4, do: 'say', agent: 'frontend', say: 'fFixRatio' },

    { at: 26.6, do: 'assign', to: 'design', status: 'fixing', say: 'rNotes' },
    { at: 26.8, do: 'move', agent: 'design', target: 'callouts', anchor: 'l' },
    { at: 27.8, do: 'select', agent: 'design', target: 'callouts' },
    { at: 28.0, do: 'drag', agent: 'design', target: 'callouts', error: 'notes-overlap', dur: 0.9 },
    { at: 29.0, do: 'deselect', agent: 'design' },
    { at: 29.1, do: 'say', agent: 'design', say: 'dFixNotes' },

    { at: 24.6, do: 'deliver', agent: 'copy' },
    { at: 26.9, do: 'deliver', agent: 'frontend' },
    { at: 29.6, do: 'deliver', agent: 'design' },
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
