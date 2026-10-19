import { RunState } from '@/types';

// What the medusa-worker Cloud Run Job is deployed with (MEDUSA-backend worker/deploy.env.example:
// 1 CPU, 1Gi, a 30 minute task timeout, no retries). Change these along with its deployment.

// Past this a run is stopped outright, with no chance to report the failure: its status stays
// QUEUED or RUNNING for good.
export const TASK_TIMEOUT_MS = 30 * 60 * 1000;

// How much of the worker's 1Gi general mode's simulation tables can take. MEDUSA holds every
// matching simulation's table at once (`records` in medusa/cli.py) until it has mapped the guides
// onto them; the rest of the memory goes to Python, the guide table and the z-scoring after.
// A run past this is killed for memory, again with no failure reported.
export const SIMULATION_MEMORY_BUDGET_BYTES = 300 * 1000 * 1000;

// Each simulation is a table of num_iter² rows of 7 float64 columns (run_medusa in medusa/run_sim.py).
export const SIMULATION_ROW_BYTES = 7 * 8;

// The most candidate combinations general mode may test. MEDUSA tests each in turn in Python before
// simulating any, so a search of sim_perm⁴ (all four rates unknown) runs into the task timeout
// well before it runs out of memory.
export const MAX_GM_COMBINATIONS = 1_000_000;

// The most matching simulations a general mode run may have. Its genelevel_simulations.csv has a
// row per gene per simulation, which the results page downloads and parses whole: at 500, a
// genome-wide library writes some 10 million rows.
export const MAX_GM_SIMULATIONS = 500;

// Allowance for the browser's clock running ahead of the API's.
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Whether a queued or running run has outlived the worker's task timeout, and so will never
 * finish: its worker was stopped for time or memory, which leaves no chance to mark it FAILED.
 * Timed from when the worker started it, or failing that from its last update.
 */
export function workerAbandoned(run: RunState, now = Date.now()) {
  if (run.status !== 'QUEUED' && run.status !== 'RUNNING') return false;
  const since = Date.parse(run.startedAt ?? run.updatedAt ?? run.createdAt ?? '');
  return Number.isFinite(since) && now - since > TASK_TIMEOUT_MS + CLOCK_SKEW_MS;
}
