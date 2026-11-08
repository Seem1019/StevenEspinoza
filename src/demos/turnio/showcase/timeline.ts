import type { Scene } from '../../../showcase/types';

/**
 * Turnio build (≈37 s) inside the simulated browser. Targets: data-build ids of BuildPreview.astro.
 * Messages: i18n `turnio` → showcase.say.* / showcase.flags.*
 * Errors: low-contrast hero CTA, a pricing plan overlapping its neighbour, a nav link in the other language.
 */
const scene: Scene = {
  id: 'turnio',
  ns: 'turnio',
  prefix: 'showcase',
  duration: 37,
  errors: [
    { id: 'cta-contrast', target: '[data-build=hero-cta] .bp-btn--mint', owner: 'design', flag: 'ctaContrast', paint: { 'background-color': '#14563f', color: '#2f7a61' } },
    { id: 'plans-overlap', target: '.bp-plan:nth-child(3)', owner: 'frontend', flag: 'plansOverlap', xf: { x: -150, y: 18 } },
    { id: 'nav-lang', target: '[data-build=header] nav span:nth-child(3)', owner: 'copy', flag: 'navLang', swapKey: { ns: 'turnio', key: 'nav.pricing' } },
  ],
  events: [
    { at: 0, do: 'phase', phase: 'kickoff' },
    { at: 0.1, do: 'spawn' },
    { at: 1.1, do: 'assign', to: 'design', say: 'aDesign' },
    { at: 1.4, do: 'assign', to: 'copy', say: 'aCopy' },
    { at: 1.7, do: 'assign', to: 'frontend', say: 'aFrontend' },
    { at: 2.0, do: 'assign', to: 'qa', status: 'idle', say: 'aQa' },

    { at: 2.4, do: 'phase', phase: 'build' },
    { at: 2.4, do: 'move', agent: 'design', target: 'header', anchor: 'tl' },
    { at: 3.1, do: 'reveal', target: 'header', state: 'skeleton' },
    { at: 3.1, do: 'select', agent: 'design', target: 'header' },
    { at: 3.3, do: 'say', agent: 'design', say: 'dPalette' },
    { at: 4.0, do: 'deselect', agent: 'design' },
    { at: 4.0, do: 'reveal', target: 'hero-copy', state: 'skeleton' },
    { at: 4.1, do: 'reveal', target: 'mock', state: 'skeleton' },
    { at: 4.1, do: 'grid', agent: 'design', target: '.bp-hero', cols: 12 },
    { at: 4.8, do: 'err', error: 'nav-lang' },
    { at: 4.8, do: 'reveal', target: 'header', state: 'content' },

    // Copy: headline. Copy and Design meet on the same block (headline vs. CTA)
    { at: 3.2, do: 'move', agent: 'copy', target: 'hero-copy', anchor: 'tl' },
    { at: 5.0, do: 'reveal', target: 'hero-copy', state: 'content' },
    { at: 5.0, do: 'type', agent: 'copy', target: '.bp-hero h2', dur: 1.8 },
    { at: 7.0, do: 'type', agent: 'copy', target: '.bp-sub', dur: 1.3 },
    { at: 6.0, do: 'move', agent: 'design', target: 'hero-cta', anchor: 'r' },
    { at: 6.6, do: 'say', agent: 'design', to: 'copy', say: 'dMeet' },
    { at: 7.4, do: 'say', agent: 'copy', to: 'design', say: 'cMeet' },
    { at: 8.4, do: 'err', error: 'cta-contrast' },
    { at: 8.4, do: 'reveal', target: 'hero-cta', state: 'content' },
    { at: 8.4, do: 'select', agent: 'design', target: 'hero-cta' },
    { at: 9.0, do: 'deselect', agent: 'design' },
    { at: 9.0, do: 'grid', target: '.bp-hero', cols: 0 },

    // Frontend: app mock grows in, toast and widget get dragged onto it
    { at: 3.5, do: 'move', agent: 'frontend', target: 'mock', anchor: 'center' },
    { at: 5.2, do: 'place', target: 'mock', xf: { s: 0.6 } },
    { at: 5.2, do: 'reveal', target: 'mock', state: 'content' },
    { at: 5.4, do: 'select', agent: 'frontend', target: 'mock' },
    { at: 5.6, do: 'resize', agent: 'frontend', target: 'mock', dur: 1.0 },
    { at: 6.8, do: 'deselect', agent: 'frontend' },
    { at: 6.8, do: 'place', target: 'toast', xf: { x: 160, y: -30, r: 4 } },
    { at: 6.8, do: 'reveal', target: 'toast' },
    { at: 7.0, do: 'move', agent: 'frontend', target: 'toast', anchor: 'l', dur: 0.6 },
    { at: 7.7, do: 'drag', agent: 'frontend', target: 'toast', dur: 0.7 },
    { at: 8.5, do: 'place', target: 'widget', xf: { x: -150, y: 40, r: -4 } },
    { at: 8.5, do: 'reveal', target: 'widget' },
    { at: 8.6, do: 'move', agent: 'frontend', target: 'widget', anchor: 'r', dur: 0.6 },
    { at: 9.3, do: 'drag', agent: 'frontend', target: 'widget', dur: 0.7 },
    { at: 10.1, do: 'say', agent: 'frontend', say: 'fMock' },

    // Social proof + benefits (Copy) / pricing (Frontend)
    { at: 9.8, do: 'move', agent: 'copy', target: 'logos', anchor: 'l' },
    { at: 10.3, do: 'reveal', target: 'logos', state: 'content' },
    { at: 10.4, do: 'say', agent: 'copy', say: 'cSample' },
    { at: 11.2, do: 'move', agent: 'copy', target: 'benefits', anchor: 'tl' },
    { at: 11.8, do: 'reveal', target: 'benefits', state: 'content' },
    { at: 10.8, do: 'move', agent: 'frontend', target: 'pricing', anchor: 't' },
    { at: 11.4, do: 'reveal', target: 'pricing', state: 'skeleton' },
    { at: 11.6, do: 'say', agent: 'copy', to: 'frontend', say: 'cHandoff' },
    { at: 12.6, do: 'reveal', target: 'pricing', state: 'content' },
    { at: 12.6, do: 'place', target: '.bp-plan:nth-child(3)', xf: { x: 140, y: 40, r: 3 } },
    { at: 12.8, do: 'move', agent: 'frontend', target: '.bp-plan:nth-child(3)', anchor: 't', dur: 0.6 },
    { at: 13.5, do: 'drag', agent: 'frontend', target: '.bp-plan:nth-child(3)', error: 'plans-overlap', dur: 0.9 },
    { at: 14.6, do: 'say', agent: 'frontend', say: 'fPlans' },

    // Design closes the page
    { at: 10.0, do: 'move', agent: 'design', target: 'faq', anchor: 'tl' },
    { at: 12.0, do: 'reveal', target: 'faq', state: 'content' },
    { at: 12.8, do: 'reveal', target: 'final', state: 'skeleton' },
    { at: 13.6, do: 'reveal', target: 'final', state: 'content' },
    { at: 13.8, do: 'reveal', target: 'footer', state: 'content' },
    { at: 14.0, do: 'deliver', agent: 'design', say: 'dDone' },
    { at: 14.4, do: 'deliver', agent: 'copy', say: 'cDone' },
    { at: 15.2, do: 'reveal', target: 'toast', state: 'motion' },
    { at: 15.2, do: 'reveal', target: 'widget', state: 'motion' },
    { at: 15.3, do: 'reveal', target: 'mock', state: 'motion' },
    { at: 15.5, do: 'deliver', agent: 'frontend', say: 'fDone' },

    // Review
    { at: 16.0, do: 'phase', phase: 'review' },
    { at: 16.0, do: 'assign', to: 'qa', say: 'aReview' },
    { at: 16.2, do: 'move', agent: 'qa', target: 'header', anchor: 'tr' },
    { at: 16.9, do: 'sweep', agent: 'qa', dur: 4.4 },
    { at: 21.5, do: 'say', agent: 'qa', to: 'orch', say: 'qaFound' },
    { at: 21.7, do: 'deliver', agent: 'qa' },

    { at: 22.0, do: 'assign', to: 'copy', status: 'fixing', say: 'rNav' },
    { at: 22.2, do: 'move', agent: 'copy', target: '[data-build=header] nav span:nth-child(3)', anchor: 'l' },
    { at: 23.1, do: 'select', agent: 'copy', target: '[data-build=header] nav span:nth-child(3)' },
    { at: 23.3, do: 'type', agent: 'copy', target: '[data-build=header] nav span:nth-child(3)', error: 'nav-lang', dur: 0.7 },
    { at: 24.1, do: 'deselect', agent: 'copy' },
    { at: 24.2, do: 'say', agent: 'copy', say: 'cFixNav' },

    { at: 23.6, do: 'assign', to: 'design', status: 'fixing', say: 'rCta' },
    { at: 23.8, do: 'move', agent: 'design', target: '[data-build=header] .bp-logo svg', anchor: 'center' },
    { at: 24.7, do: 'pick', agent: 'design', color: '#7cf3b6' },
    { at: 24.8, do: 'say', agent: 'design', say: 'dPick' },
    { at: 25.5, do: 'move', agent: 'design', target: '[data-build=hero-cta] .bp-btn--mint', anchor: 'center' },
    { at: 26.4, do: 'fix', agent: 'design', error: 'cta-contrast', dur: 0.6 },
    { at: 27.1, do: 'say', agent: 'design', say: 'dFixCta' },

    { at: 26.6, do: 'assign', to: 'frontend', status: 'fixing', say: 'rPlans' },
    { at: 26.8, do: 'move', agent: 'frontend', target: '.bp-plan:nth-child(3)', anchor: 't' },
    { at: 27.8, do: 'select', agent: 'frontend', target: '.bp-plan:nth-child(3)' },
    { at: 28.0, do: 'drag', agent: 'frontend', target: '.bp-plan:nth-child(3)', error: 'plans-overlap', dur: 0.9 },
    { at: 29.0, do: 'deselect', agent: 'frontend' },
    { at: 29.1, do: 'say', agent: 'frontend', say: 'fFixPlans' },

    { at: 24.6, do: 'deliver', agent: 'copy' },
    { at: 27.5, do: 'deliver', agent: 'design' },
    { at: 29.6, do: 'deliver', agent: 'frontend' },
    { at: 30.0, do: 'assign', to: 'qa', say: 'aRecheck' },
    { at: 30.2, do: 'move', agent: 'qa', target: 'header', anchor: 'tr', dur: 0.7 },
    { at: 31.0, do: 'sweep', agent: 'qa', dur: 2.4 },

    { at: 33.6, do: 'phase', phase: 'close' },
    { at: 33.6, do: 'say', agent: 'qa', to: 'orch', say: 'qaOk' },
    { at: 33.8, do: 'approve' },
    { at: 33.9, do: 'deliver', agent: 'qa' },
    { at: 35.8, do: 'park' },
  ],
};

export default scene;
