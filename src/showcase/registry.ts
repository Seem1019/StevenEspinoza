/**
 * Scenes available in "Agentes en vivo". To add a demo:
 *   1. create src/demos/<slug>/showcase/timeline.ts (a Scene) and src/demos/<slug>/BuildPreview.astro
 *   2. import the scene here
 *   3. add the preview component to `previews` in src/pages/[lang]/showcase/index.astro
 * The engine (engine.ts) never needs to change. The home intro scene lives in scenes/home.ts.
 */
import type { Scene } from './types';
import brinco from '../demos/brinco/showcase/timeline';
import lumbre from '../demos/lumbre/showcase/timeline';
import isola from '../demos/isola/showcase/timeline';
import turnio from '../demos/turnio/showcase/timeline';

export const scenes: Scene[] = [brinco, lumbre, isola, turnio];
