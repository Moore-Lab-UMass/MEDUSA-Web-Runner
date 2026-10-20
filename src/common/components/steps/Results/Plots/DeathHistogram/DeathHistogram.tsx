'use client';
import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { ChipLegend, Histogram, HistogramBin, HistogramSeries } from '@weng-lab/visualization';
import { DeathSamplesState } from '@/common/hooks/useDeathSamples';
import { GmGeneRow } from '@/common/results';
import PlotFrame from '../PlotFrame';
import { PLOT_COLORS } from '../plotColors';

// Histogram keeps 120px of the height and 110px of the width for its axes and title.
const PLOT_MARGIN = 120;

// Drawn in this order, so the gene sits over the controls, as in MEDUSA's plots. Colored as the
// phase diagram colors a picked-out gene and the controls.
const SERIES = [
  { key: 'controls', color: PLOT_COLORS.control, opacity: 0.6 },
  { key: 'gene', color: PLOT_COLORS.highlight, opacity: 0.75 },
] as const;
type SeriesKey = (typeof SERIES)[number]['key'];

// How faint the other series goes while one is highlighted from the legend.
const FADED_OPACITY = 0.15;

// A hovered bar: in the overlay layout, its bin's series holds just the bar's own series.
function BarTooltip({ bin }: { bin: HistogramBin }) {
  const [series] = bin.series;
  return (
    <div style={{ fontSize: 12 }}>
      <div>
        <strong>{series?.label}</strong>
      </div>
      <div>
        <strong>Bin: </strong>
        {bin.x0.toFixed(3)} to {bin.x1.toFixed(3)}
      </div>
      <div>
        <strong>Samples: </strong>
        {(series?.count ?? bin.count).toLocaleString()}
      </div>
      {series?.value !== undefined && (
        <div>
          <strong>Density: </strong>
          {series.value.toFixed(3)}
        </div>
      )}
    </div>
  );
}

interface Props {
  gene: GmGeneRow | null;
  samples: DeathSamplesState;
}

// A GM gene's z-scored relative death rate across the run's matching simulations, over the
// non-targeting controls' pooled, as MEDUSA's own histograms draw it (medusa/plot_gm_hist.py,
// ax.hist(values, density=True)): each series a density histogram of 10 numpy-style bins over its
// own range, the gene drawn over the controls.
export default function DeathHistogram({ gene, samples }: Props) {
  const ready = samples.status === 'ready' ? samples.samples : null;
  const geneSamples = gene && ready ? ready.byGene.get(gene.gene) : undefined;
  // The legend's state: series switched off, and the one under the cursor in the legend.
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [highlighted, setHighlighted] = useState<SeriesKey | null>(null);
  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  // The series shown, in drawing order. The highlighted one stays as it is and the other fades.
  const data = useMemo((): HistogramSeries[] => {
    if (!gene || !geneSamples || !ready) return [];
    const values = { controls: ready.controls, gene: geneSamples };
    const labels = { controls: 'Non-targeting controls', gene: gene.gene };
    const shown: HistogramSeries[] = [];
    for (const { key, color, opacity } of SERIES) {
      if (hidden.has(key)) continue;
      shown.push({
        values: values[key],
        label: labels[key],
        color,
        opacity: highlighted && highlighted !== key ? FADED_OPACITY : opacity,
      });
    }
    return shown;
  }, [gene, geneSamples, ready, hidden, highlighted]);

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
                tooltip: 'Every non-targeting group, pooled across the simulations',
              },
            ]}
            hidden={hidden}
            onToggle={toggle}
            highlighted={highlighted}
            onHover={(value) => setHighlighted(value as SeriesKey | null)}
          />
        </Box>
      </Box>

      {geneSamples && geneSamples.length > 0 ? (
        <PlotFrame margin={PLOT_MARGIN}>
          {({ width, height }) => (
            <Histogram
              // The bars only animate in as they mount, so a new gene mounts a new plot to replay it.
              key={gene.gene}
              width={width}
              height={height}
              data={data}
              normalize="density"
              binning="perSeries"
              binEdges="equalWidth"
              thresholds={10}
              // The ChipLegend above stands in for the plot's own, and toggles the series too.
              showLegend={false}
              xLabel="Relative death rate (z-scored)"
              yLabel="Probability density"
              tooltipBody={(bin) => <BarTooltip bin={bin} />}
              downloadFileName={`${gene.gene}_hist`}
              animationType="slideUp"
            />
          )}
        </PlotFrame>
      ) : (
        <Typography sx={{ fontSize: 13, color: '#888', m: 'auto', textAlign: 'center' }}>
          {gene.gene} has no finite death rates to plot.
        </Typography>
      )}

      <Typography sx={{ fontSize: 12, color: '#888' }}>
        {ready && ready.dropped > 0 &&
          ` ${ready.dropped.toLocaleString()} ${ready.dropped === 1 ? 'sample was' : 'samples were'} left out for an undefined z-score.`}
      </Typography>
    </Box>
  );
}
