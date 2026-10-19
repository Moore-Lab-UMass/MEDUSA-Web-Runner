// The file a GM run writes whatever its flags: one row per gene per matching simulation.
export const SIMULATIONS_FILE = 'genelevel_simulations.csv';
const HEADER = 'Gene,simulation_id,Relative_GR_gene_zscored,Relative_DR_gene_zscored';

// Each gene's z-scored relative death rate across a GM run's matching simulations: what its
// histogram is drawn from.
export interface DeathSamples {
  byGene: Map<string, number[]>;
  // Every control group's samples pooled and sorted, which each gene's histogram is set against.
  controls: Float64Array;
  simulations: number;
  // Samples left out for being nan or infinite, where the z-score was undefined.
  dropped: number;
}

/**
 * Streams genelevel_simulations.csv, which has genes × simulations rows and can run to hundreds
 * of megabytes, keeping only the death rates. Parsed a line at a time as it arrives, so neither
 * the text nor a row object per line is ever held whole.
 *
 * Controls are picked by prefix, as MEDUSA's own histograms pick them, although the analysis
 * treats nont_id as a regex.
 */
export async function loadDeathSamples(url: string, nontId: string, signal: AbortSignal): Promise<DeathSamples> {
  let response: Response;
  try {
    // Straight to GCS: the signature in the URL is the authorization, so no headers are added.
    response = await fetch(url, { signal });
  } catch (caught) {
    if (signal.aborted) throw caught;
    throw new Error(`Could not download ${SIMULATIONS_FILE} from storage.`, { cause: caught });
  }
  if (!response.ok || !response.body) throw new Error(`Could not download ${SIMULATIONS_FILE} (${response.status}).`);

  const byGene = new Map<string, number[]>();
  const controls: number[] = [];
  let simulations = 0;
  let dropped = 0;
  let sawHeader = false;

  const readLine = (raw: string) => {
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (line === '') return;
    if (!sawHeader) {
      if (line !== HEADER) throw new Error(`${SIMULATIONS_FILE} does not have the expected columns.`);
      sawHeader = true;
      return;
    }
    // The last three fields are numbers, so splitting from the right leaves the gene whole even
    // when it holds a comma, in which case Python's csv writer quoted it.
    const deathAt = line.lastIndexOf(',');
    const growthAt = line.lastIndexOf(',', deathAt - 1);
    const simulationAt = line.lastIndexOf(',', growthAt - 1);
    if (simulationAt <= 0) return;
    let gene = line.slice(0, simulationAt);
    if (gene.startsWith('"') && gene.endsWith('"')) gene = gene.slice(1, -1).replaceAll('""', '"');

    const simulation = Number(line.slice(simulationAt + 1, growthAt));
    if (simulation > simulations) simulations = simulation;
    // Python writes undefined z-scores as nan, inf or -inf, none of which Number() reads as finite.
    const death = Number(line.slice(deathAt + 1));
    if (!Number.isFinite(death)) {
      dropped += 1;
      return;
    }

    let values = byGene.get(gene);
    if (!values) {
      values = [];
      byGene.set(gene, values);
    }
    values.push(death);
    if (gene.startsWith(nontId)) controls.push(death);
  };

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let rest = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = rest + value;
    let start = 0;
    for (let end = text.indexOf('\n'); end !== -1; end = text.indexOf('\n', start)) {
      readLine(text.slice(start, end));
      start = end + 1;
    }
    rest = text.slice(start);
  }
  readLine(rest);

  if (!sawHeader) throw new Error(`${SIMULATIONS_FILE} is empty.`);
  return { byGene, controls: Float64Array.from(controls).sort(), simulations, dropped };
}

// What matplotlib's hist uses when given no bins, as MEDUSA's histograms are.
const HIST_BINS = 10;

export interface DensityBin {
  x0: number;
  x1: number;
  count: number;
  // count / (samples × bin width): probability density, so the bars' areas sum to 1. Narrow bins
  // over a tightly clustered series can stand well above 1.
  density: number;
}

/**
 * One series binned as MEDUSA's GM histograms bin it (medusa/plot_gm_hist.py): ax.hist(values,
 * density=True), which is numpy's histogram with 10 equal bins over the series' own range, so
 * the gene and the controls each get their own bins. A series with one distinct value gets a
 * range of that ±0.5, as numpy gives it.
 *
 * The values must be finite. The min and max are found in a loop, not by spreading the values
 * into Math.min/max, which have an argument limit the pooled controls can pass.
 */
export function densityHistogram(values: ArrayLike<number>): DensityBin[] {
  const total = values.length;
  if (total === 0) return [];
  let low = Infinity;
  let high = -Infinity;
  for (let k = 0; k < total; k++) {
    if (values[k] < low) low = values[k];
    if (values[k] > high) high = values[k];
  }
  if (low === high) {
    low -= 0.5;
    high += 0.5;
  }

  // numpy's edges: linspace(low, high, bins + 1), its last edge exactly `high`.
  const step = (high - low) / HIST_BINS;
  const edges = Array.from({ length: HIST_BINS + 1 }, (_, k) => (k === HIST_BINS ? high : low + k * step));
  const counts = new Array<number>(HIST_BINS).fill(0);
  for (let k = 0; k < total; k++) {
    const value = values[k];
    // As numpy: the bin from the scaled offset, corrected where rounding put the value across an
    // edge, with the top edge belonging to the last bin.
    let bin = Math.min(Math.floor(((value - low) / (high - low)) * HIST_BINS), HIST_BINS - 1);
    if (value < edges[bin]) bin -= 1;
    else if (bin < HIST_BINS - 1 && value >= edges[bin + 1]) bin += 1;
    counts[bin] += 1;
  }
  return counts.map((count, k) => ({
    x0: edges[k],
    x1: edges[k + 1],
    count,
    density: count / (total * (edges[k + 1] - edges[k])),
  }));
}
