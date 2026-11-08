import type { Scene } from '../../../showcase/types';

/**
 * Lumbre build (≈37 s) inside the simulated browser. Targets: data-build ids of BuildPreview.astro.
 * Messages: i18n `lumbre` → showcase.say.* / showcase.flags.*
 * Errors: hero name overflowing its column, menu tab in the other language, low-contrast "book" button.
 */
const scene: Scene = {
  id: 'lumbre',
  ns: 'lumbre',
  prefix: 'showcase',
  duration: 37,
  errors: [
    { id: 'h1-size', target: '.bp-h1', owner: 'design', flag: 'h1Size', xf: { s: 1.42 }, origin: '0 100%' },
    { id: 'tab-lang', target: '.bp-tabs span:nth-child(2)', owner: 'copy', flag: 'tabLang', swapKey: { ns: 'lumbre', key: 'menu.tabs.fuego' } },
    { id: 'reserve-contrast', target: '[data-build=reserve] .bp-btn', owner: 'design', flag: 'reserveContrast', paint: { 'background-color': '#2b1d15', color: '#5f4636' } },
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
    { at: 4.0, do: 'move', agent: 'design', target: 'hero', anchor: 'center' },
    { at: 4.6, do: 'reveal', target: 'hero', state: 'content' },
    { at: 4.6, do: 'reveal', target: 'hero-copy', state: 'skeleton' },
    { at: 4.6, do: 'grid', agent: 'design', target: 'hero', cols: 12 },
    { at: 5.0, do: 'reveal', target: 'nav', state: 'content' },
    { at: 5.2, do: 'say', agent: 'design', say: 'dScene' },

    // Copy asks about the name size → Design pushes it (overflow)
    { at: 3.4, do: 'move', agent: 'copy', target: 'hero-copy', anchor: 'l' },
    { at: 5.8, do: 'say', agent: 'copy', to: 'design', say: 'cAsk' },
    { at: 6.2, do: 'move', agent: 'design', target: 'hero-copy', anchor: 'tr' },
    { at: 6.9, do: 'say', agent: 'design', to: 'copy', say: 'dAnswer' },
    { at: 7.3, do: 'err', error: 'h1-size' },
    { at: 7.3, do: 'reveal', target: 'hero-copy', state: 'content' },
    { at: 7.3, do: 'type', agent: 'copy', target: '.bp-h1', dur: 0.9 },
    { at: 8.4, do: 'type', agent: 'copy', target: '.bp-line', dur: 1.5 },
    { at: 9.4, do: 'grid', target: 'hero', cols: 0 },

    // Frontend: rail, then the three scene strips slide up into the row
    { at: 3.6, do: 'move', agent: 'frontend', target: 'rail', anchor: 'l' },
    { at: 4.8, do: 'reveal', target: 'rail', state: 'content' },
    { at: 4.9, do: 'say', agent: 'frontend', say: 'fRail' },
    { at: 6.0, do: 'place', target: 'strip-barra', xf: { y: 90, r: -2 } },
    { at: 6.0, do: 'place', target: 'strip-cocina', xf: { x: -40, y: 130, r: 2 } },
    { at: 6.0, do: 'place', target: 'strip-mesa', xf: { x: -90, y: 160, r: -3 } },
    { at: 6.2, do: 'reveal', target: 'strip-barra' },
    { at: 6.3, do: 'reveal', target: 'strip-cocina' },
    { at: 6.4, do: 'reveal', target: 'strip-mesa' },
    { at: 6.6, do: 'move', agent: 'frontend', target: 'strip-mesa', anchor: 'center' },
    { at: 7.4, do: 'drag', agent: 'frontend', target: 'strip-mesa', dur: 0.8 },
    { at: 8.3, do: 'move', agent: 'frontend', target: 'strip-cocina', anchor: 'center', dur: 0.5 },
    { at: 8.9, do: 'drag', agent: 'frontend', target: 'strip-cocina', dur: 0.7 },
    { at: 9.7, do: 'move', agent: 'frontend', target: 'strip-barra', anchor: 'center', dur: 0.5 },
    { at: 10.3, do: 'drag', agent: 'frontend', target: 'strip-barra', dur: 0.6 },
    { at: 11.0, do: 'say', agent: 'frontend', say: 'fStrips' },

    // Menu: Copy writes, Frontend waits for the dishes
    { at: 10.2, do: 'move', agent: 'copy', target: 'menu-head', anchor: 'tl' },
    { at: 10.8, do: 'reveal', target: 'menu-head', state: 'content' },
    { at: 10.8, do: 'type', agent: 'copy', target: '.bp-h2', dur: 0.9 },
    { at: 11.9, do: 'err', error: 'tab-lang' },
    { at: 11.9, do: 'reveal', target: 'tabs', state: 'content' },
    { at: 11.6, do: 'move', agent: 'frontend', target: 'dishes', anchor: 'tl' },
    { at: 12.2, do: 'reveal', target: 'dishes', state: 'skeleton' },
    { at: 12.4, do: 'say', agent: 'frontend', to: 'copy', say: 'fWait' },
    { at: 13.4, do: 'say', agent: 'copy', to: 'frontend', say: 'cHandoff' },
    { at: 13.9, do: 'reveal', target: 'dishes', state: 'content' },
    { at: 13.9, do: 'select', agent: 'frontend', target: 'dishes' },
    { at: 14.6, do: 'deselect', agent: 'frontend' },
    { at: 14.2, do: 'deliver', agent: 'copy', say: 'cDone' },

    // Design: booking band + footer, then motion
    { at: 12.0, do: 'move', agent: 'design', target: 'reserve', anchor: 'l' },
    { at: 12.6, do: 'reveal', target: 'reserve', state: 'skeleton' },
    { at: 13.6, do: 'err', error: 'reserve-contrast' },
    { at: 13.6, do: 'reveal', target: 'reserve', state: 'content' },
    { at: 13.7, do: 'say', agent: 'design', say: 'dReserve' },
    { at: 14.4, do: 'reveal', target: 'footer', state: 'content' },
    { at: 14.8, do: 'deliver', agent: 'design', say: 'dDone' },
    { at: 15.2, do: 'reveal', target: 'hero', state: 'motion' },
    { at: 15.3, do: 'deliver', agent: 'frontend', say: 'fDone' },

    // Review
    { at: 15.8, do: 'phase', phase: 'review' },
    { at: 15.8, do: 'assign', to: 'qa', say: 'aReview' },
    { at: 16.0, do: 'move', agent: 'qa', target: 'nav', anchor: 'tr' },
    { at: 16.7, do: 'sweep', agent: 'qa', dur: 4.4 },
    { at: 21.3, do: 'say', agent: 'qa', to: 'orch', say: 'qaFound' },
    { at: 21.5, do: 'deliver', agent: 'qa' },

    { at: 21.8, do: 'assign', to: 'design', status: 'fixing', say: 'rH1' },
    { at: 22.0, do: 'move', agent: 'design', target: '.bp-h1', anchor: 'tr' },
    { at: 22.9, do: 'select', agent: 'design', target: '.bp-h1' },
    { at: 23.1, do: 'resize', agent: 'design', target: '.bp-h1', error: 'h1-size', dur: 0.95 },
    { at: 24.2, do: 'deselect', agent: 'design' },
    { at: 24.3, do: 'say', agent: 'design', say: 'dFixH1' },

    { at: 23.6, do: 'assign', to: 'copy', status: 'fixing', say: 'rTab' },
    { at: 23.8, do: 'move', agent: 'copy', target: '.bp-tabs span:nth-child(2)', anchor: 'l' },
    { at: 24.8, do: 'select', agent: 'copy', target: '.bp-tabs span:nth-child(2)' },
    { at: 25.0, do: 'type', agent: 'copy', target: '.bp-tabs span:nth-child(2)', error: 'tab-lang', dur: 0.8 },
    { at: 25.9, do: 'deselect', agent: 'copy' },
    { at: 26.0, do: 'say', agent: 'copy', say: 'cFixTab' },

    { at: 26.2, do: 'assign', to: 'design', status: 'fixing', say: 'rReserve' },
    { at: 26.4, do: 'move', agent: 'design', target: '[data-build=nav] .bp-btn', anchor: 'center' },
    { at: 27.3, do: 'pick', agent: 'design', color: '#e8742c' },
    { at: 27.4, do: 'say', agent: 'design', say: 'dPick' },
    { at: 28.1, do: 'move', agent: 'design', target: '[data-build=reserve] .bp-btn', anchor: 'center' },
    { at: 29.1, do: 'fix', agent: 'design', error: 'reserve-contrast', dur: 0.6 },
    { at: 29.8, do: 'say', agent: 'design', say: 'dFixReserve' },

    { at: 24.6, do: 'deliver', agent: 'design' },
    { at: 26.5, do: 'deliver', agent: 'copy' },
    { at: 30.2, do: 'deliver', agent: 'design' },
    { at: 30.5, do: 'assign', to: 'qa', say: 'aRecheck' },
    { at: 30.7, do: 'move', agent: 'qa', target: 'nav', anchor: 'tr', dur: 0.7 },
    { at: 31.5, do: 'sweep', agent: 'qa', dur: 2.4 },

    { at: 34.1, do: 'phase', phase: 'close' },
    { at: 34.1, do: 'say', agent: 'qa', to: 'orch', say: 'qaOk' },
    { at: 34.3, do: 'approve' },
    { at: 34.4, do: 'deliver', agent: 'qa' },
    { at: 36.2, do: 'park' },
  ],
};

export default scene;
