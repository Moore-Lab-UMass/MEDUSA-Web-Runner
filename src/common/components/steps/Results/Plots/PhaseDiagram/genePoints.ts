import { Point } from '@weng-lab/visualization';
import { PhaseSurface } from '@/common/phaseSurface';
import { FullGeneRow } from '@/common/results';
import { PLOT_COLORS } from '../plotColors';

// The kinds of point on the plot, in the legend's order. Each is a chip that can be switched off.
export const POINT_KINDS = [
  { kind: 'hits', label: 'Top hits', color: PLOT_COLORS.highlight },
  { kind: 'controls', label: 'Non-targeting controls', color: PLOT_COLORS.control },
  { kind: 'other', label: 'Other genes', color: PLOT_COLORS.background },
] as const;
export type PointKind = (typeof POINT_KINDS)[number]['kind'];

export type GeneMetadata = {
  gene: string;
  group: 'Anti-Death' | 'Pro-Death' | 'Selected' | 'Control' | 'Gene';
  kind: PointKind;
  // The surface's L2FC TRvUT where the gene sits. Null without a surface, or where it has none.
  l2fc: number | null;
};

export type GenePoint = Point<GeneMetadata>;

// Which genes are highlighted, and as what: the run's gene_list where it has one, and its top
// hits otherwise.
function highlightedGroups(
  genes: FullGeneRow[],
  proDeath: FullGeneRow[],
  antiDeath: FullGeneRow[],
  geneList: string[] | undefined,
) {
  const groups = new Map<string, GeneMetadata['group']>();
  if (geneList) {
    const requested = new Set(geneList.map((gene) => gene.toLowerCase()));
    for (const { gene } of genes) if (requested.has(gene.toLowerCase())) groups.set(gene, 'Selected');
  } else {
    for (const { gene } of proDeath) groups.set(gene, 'Pro-Death');
    for (const { gene } of antiDeath) groups.set(gene, 'Anti-Death');
  }
  return groups;
}

// Every gene as a point on the plot, styled by its kind and carrying its L2FC off the surface.
export function genePoints(
  genes: FullGeneRow[],
  proDeath: FullGeneRow[],
  antiDeath: FullGeneRow[],
  geneList: string[] | undefined,
  surface: PhaseSurface | null,
): GenePoint[] {
  const groups = highlightedGroups(genes, proDeath, antiDeath, geneList);

  const background: GenePoint[] = [];
  const controls: GenePoint[] = [];
  const hits: GenePoint[] = [];
  for (const { gene, control, log2Growth, log2Death } of genes) {
    const group = groups.get(gene);
    const point = { x: log2Growth, y: log2Death };
    const value = surface ? surface.l2fcAt(log2Growth, log2Death) : NaN;
    const l2fc = Number.isFinite(value) ? value : null;
    if (group) {
      const metaData = { gene, group, kind: 'hits' as const, l2fc };
      hits.push({ ...point, color: PLOT_COLORS.highlight, stroke: PLOT_COLORS.highlightRing, r: 5, label: gene, metaData });
    } else if (control) {
      controls.push({ ...point, color: PLOT_COLORS.control, metaData: { gene, group: 'Control', kind: 'controls', l2fc } });
    } else {
      background.push({ ...point, color: PLOT_COLORS.background, metaData: { gene, group: 'Gene', kind: 'other', l2fc } });
    }
  }
  // Later points draw on top: controls over the cloud, hits over both.
  return [...background, ...controls, ...hits];
}

// The points with the kinds switched off in the legend dimmed, and their labels dropped, so they
// stay in place behind the rest without the plot's domains moving.
export function withHidden(points: GenePoint[], hidden: ReadonlySet<string>): GenePoint[] {
  if (hidden.size === 0) return points;
  return points.map((point) =>
    point.metaData && hidden.has(point.metaData.kind) ? { ...point, dimmed: true, label: undefined } : point,
  );
}

// How many points there are of each kind.
export function kindCounts(points: GenePoint[]): Record<PointKind, number> {
  const counts: Record<PointKind, number> = { hits: 0, controls: 0, other: 0 };
  for (const { metaData } of points) if (metaData) counts[metaData.kind] += 1;
  return counts;
}

// Every point's L2FC, sorted: what the colorbar's histogram counts.
export function sortedL2fcs(points: GenePoint[]) {
  return Float64Array.from(points.flatMap(({ metaData }) => metaData?.l2fc ?? [])).sort();
}

// The points whose L2FC lies between `low` and `high`, both included.
export function pointsWithin(points: GenePoint[], [low, high]: [number, number]) {
  return points.filter(({ metaData }) => {
    const l2fc = metaData?.l2fc ?? null;
    return l2fc !== null && l2fc >= low && l2fc <= high;
  });
}
