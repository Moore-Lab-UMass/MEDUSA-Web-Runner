'use client';
import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { TwoPaneLayout, TwoPanePlotConfig } from '@weng-lab/ui-components';
import { DeathSamplesState } from '@/common/hooks/useDeathSamples';
import { RunResultsState } from '@/common/hooks/useRunResults';
import { PhaseSurface } from '@/common/phaseSurface';
import { RunResults, SIGNIFICANCE_FDR, TOP_HITS, topHits } from '@/common/results';
import { RunParameters } from '@/types';
import TableTabs, { GeneTab } from './TableTabs';
import { GeneRow } from './GeneTable';
import PhaseDiagram from './Plots/PhaseDiagram/PhaseDiagram';
import DeathHistogram from './Plots/DeathHistogram/DeathHistogram';
import OutputFilesDialog from './OutputFilesDialog';
import { fullColumns, GM_COLUMNS } from './columns';

interface Props {
  runId: string;
  parameters: RunParameters | null;
  results: RunResultsState;
  // The simulation behind a fully parameterized run. Null for a GM run.
  surface: PhaseSurface | null;
  // Every matching simulation's death rates, for a GM run's histograms.
  samples: DeathSamplesState;
  onBack: () => void;
  onNewAnalysis: () => void;
}

const MODE_LABELS = { full: 'Fully parameterized model (FP)', gm: 'General model (GM)' };

// Below md the grey results card doesn't grow to fill the page (see Results' own sx below), so the
// panes fall back to a fixed height here instead of filling it.
const FALLBACK_PANE_HEIGHT = '650px';

// The top hits' tabs, less what they list, shared by both modes.
const PRO_DEATH = {
  label: 'Pro-Death',
  title: `Top ${TOP_HITS} Pro-Death Genes`,
  description: `Top ${TOP_HITS} pro-death genes`,
};
const ANTI_DEATH = {
  label: 'Anti-Death',
  title: `Top ${TOP_HITS} Anti-Death Genes`,
  description: `Top ${TOP_HITS} anti-death genes`,
};

interface LayoutProps {
  results: RunResults;
  table: React.ReactNode;
  plots: TwoPanePlotConfig[];
}

// The table and the plots side by side, under a note of any rows the summary had to leave out.
function ResultsLayout({ results, table, plots }: LayoutProps) {
  return (
    <>
      {results.excluded > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {results.excluded.toLocaleString()} {results.excluded === 1 ? 'row was' : 'rows were'} left out of{' '}
          {results.filename} for missing or non-positive rates.
        </Alert>
      )}
      {/* The table and the plots side by side, with a draggable divider between them. They stack,
          table first, where the row is too narrow to give the plot room. */}
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: { md: '1 1 0px' },
          minHeight: { md: 0 },
        }}
      >
        {/* TwoPaneLayout's own pane boxes take a plain CSS height, which can't see past its own
            grid wrapper's auto height to this box's flex-resolved one. Container query units route
            around that: `md+` makes this box a sized query container (via the flex-grow above) and
            `100cqh` reads its height directly, however many un-sized boxes sit in between. Below md
            the grey card above doesn't grow either, so this box keeps a fixed height instead. */}
        <Box
          sx={{
            flex: { md: '1 1 0px' },
            minHeight: { md: 0 },
            height: { xs: FALLBACK_PANE_HEIGHT, md: 'auto' },
            containerType: 'size',
          }}
        >
          <TwoPaneLayout
            TableComponent={table}
            plots={plots}
            direction={{ xs: 'column', lg: 'row' }}
            rowHeight="100cqh"
            columnHeight="100cqh"
            // The plot tabs have no icons, so their labels have to stay up when the panes stack.
            showTabLabels
          />
        </Box>
      </Paper>
    </>
  );
}

// Control groups are not genes, so they stay out of the count, though the table still lists them.
function totalTab(rows: GeneRow[]): GeneTab {
  return {
    label: 'Total Genes',
    title: 'All Genes',
    description: 'Every gene in the run, not counting controls. The table lists the controls too.',
    count: rows.filter((row) => !row.control).length.toLocaleString(),
    genes: rows,
  };
}

interface FullBodyProps {
  results: Extract<RunResults, { mode: 'full' }>;
  parameters: RunParameters | null;
  surface: PhaseSurface | null;
}

function FullResultsBody({ results, parameters, surface }: FullBodyProps) {
  const { proDeath, antiDeath } = topHits(results.rows);
  const significant = results.rows.filter(
    (row) => !row.control && row.deathFdr !== null && row.deathFdr < SIGNIFICANCE_FDR,
  );
  const table = (
    <TableTabs
      columns={fullColumns(results.hasStats)}
      tabs={[
        { ...PRO_DEATH, count: String(proDeath.length), genes: proDeath },
        { ...ANTI_DEATH, count: String(antiDeath.length), genes: antiDeath },
        // Runs from before stats were always on have no FDR to count by, and so nothing to list.
        {
          label: 'Significant',
          title: `Significant Genes (death FDR < ${SIGNIFICANCE_FDR})`,
          description: results.hasStats
            ? `Genes with a death FDR below ${SIGNIFICANCE_FDR}`
            : `Genes with a death FDR below ${SIGNIFICANCE_FDR}. This run has no stats to take an FDR from.`,
          count: results.hasStats ? significant.length.toLocaleString() : '—',
          genes: results.hasStats ? significant : undefined,
        },
        totalTab(results.rows),
      ]}
    />
  );
  const plots = [
    {
      tabTitle: 'Phase Diagram',
      plotComponent: (
        <PhaseDiagram
          genes={results.rows}
          proDeath={proDeath}
          antiDeath={antiDeath}
          geneList={parameters?.gene_list}
          surface={surface}
        />
      ),
    },
  ];
  return <ResultsLayout results={results} table={table} plots={plots} />;
}

interface GmBodyProps {
  results: Extract<RunResults, { mode: 'gm' }>;
  parameters: RunParameters | null;
  samples: DeathSamplesState;
}

function GmResultsBody({ results, parameters, samples }: GmBodyProps) {
  const { proDeath, antiDeath } = topHits(results.rows);
  const regulators = results.rows.filter(
    (row) => !row.control && row.deathPredict.toLowerCase().includes('regulator'),
  );

  // One gene is always selected, and its histogram shown. Until the reader picks one, that is the
  // run's first gene_list gene, or failing that its top pro-death hit, as MEDUSA's own plots start.
  const [picked, setPicked] = useState<string | null>(null);
  const geneList = parameters?.gene_list;
  // gene_list is matched case-insensitively, as MEDUSA matches it.
  const firstListed = useMemo(() => {
    if (!geneList) return undefined;
    const byName = new Map(results.rows.map((row) => [row.gene.toLowerCase(), row]));
    return geneList.map((gene) => byName.get(gene.toLowerCase())).find((row) => row !== undefined);
  }, [geneList, results.rows]);
  const selected =
    results.rows.find((row) => row.gene === picked) ?? firstListed ?? proDeath[0] ?? results.rows[0] ?? null;

  const table = (
    <TableTabs
      columns={GM_COLUMNS}
      selection={selected ? { gene: selected.gene, onSelect: setPicked } : undefined}
      tabs={[
        { ...PRO_DEATH, count: String(proDeath.length), genes: proDeath },
        { ...ANTI_DEATH, count: String(antiDeath.length), genes: antiDeath },
        {
          label: 'Regulators',
          title: 'Death-Rate Regulators',
          description: 'Genes predicted to regulate the death rate',
          count: regulators.length.toLocaleString(),
          genes: regulators,
        },
        totalTab(results.rows),
      ]}
    />
  );
  const plots = [
    { tabTitle: 'Histogram', plotComponent: <DeathHistogram gene={selected} samples={samples} /> },
  ];
  return <ResultsLayout results={results} table={table} plots={plots} />;
}

export default function Results({ runId, parameters, results, surface, samples, onBack, onNewAnalysis }: Props) {
  const [filesOpen, setFilesOpen] = useState(false);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: { md: 1 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: '#f5f6f7',
          borderColor: '#e5e7ea',
          display: 'flex',
          flexDirection: 'column',
          flex: { md: 1 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          {/* Title and run on one line, the run wrapping under the title where it doesn't fit. */}
          <Box sx={{ minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 1.5 }}>
            <Typography variant="h5">Results overview</Typography>
            <Typography sx={{ fontSize: 13, color: '#888', overflowWrap: 'anywhere' }}>
              Run {runId}
              {results.status === 'ready' && ` · ${MODE_LABELS[results.mode]}`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
            onClick={() => setFilesOpen(true)}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, flexShrink: 0 }}
          >
            Download Output Files
          </Button>
        </Box>

        {results.status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 240 }}>
            <CircularProgress />
          </Box>
        )}
        {results.status === 'error' && (
          <Alert severity="error">
            {results.message} The output files may still be available under Download Output Files.
          </Alert>
        )}
        {results.status === 'ready' && !results.results && (
          <Alert severity="info">
            This run wrote no summary table, as general model (GM) runs from before stats were always on did not. Its
            output files are under Download Output Files.
          </Alert>
        )}
        {results.status === 'ready' && results.results?.mode === 'full' && (
          <FullResultsBody results={results.results} parameters={parameters} surface={surface} />
        )}
        {results.status === 'ready' && results.results?.mode === 'gm' && (
          <GmResultsBody results={results.results} parameters={parameters} samples={samples} />
        )}
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2}}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
          onClick={onNewAnalysis}
        >
          Start over
        </Button>
      </Box>

      <OutputFilesDialog runId={runId} open={filesOpen} onClose={() => setFilesOpen(false)} />
    </Box>
  );
}
