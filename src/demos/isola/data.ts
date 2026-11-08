/** Isola H1 — product data shared by the page, the SVG renders and the 3D model. Fictional product. */
export type FinishId = 'graphite' | 'mist' | 'sage';

export interface Finish {
  id: FinishId;
  price: number;
  /** SVG + 3D colours (single source of truth). */
  shell: string;
  plate: string;
  cushion: string;
  metal: string;
  /** colour of the tiny wordmark on the ear cup (SVG only). */
  mark: string;
}

export const finishes: Finish[] = [
  { id: 'graphite', price: 349, shell: '#2B2E33', plate: '#3A3E44', cushion: '#1C1E21', metal: '#B8BDC3', mark: '#9AA1A8' },
  { id: 'mist', price: 349, shell: '#D9DDE1', plate: '#C5CACF', cushion: '#8B939B', metal: '#C9CED3', mark: '#6B737B' },
  { id: 'sage', price: 369, shell: '#7D8F85', plate: '#6C7D73', cushion: '#2E3431', metal: '#C2C7CC', mark: '#D6DED9' },
];

export const defaultFinish: FinishId = 'graphite';
export const fromPrice = Math.min(...finishes.map((f) => f.price));
export const isFinish = (v: string | null | undefined): v is FinishId => finishes.some((f) => f.id === v);
export const getFinish = (id: FinishId) => finishes.find((f) => f.id === id) ?? finishes[0];

/** CSS custom properties per finish, scoped to [data-finish] (generated, so SVG and 3D never drift). */
export const finishCss = finishes
  .map(
    (f) =>
      `.isola [data-finish='${f.id}'],.isola[data-finish='${f.id}'],[data-finish='${f.id}'] .isola-fin{--shell:${f.shell};--plate:${f.plate};--cushion:${f.cushion};--metal:${f.metal};--mark:${f.mark}}`,
  )
  .join('');

export const maxQty = 3;
