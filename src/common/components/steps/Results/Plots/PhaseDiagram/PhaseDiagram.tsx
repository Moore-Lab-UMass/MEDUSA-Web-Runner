'use client';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { getSharedDomains, RampRange, ScatterPlot, sweptValues } from '@weng-lab/visualization';
import { PhaseSurface, surfaceOver } from '@/common/phaseSurface';
import { FullGeneRow } from '@/common/results';
import PlotFrame from '../PlotFrame';
import GeneTooltip from './GeneTooltip';
import PointLegend from './PointLegend';
import SurfaceLegend from './SurfaceLegend';
import { genePoints, pointsWithin, sortedL2fcs } from './genePoints';
import { SURFACE_COLORS } from '../plotColors';
import { surfaceColorRange } from './surfaceScale';

// ScatterPlot keeps 90px of each dimension for its axes (20 + 70 either way).
const PLOT_MARGIN = 90;

// ScatterPlot zooms out no further than half scale, which shows half its domain's span again past
// either end, and pans no further than that shows. The background is drawn a little past it, so
// its edge never comes into view.
const FIELD_REACH = 0.55;
const reach = ([low, high]: [number, number]): [number, number] => {
  const pad = (high - low) * FIELD_REACH;
  return [low - pad, high + pad];
};

interface Props {
  genes: FullGeneRow[];
  proDeath: FullGeneRow[];
  antiDeath: FullGeneRow[];
  // The run's gene_list parameter. When set it replaces the top hits as what gets highlighted.
  geneList?: string[];
  // The run's simulation, drawn behind the genes. Null when it has no grid to draw.
  surface: PhaseSurface | null;
}

// The fully parameterized phase diagram: log2 relative growth rate against log2 relative death rate.
export default function PhaseDiagram({ genes, proDeath, antiDeath, geneList, surface }: Props) {
  const pointData = useMemo(
    () => genePoints(genes, proDeath, antiDeath, geneList, surface),
    [genes, proDeath, antiDeath, geneList, surface],
  );
  // The domains the plot would settle on itself, taken here so the colors can be fitted to them.
  const domains = useMemo(() => getSharedDomains(pointData), [pointData]);
  const colorRange = useMemo(() => (surface ? surfaceColorRange(surface, domains) : null), [surface, domains]);
  // What the background paints: the model across everything the plot can be zoomed or panned to.
  const field = useMemo(
    () => (surface ? surfaceOver(surface, reach(domains.xDomain), reach(domains.yDomain)) : null),
    [surface, domains],
  );
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
            width={width}
            height={height}
            pointData={pointData}
            loading={false}
            controlsPosition="right"
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
              field && colorRange
                ? {
                    ...field,
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
      <PointLegend />
    </Box>
  );
}
