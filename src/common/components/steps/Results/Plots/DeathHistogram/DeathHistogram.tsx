'use client';
import { useMemo, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Axis, Group, Scale } from '@visx/visx';
import { ChipLegend, PlotTooltip, PlotTooltipHandle } from '@weng-lab/visualization';
import { DensityBin, densityHistogram } from '@/common/deathSamples';
import { DeathSamplesState } from '@/common/hooks/useDeathSamples';
import { GmGeneRow } from '@/common/results';
import PlotFrame from '../PlotFrame';
import { PLOT_COLORS } from '../plotColors';

const MARGIN = { top: 16, right: 20, bottom: 56, left: 64 };
// What PlotFrame has to leave the plot for its axes, either way.
const PLOT_MARGIN = Math.max(MARGIN.left + MARGIN.right, MARGIN.top + MARGIN.bottom);

const FONT = 'Roboto,Helvetica,Arial,sans-serif';
const AXIS_LABEL_PROPS = { fontSize: 12, fontFamily: FONT, fill: PLOT_COLORS.axisText, textAnchor: 'middle' } as const;
const TICK_LABEL_PROPS = { fontSize: 11, fontFamily: FONT, fill: PLOT_COLORS.axisText } as const;

// A bar as the tooltip shows it: which series it is, and its bin.
type HoveredBar = DensityBin & { series: string };

// Drawn in this order, so the gene sits over the controls, as in MEDUSA's plots. Colored as the
// phase diagram colors a picked-out gene and the controls.
const SERIES = [
  { key: 'controls', color: PLOT_COLORS.control, opacity: 0.6 },
  { key: 'gene', color: PLOT_COLORS.highlight, opacity: 0.75 },
] as const;
type SeriesKey = (typeof SERIES)[number]['key'];

// How faint the other series goes while one is highlighted from the legend or the plot.
const FADED_OPACITY = 0.15;

interface Props {
  gene: GmGeneRow | null;
  samples: DeathSamplesState;
}

// A GM gene's z-scored relative death rate across the run's matching simulations, over the
// non-targeting controls' pooled, as MEDUSA's own histograms draw it (medusa/plot_gm_hist.py):
// each series a density histogram of 10 bins over its own range, the gene drawn over the controls.
export default function DeathHistogram({ gene, samples }: Props) {
  const ready = samples.status === 'ready' ? samples.samples : null;
  const geneSamples = gene && ready ? ready.byGene.get(gene.gene) : undefined;
  const geneBins = useMemo(() => (geneSamples ? densityHistogram(geneSamples) : []), [geneSamples]);
  // The same for every gene, so binned once per run rather than on every gene picked.
  const controlBins = useMemo(() => (ready ? densityHistogram(ready.controls) : []), [ready]);
  // The legend's state: series switched off, and the one under the cursor, in the legend or the plot.
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [highlighted, setHighlighted] = useState<SeriesKey | null>(null);
  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  if (samples.status === 'loading') {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
        <CircularProgress size={20} />
        <Typography sx={{ fontSize: 13, color: '#888' }}>Loading every simulation&apos;s rates…</Typography>
      </Box>
    );
  }
  if (samples.status === 'error') {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {samples.message} The output files may still be available under Download Output Files.
      </Alert>
    );
  }
  if (!gene) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* The gene on the left, the legend at the top right. */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 1.5, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{gene.gene}</Typography>
          <Typography sx={{ fontSize: 12.5, color: '#888' }}>
            {gene.deathPredict.replaceAll('_', ' ') || 'Unclassified'} · {(geneSamples?.length ?? 0).toLocaleString()}{' '}
            of {ready?.simulations.toLocaleString()} simulations
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <ChipLegend
            groups={[
              { value: 'gene', label: gene.gene, color: PLOT_COLORS.highlight, count: geneSamples?.length ?? 0 },
              {
                value: 'controls',
                label: 'Non-targeting controls',
                color: PLOT_COLORS.control,
                count: ready?.controls.length ?? 0,
              },
            ]}
            hidden={hidden}
            onToggle={toggle}
            highlighted={highlighted}
            onHover={(value) => setHighlighted(value as SeriesKey | null)}
          />
        </Box>
      </Box>

      {geneBins.length > 0 ? (
        <PlotFrame margin={PLOT_MARGIN}>
          {({ width, height }) => (
            <Bars
              geneBins={geneBins}
              controlBins={controlBins}
              gene={gene.gene}
              hidden={hidden}
              highlighted={highlighted}
              onHighlight={setHighlighted}
              width={width}
              height={height}
            />
          )}
        </PlotFrame>
      ) : (
        <Typography sx={{ fontSize: 13, color: '#888', m: 'auto', textAlign: 'center' }}>
          {gene.gene} has no finite death rates to plot.
        </Typography>
      )}

      <Typography sx={{ fontSize: 12, color: '#888' }}>
        Each series is binned over its own range and scaled to an area of 1 (count ÷ samples ÷ bin width), so a
        gene whose simulations agree closely stands tall and narrow against the controls.
        {ready && ready.dropped > 0 &&
          ` ${ready.dropped.toLocaleString()} ${ready.dropped === 1 ? 'sample was' : 'samples were'} left out for an undefined z-score.`}
      </Typography>
    </Box>
  );
}

interface BarsProps {
  geneBins: DensityBin[];
  controlBins: DensityBin[];
  gene: string;
  hidden: ReadonlySet<string>;
  highlighted: SeriesKey | null;
  onHighlight: (key: SeriesKey | null) => void;
  width: number;
  height: number;
}

// The two density histograms overlaid on one axis, each on its own bins.
function Bars({ geneBins, controlBins, gene, hidden, highlighted, onHighlight, width, height }: BarsProps) {
  const tooltipRef = useRef<PlotTooltipHandle<HoveredBar>>(null);
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const series = { controls: controlBins, gene: geneBins };
  const all = [...controlBins, ...geneBins];
  // The x axis spans both series whichever are shown, so it holds still as they are toggled. The y
  // axis fits those shown, so hiding the gene's tall bars brings the controls up to full height.
  const shown = SERIES.filter(({ key }) => !hidden.has(key));
  const shownBins = shown.flatMap(({ key }) => series[key]);
  const low = Math.min(...all.map((bin) => bin.x0));
  const high = Math.max(...all.map((bin) => bin.x1));
  const peak = Math.max(...(shownBins.length > 0 ? shownBins : all).map((bin) => bin.density));
  const x = Scale.scaleLinear({ domain: [low, high], range: [0, innerWidth] });
  const y = Scale.scaleLinear({ domain: [0, peak], range: [innerHeight, 0], nice: true });
  const names = { controls: 'Non-targeting controls', gene };

  return (
    <>
      <svg width={width} height={height} role="img" aria-label={`Histogram of ${gene}'s relative death rate`}>
        <Group.Group left={MARGIN.left} top={MARGIN.top}>
          {shown.map(({ key, color, opacity }) =>
            series[key].map((bin) => (
              <rect
                key={`${key}-${bin.x0}`}
                x={x(bin.x0)}
                y={y(bin.density)}
                width={Math.max(x(bin.x1) - x(bin.x0) - 1, 0.5)}
                height={innerHeight - y(bin.density)}
                fill={color}
                opacity={highlighted && highlighted !== key ? FADED_OPACITY : opacity}
                onMouseEnter={() => onHighlight(key)}
                onMouseMove={(event) => tooltipRef.current?.show({ ...bin, series: names[key] }, event)}
                onMouseLeave={() => {
                  onHighlight(null);
                  tooltipRef.current?.hide();
                }}
              />
            )),
          )}
          <Axis.AxisBottom
            scale={x}
            top={innerHeight}
            numTicks={Math.max(2, Math.floor(innerWidth / 70))}
            label="Relative death rate (z-scored)"
            labelOffset={16}
            labelProps={AXIS_LABEL_PROPS}
            tickLabelProps={{ ...TICK_LABEL_PROPS, textAnchor: 'middle' }}
          />
          <Axis.AxisLeft
            scale={y}
            numTicks={Math.max(2, Math.floor(innerHeight / 50))}
            label="Probability density"
            labelOffset={30}
            labelProps={AXIS_LABEL_PROPS}
            tickLabelProps={{ ...TICK_LABEL_PROPS, textAnchor: 'end', dx: -4, dy: 3 }}
          />
        </Group.Group>
      </svg>
      <PlotTooltip ref={tooltipRef}>
        {(bar) => (
          <div>
            <div>
              <strong>{bar.series}</strong>
            </div>
            <div>
              <strong>Bin: </strong>
              {bar.x0.toFixed(3)} to {bar.x1.toFixed(3)}
            </div>
            <div>
              <strong>Samples: </strong>
              {bar.count.toLocaleString()}
            </div>
            <div>
              <strong>Density: </strong>
              {bar.density.toFixed(3)}
            </div>
          </div>
        )}
      </PlotTooltip>
    </>
  );
}
