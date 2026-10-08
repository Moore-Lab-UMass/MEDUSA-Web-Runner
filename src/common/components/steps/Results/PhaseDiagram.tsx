'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ScatterPlot, Point } from '@weng-lab/visualization';
import { FullGeneRow } from '@/common/results';

type GeneGroup = { gene: string; group: 'Anti-Death' | 'Pro-Death' | 'Selected' | 'Control' | 'Gene' };

const HIT_COLOR = '#a78bfa';
const HIT_STROKE = '#7c3aed';
const CONTROL_COLOR = '#6b6b6b';
const BACKGROUND_COLOR = '#b0b0b0';

// ScatterPlot keeps 90px of each dimension for its axes (20 + 70 either way). At or below that
// its drawable area is zero, and its background gradient then throws on a 0/0 colour stop.
const PLOT_MARGIN = 90;

const LEGEND = [
  { label: 'Top hits', color: HIT_COLOR },
  { label: 'Non-targeting controls', color: CONTROL_COLOR },
  { label: 'Other genes', color: BACKGROUND_COLOR },
];

interface Props {
  genes: FullGeneRow[];
  proDeath: FullGeneRow[];
  antiDeath: FullGeneRow[];
  // The run's gene_list parameter. When set it replaces the top hits as what gets highlighted.
  geneList?: string[];
}

// The fully parameterized phase diagram: log2 relative growth rate against log2 relative death rate.
export default function PhaseDiagram({ genes, proDeath, antiDeath, geneList }: Props) {
  const pointData = useMemo(() => {
    const groups = new Map<string, GeneGroup['group']>();
    if (geneList) {
      const requested = new Set(geneList.map((gene) => gene.toLowerCase()));
      for (const { gene } of genes) if (requested.has(gene.toLowerCase())) groups.set(gene, 'Selected');
    } else {
      for (const { gene } of proDeath) groups.set(gene, 'Pro-Death');
      for (const { gene } of antiDeath) groups.set(gene, 'Anti-Death');
    }

    const background: Point<GeneGroup>[] = [];
    const controls: Point<GeneGroup>[] = [];
    const hits: Point<GeneGroup>[] = [];
    for (const { gene, control, log2Growth, log2Death } of genes) {
      const group = groups.get(gene);
      const point = { x: log2Growth, y: log2Death };
      if (group) {
        hits.push({ ...point, color: HIT_COLOR, stroke: HIT_STROKE, r: 5, label: gene, metaData: { gene, group } });
      } else if (control) {
        controls.push({ ...point, color: CONTROL_COLOR, metaData: { gene, group: 'Control' } });
      } else {
        background.push({ ...point, color: BACKGROUND_COLOR, metaData: { gene, group: 'Gene' } });
      }
    }
    // Later points draw on top: controls over the cloud, hits over both.
    return [...background, ...controls, ...hits];
  }, [genes, proDeath, antiDeath, geneList]);

  // Measured here and handed to ScatterPlot as an explicit size. Left to measure itself, its size
  // is 0x0 until its first measurement lands, which is the case PLOT_MARGIN describes.
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const plottable = size !== null && size.width > PLOT_MARGIN && size.height > PLOT_MARGIN;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ScatterPlot draws the gradient's color bar past its own right edge, so pr reserves room for it */}
      <Box ref={measureRef} sx={{ flex: 1, minHeight: 100, pr: 11, position: 'relative' }}>
        {plottable && (
          // Out of flow, so the plot's fixed pixel size can never stop this box from shrinking.
          <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
            <ScatterPlot
              width={size.width}
              height={size.height}
              pointData={pointData}
              loading={false}
              controlsPosition="right"
              leftAxisLabel="log₂(Relative Death Rate)"
              bottomAxisLabel="log₂(Relative Growth Rate)"
              border
              originLine
              // Decorative for now: the real background comes from simtable.csv, which a run only
              // writes with out_intermediate. Until that is wired there are no values to label it with.
              backgroundGradient={{
                colorScale: ['red', 'white', 'blue'],
                legend: { label: 'L2FC TRvUT' },
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
        {LEGEND.map(({ label, color }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
            <Typography sx={{ fontSize: 12, color: '#666' }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
