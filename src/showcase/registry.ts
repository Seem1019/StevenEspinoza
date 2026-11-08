/**
 * Timelines available in the agents showcase. To add a demo:
 *   1. create src/demos/<slug>/showcase/timeline.ts and src/demos/<slug>/BuildPreview.astro
 *   2. import the timeline here
 *   3. add the preview component to `previews` in src/pages/[lang]/showcase/index.astro
 * The engine (engine.ts) never needs to change.
 */
import type { Timeline } from './types';
import brinco from '../demos/brinco/showcase/timeline';
import lumbre from '../demos/lumbre/showcase/timeline';
import isola from '../demos/isola/showcase/timeline';
import turnio from '../demos/turnio/showcase/timeline';

export const timelines: Timeline[] = [brinco, lumbre, isola, turnio];
