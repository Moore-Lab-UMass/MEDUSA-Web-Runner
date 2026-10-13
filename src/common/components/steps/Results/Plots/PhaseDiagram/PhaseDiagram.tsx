'use client';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { getSharedDomains, RampRange, ScatterPlot, sweptValues } from '@weng-lab/visualization';
import { PhaseSurface } from '@/common/phaseSurface';
import { FullGeneRow } from '@/common/results';
import PlotFrame from '../PlotFrame';
import GeneTooltip from './GeneTooltip';
import PointLegend from './PointLegend';
import SurfaceLegend from './SurfaceLegend';
import { genePoints, pointsWithin, sortedL2fcs } from './genePoints';
import { SURFACE_COLORS, surfaceColorRange } from './surfaceScale';

const MINIMAP = { position: { right: 50, bottom: 50 } };

// ScatterPlot keeps 90px of each dimension for its axes (20 + 70 either way).
const PLOT_MARGIN = 90;

interface Props {
  genes: FullGeneRow[];
  proDeath: FullGeneRow[];
  antiDeath: FullGeneRow[];
  // The run's gene_list parameter. When set it replaces the top hits as what gets highlighted.
  geneList?: string[];
  // The run's simulation, drawn behind the genes. Null when the run has none.
  surface: PhaseSurface | 'loading' | null;
}

// The fully parameterized phase diagram: log2 relative growth rate against log2 relative death rate.
export default function PhaseDiagram({ genes, proDeath, antiDeath, geneList, surface }: Props) {
  const grid = surface === 'loading' ? null : surface;

  const pointData = useMemo(
    () => genePoints(genes, proDeath, antiDeath, geneList, grid),
    [genes, proDeath, antiDeath, geneList, grid],
  );
  // The domains the plot would settle on itself, taken here so the colors can be fitted to them.
  const domains = useMemo(() => getSharedDomains(pointData), [pointData]);
  const colorRange = useMemo(() => (grid ? surfaceColorRange(grid, domains) : null), [grid, domains]);
  const l2fcs = useMemo(() => sortedL2fcs(pointData), [pointData]);

  // Sweeping the colorbar spotlights the genes whose L2FC lies in the stretch under the cursor.
  const [sweep, setSweep] = useState<RampRange | null>(null);
  const sweptGenes = useMemo(
    () => (sweep && colorRange ? pointsWithin(pointData, sweptValues(colorRange, sweep)) : undefined),
    [sweep, colorRange, pointData],
  );

  // Marked on the colorbar while a gene is hovered.
  const [hoveredL2fc, setHoveredL2fc] = useState<number | null>(null);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PlotFrame margin={PLOT_MARGIN}>
        {({ width, height }) => (
          <ScatterPlot
            // ScatterPlot stops the wheel from scrolling the page only if its plot is drawn when
            // it mounts, which it is not while loading. The key mounts it again once loaded.
            key={surface === 'loading' ? 'loading' : 'loaded'}
            width={width}
            height={height}
            pointData={pointData}
            loading={surface === 'loading'}
            controlsPosition="right"
            miniMap={MINIMAP}
            xDomain={domains.xDomain}
            yDomain={domains.yDomain}
            leftAxisLabel="log₂(Relative Death Rate)"
            bottomAxisLabel="log₂(Relative Growth Rate)"
            border
            originLine
            hoveredPoints={sweptGenes}
            spotlight
            onHoveredPointChange={(point) => setHoveredL2fc(point?.metaData?.l2fc ?? null)}
            animation="scale"
            animationBuffer={0.025}
            animationGroupSize={50}
            tooltipBody={(point) => <GeneTooltip point={point} />}
            backgroundField={
              grid && colorRange
                ? {
                    ...grid,
                    domain: colorRange,
                    colorScale: SURFACE_COLORS,
                    legend: (slot) => (
                      <SurfaceLegend
                        {...slot}
                        range={colorRange}
                        l2fcs={l2fcs}
                        sweep={sweep}
                        onSweep={setSweep}
                        marker={hoveredL2fc}
                      />
                    ),
                  }
                : undefined
            }
          />
        )}
      </PlotFrame>
      <PointLegend surfaceLoading={surface === 'loading'} />
    </Box>
  );
}
