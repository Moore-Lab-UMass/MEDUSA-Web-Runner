import { evenStops } from '@weng-lab/visualization';
import { PhaseSurface } from '@/common/phaseSurface';

export const SURFACE_LABEL = 'L2FC TRvUT';

// From the lowest L2FC to the highest: blue to red, as MEDUSA's own plot colors them, but muted,
// and with the two arms matched step for step in lightness so neither end reads louder.
export const SURFACE_COLORS = ['#4393c3', '#92c5de', '#f7f7f7', '#f4a582', '#d6604d'];
export const SURFACE_STOPS = evenStops(SURFACE_COLORS);

export const formatL2fc = (value: number) => value.toFixed(2).replace('-', '−');

type Domains = { xDomain: [number, number]; yDomain: [number, number] };

/**
 * The L2FC the surface's colors span: the largest |L2FC| on the part of it the plot shows, either
 * side of zero, as MEDUSA's own plot scales them. The surface reaches well past the genes, and
 * across all of it the far corners run several times higher, which would wash everything behind
 * the genes out to white.
 *
 * Null when nothing of the surface is in view, or all of it is zero: either way there is nothing
 * to color by.
 */
export function surfaceColorRange({ x, y, values }: PhaseSurface, domains: Domains): [number, number] | null {
  const [xLow, xHigh] = domains.xDomain;
  const [yLow, yHigh] = domains.yDomain;
  let limit = 0;
  for (let j = 0; j < y.length; j++) {
    if (y[j] < yLow || y[j] > yHigh) continue;
    for (let i = 0; i < x.length; i++) {
      if (x[i] < xLow || x[i] > xHigh) continue;
      const size = Math.abs(values[j * x.length + i]);
      if (size > limit && Number.isFinite(size)) limit = size;
    }
  }
  return limit > 0 ? [-limit, limit] : null;
}
