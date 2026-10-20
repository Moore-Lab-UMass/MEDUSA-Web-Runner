import { MAX_GM_COMBINATIONS, SIMULATION_MEMORY_BUDGET_BYTES, SIMULATION_ROW_BYTES } from './worker';

// MEDUSA's own defaults, for parameters left out of the run.
export const DEFAULT_ED_ERR = 0.02;
export const DEFAULT_SIM_PERM = 10;
export const DEFAULT_NUM_ITER = 1000;

// The num_iter values general mode picks from, finest first: round numbers, no finer than MEDUSA's
// default and no coarser than the backend's own GM examples.
const NUM_ITER_STEP = 100;
const MIN_GM_NUM_ITER = 100;

export interface GmSearchInput {
  NPG: number;
  T_end_tr: number;
  T_start: number;
  GRdrug1?: number;
  Do?: number;
  GRdrug2?: number;
  DRdrug?: number;
  ED: number;
  ED_err: number;
  sim_perm: number;
}

export interface GmSearch {
  // Every pairing of the candidate values for the unknown rates.
  combinations: number;
  // Those whose simulated effective dose is within ED_err of ED: one MEDUSA simulation each. Null
  // when there are more combinations than MAX_GM_COMBINATIONS, which are not tested.
  matches: number | null;
}

// numpy's linspace: `count` values evenly spaced from `from` to `to`, both included.
function linspace(from: number, to: number, count: number) {
  const step = count > 1 ? (to - from) / (count - 1) : 0;
  return Array.from({ length: count }, (_, k) => (k > 0 && k === count - 1 ? to : from + k * step));
}

// Doublings over `hours` at `rate`, written as MEDUSA writes it: hours / (1 / rate), where a zero
// rate's 1/rate is infinite and the doublings zero.
const doublings = (hours: number, rate: number) => (rate === 0 ? 0 : hours / (1 / rate));

/**
 * The search MEDUSA's general mode makes before it simulates anything (medusa/cli.py), worked out
 * here so a run that would match no simulations, or more than the worker can hold, is caught
 * before it is submitted. Each unknown rate takes sim_perm candidate values; each pairing of them
 * is kept if a wild-type population given those rates ends at the effective dose (test_ED in
 * medusa/test_sim.py, which takes both arms down at T_end_tr).
 *
 * This repeats MEDUSA's arithmetic, and has to be changed along with it.
 */
export function gmSearch(input: GmSearchInput): GmSearch {
  const { NPG, T_end_tr, T_start, ED, ED_err, sim_perm } = input;
  const candidates = (known: number | undefined, from: number, to: number) =>
    known === undefined ? linspace(from, to, sim_perm) : [known];
  const growthsBefore = candidates(input.GRdrug1, 0, NPG * 1.5);
  const onsets = candidates(input.Do, 0, T_end_tr - 1);
  const growthsAfter = candidates(input.GRdrug2, 0, NPG * 1.5);
  const deathRates = candidates(input.DRdrug, 0, 0.25);

  const combinations = growthsBefore.length * onsets.length * growthsAfter.length * deathRates.length;
  if (combinations > MAX_GM_COMBINATIONS) return { combinations, matches: null };

  const start = 500;
  const untreated = start * 2 ** doublings(T_end_tr - T_start, NPG);
  let matches = 0;
  for (const growthBefore of growthsBefore) {
    for (const onset of onsets) {
      const atOnset = start * 2 ** doublings(onset - T_start, growthBefore);
      const afterOnset = T_end_tr - onset;
      for (const growthAfter of growthsAfter) {
        const grown = atOnset * 2 ** doublings(afterOnset, growthAfter);
        for (const deathRate of deathRates) {
          const treated = Math.max(grown - grown * (deathRate * afterOnset), 1);
          if (Math.abs(treated / untreated - ED) <= ED_err) matches += 1;
        }
      }
    }
  }
  return { combinations, matches };
}

// What a general mode run's simulation tables take at once, with `matches` simulations.
export function simulationBytes(matches: number, numIter: number) {
  return matches * numIter * numIter * SIMULATION_ROW_BYTES;
}

// The finest num_iter, in steps of 100 from MEDUSA's default down, whose simulations all fit the
// worker together. Null when not even the coarsest does.
export function largestFittingNumIter(matches: number): number | null {
  for (let numIter = DEFAULT_NUM_ITER; numIter >= MIN_GM_NUM_ITER; numIter -= NUM_ITER_STEP) {
    if (simulationBytes(matches, numIter) <= SIMULATION_MEMORY_BUDGET_BYTES) return numIter;
  }
  return null;
}
