import Papa from 'papaparse';
import { RunMode, RunOutput, RunParameters } from '@/types';

type CsvRow = Record<string, string | undefined>;

type BaseRow = {
  gene: string;
  // Non-targeting control group. Python's plots match on prefix, although the analysis treats nont_id as a regex.
  control: boolean;
  // What genes are ordered by to pick the top and bottom hits: lower means more pro-death.
  rank: number;
};

// Type aliases rather than interfaces: the data grid's row type needs an implicit index signature.
export type FullGeneRow = BaseRow & {
  guides: number | null;
  // log2 of the relative growth and death rates, the two axes of the phase diagram.
  log2Growth: number;
  log2Death: number;
  growthPval: number | null;
  growthFdr: number | null;
  deathPval: number | null;
  deathFdr: number | null;
};

export type GmGeneRow = BaseRow & {
  // Percentiles of the z-scored rates across every matching simulation.
  deathP25: number;
  deathP50: number | null;
  deathP75: number | null;
  deathPredict: string;
  growthP50: number | null;
  growthPredict: string;
};

export type RunResults =
  | { mode: 'full'; filename: string; rows: FullGeneRow[]; excluded: number; hasStats: boolean }
  | { mode: 'gm'; filename: string; rows: GmGeneRow[]; excluded: number };

export const SIGNIFICANCE_FDR = 0.05;
export const TOP_HITS = 10;

const NUMERIC = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

// Full-mode rate cells can be a plain number or a one-element NumPy array such as "[0.85]".
// Anything else (blank, nan, inf, several values) is null, never zero.
function scalar(cell: string | undefined): number | null {
  if (cell === undefined) return null;
  let text = cell.trim();
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1).trim();
  if (!NUMERIC.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

// The summary CSV a run of this mode produces, if it produced one. GM writes none without stats.
export function summaryOutput(mode: RunMode, outputs: RunOutput[]): RunOutput | null {
  const candidates = mode === 'full' ? ['genelevel_pval.csv', 'genelevel.csv'] : ['genelevel_stats.csv'];
  const byFilename = new Map(outputs.map((output) => [output.filename, output]));
  for (const name of candidates) {
    const output = byFilename.get(name);
    if (output) return output;
  }
  return null;
}

export function parseResults(mode: RunMode, filename: string, text: string, parameters: RunParameters): RunResults {
  // A real parser: the per-guide columns hold NumPy arrays that wrap across lines inside quotes.
  const { data } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });
  const nontId = parameters.nont_id ?? 'NONT';
  let excluded = 0;

  if (mode === 'full') {
    const rows: FullGeneRow[] = [];
    for (const row of data) {
      const growth = scalar(row.Relative_GR_gene);
      const death = scalar(row.Relative_DR_gene);
      // A rate has to be positive to have a log2.
      if (!row.Gene || growth === null || death === null || growth <= 0 || death <= 0) {
        excluded += 1;
        continue;
      }
      const log2Death = Math.log2(death);
      rows.push({
        gene: row.Gene,
        control: row.Gene.startsWith(nontId),
        rank: log2Death,
        guides: scalar(row.Guides),
        log2Growth: Math.log2(growth),
        log2Death,
        growthPval: scalar(row.Relative_GR_pval),
        growthFdr: scalar(row.Relative_GR_FDR),
        deathPval: scalar(row.Relative_DR_pval),
        deathFdr: scalar(row.Relative_DR_FDR),
      });
    }
    return { mode, filename, rows, excluded, hasStats: filename === 'genelevel_pval.csv' };
  }

  const rows: GmGeneRow[] = [];
  for (const row of data) {
    const deathP25 = scalar(row.Relative_DR_gene_zscored_P25);
    if (!row.Gene || deathP25 === null) {
      excluded += 1;
      continue;
    }
    rows.push({
      gene: row.Gene,
      control: row.Gene.startsWith(nontId),
      rank: deathP25,
      deathP25,
      deathP50: scalar(row.Relative_DR_gene_zscored_P50),
      deathP75: scalar(row.Relative_DR_gene_zscored_P75),
      deathPredict: row.Relative_DR_gene_zscored_predict ?? '',
      growthP50: scalar(row.Relative_GR_gene_zscored_P50),
      growthPredict: row.Relative_GR_gene_zscored_predict ?? '',
    });
  }
  return { mode, filename, rows, excluded };
}

// The lowest- and highest-ranked genes, as MEDUSA's own plots pick them: controls included,
// and no gene in both lists when there are fewer than twice TOP_HITS rows.
export function topHits<T extends BaseRow>(rows: T[]): { proDeath: T[]; antiDeath: T[] } {
  const ordered = [...rows].sort((a, b) => a.rank - b.rank);
  const proDeath = ordered.slice(0, TOP_HITS);
  const taken = new Set(proDeath);
  const antiDeath = ordered
    .slice(-TOP_HITS)
    .filter((row) => !taken.has(row))
    .reverse();
  return { proDeath, antiDeath };
}
