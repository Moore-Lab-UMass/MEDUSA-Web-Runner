import { BackgroundField } from '@weng-lab/visualization';
import { RunParameters } from '@/types';

// L2FC_TRvUT on a grid over the phase diagram's plane: x is log2 of the relative growth rate and
// y log2 of the relative death rate, which the genes are placed by.
export type SurfaceGrid = Pick<BackgroundField, 'x' | 'y' | 'values'>;

// The model's L2FC_TRvUT on the grid MEDUSA simulates, and anywhere else on the plane.
export interface PhaseSurface extends SurfaceGrid {
  l2fcAt: (log2Growth: number, log2Death: number) => number;
}

// What MEDUSA uses when num_iter was left out of the run.
const DEFAULT_NUM_ITER = 1000;
// The cells each arm of the simulation starts from. Arbitrary, but a treated arm is never let
// fall below one cell, so it does not cancel out.
const START_CELLS = 500;

// numpy's linspace: `count` values evenly spaced from `from` to `to`, both included.
function linspace(from: number, to: number, count: number) {
  const step = count > 1 ? (to - from) / (count - 1) : 0;
  return Array.from({ length: count }, (_, k) => (k > 0 && k === count - 1 ? to : from + k * step));
}

// Relative rates as the grid's lines: ascending, each once. One without a log2 has no place on
// the plot.
function gridLines(rates: number[]) {
  return Float64Array.from(new Set(rates.filter((rate) => rate > 0))).sort();
}

/**
 * The simulation behind a fully parameterized run, as MEDUSA itself runs it (run_medusa in
 * medusa/run_sim.py, MEDUSA-backend) and would write to simtable.csv: a knockout's L2FC_TRvUT at
 * every pairing of num_iter relative growth rates with num_iter relative death rates. It depends
 * on nothing but the run's parameters, so it is worked out here rather than downloaded.
 *
 * This repeats MEDUSA's arithmetic, and has to be changed along with it.
 *
 * Null for a GM run, which has no single simulation, and for one whose rates give no grid to draw.
 */
export function simulateSurface(parameters: RunParameters): PhaseSurface | null {
  const { NPG, T_end_unt, T_end_tr, T_start = 0, GRdrug1, Do, GRdrug2, DRdrug } = parameters;
  if (GRdrug1 === undefined || Do === undefined || GRdrug2 === undefined || DRdrug === undefined) return null;
  const iterations = parameters.num_iter ?? DEFAULT_NUM_ITER;

  // Growth is simulated from near none to half again as fast as wild type, and at wild type itself.
  const growths = gridLines(NPG === 0 ? [1] : [...linspace(0.001, 1.5, iterations - 1), 1]);

  // Death is simulated evenly up to wild type's rate, and evenly again from there to the rate
  // that kills every cell after the onset of death. An even num_iter gives the first stretch
  // the one more value.
  const treatedSpan = T_end_tr - Do;
  const lethal = treatedSpan * DRdrug === 0 ? 1 : 1 / (treatedSpan * DRdrug);
  const upper = Math.ceil(iterations / 2);
  const lower = iterations % 2 === 0 ? upper + 1 : upper;
  const deaths = gridLines(DRdrug === 0 ? [1] : [...linspace(0.001, 1, lower), ...linspace(1, lethal, upper)]);
  if (growths.length < 2 || deaths.length < 2) return null;

  // Live cells when each arm is taken down, for cells growing `growth` times as fast as wild type
  // and dying `death` times as fast. The treated arm grows at one rate until the onset of death,
  // and at another while dying after it.
  const untreated = (growth: number) => START_CELLS * 2 ** ((T_end_unt - T_start) * NPG * growth);
  const treatedBeforeDeath = (growth: number) =>
    START_CELLS * 2 ** ((Do - T_start) * GRdrug1 * growth) * 2 ** (treatedSpan * GRdrug2 * growth);
  const treated = (beforeDeath: number, death: number) =>
    Math.max(beforeDeath - beforeDeath * (DRdrug * treatedSpan * death), 1);

  const wildType = treated(treatedBeforeDeath(1), 1) / untreated(1);
  const values = new Float32Array(growths.length * deaths.length);
  for (let i = 0; i < growths.length; i++) {
    const beforeDeath = treatedBeforeDeath(growths[i]);
    const untreatedCells = untreated(growths[i]);
    for (let j = 0; j < deaths.length; j++) {
      values[j * growths.length + i] = Math.log2(treated(beforeDeath, deaths[j]) / untreatedCells / wildType);
    }
  }
  // The same arithmetic off the grid: past 1.5 times wild type's growth, say, or past the death
  // rate that leaves a single cell, where the treated arm stays held at one.
  const l2fcAt = (log2Growth: number, log2Death: number) => {
    const growth = 2 ** log2Growth;
    return Math.log2(treated(treatedBeforeDeath(growth), 2 ** log2Death) / untreated(growth) / wildType);
  };
  return { x: growths.map(Math.log2), y: deaths.map(Math.log2), values, l2fcAt };
}

// Lines each way of a grid drawn from the model: as many as the plot's raster of it has pixels.
const FIELD_LINES = 1024;

/**
 * The surface across a stretch of the plane, worked out from the model at every point of an even
 * grid over it. MEDUSA's own grid stops short of what a zoomed-out plot can show, and is spread
 * from near zero growth, so little of it lands in view; this covers just the stretch asked for,
 * evenly in the log2 rates the plot is drawn in.
 */
export function surfaceOver(
  { l2fcAt }: PhaseSurface,
  [xLow, xHigh]: readonly [number, number],
  [yLow, yHigh]: readonly [number, number],
): SurfaceGrid {
  const x = Float64Array.from(linspace(xLow, xHigh, FIELD_LINES));
  const y = Float64Array.from(linspace(yLow, yHigh, FIELD_LINES));
  const values = new Float32Array(x.length * y.length);
  for (let j = 0; j < y.length; j++) {
    for (let i = 0; i < x.length; i++) values[j * x.length + i] = l2fcAt(x[i], y[j]);
  }
  return { x, y, values };
}
