import { Colorbar, RampRange } from '@weng-lab/visualization';
import { formatL2fc, SURFACE_LABEL, SURFACE_STOPS } from './surfaceScale';

interface Props {
  // The slot ScatterPlot gives a background's legend: to the plot's right, as tall as its plot area.
  width: number;
  height: number;
  // The L2FC the colors span.
  range: [number, number];
  // Every gene's L2FC, sorted, for the histogram along the bar.
  l2fcs: ArrayLike<number>;
  // The stretch of the bar under the cursor, which the plot spotlights the genes of.
  sweep: RampRange | null;
  onSweep: (sweep: RampRange | null) => void;
  // The hovered gene's L2FC, marked on the bar.
  marker: number | null;
}

// The surface's colorbar and its title. Drawn inside the plot's <svg>, so it returns SVG.
export default function SurfaceLegend({ width, height, range, l2fcs, sweep, onSweep, marker }: Props) {
  return (
    <>
      <Colorbar
        orientation="vertical"
        width={width}
        height={height}
        stops={SURFACE_STOPS}
        range={range}
        values={l2fcs}
        format={formatL2fc}
        noun="gene"
        sweep={sweep}
        onSweep={onSweep}
        marker={marker}
      />
      <text transform={`translate(${width - 14},${height / 2}) rotate(90)`} textAnchor="middle" fontSize={14}>
        {SURFACE_LABEL}
      </text>
    </>
  );
}
