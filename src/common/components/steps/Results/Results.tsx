'use client';
import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { RunResultsState } from '@/common/hooks/useRunResults';
import { RunResults, SIGNIFICANCE_FDR, topHits } from '@/common/results';
import { RunParameters } from '@/types';
import StatCards, { StatCard } from './StatCards';
import TableTabs from './TableTabs';
import PhaseDiagram from './PhaseDiagram';
import PlotTabs, { PlotTab } from './PlotTabs';
import OutputFilesDialog from './OutputFilesDialog';
import { fullColumns, GM_COLUMNS } from './columns';

interface Props {
  runId: string;
  parameters: RunParameters | null;
  results: RunResultsState;
  onBack: () => void;
  onNewAnalysis: () => void;
}

const MODE_LABELS = { full: 'Fully parameterized', gm: 'GM' };

// The plot card, tab bar included. The table card fits ten rows a page (see GeneTable).
const PLOT_HEIGHT = 650;
const TABLE_HEIGHT = 600;

// The gene table's tabs. Each stat card opens the tab that lists what it counts.
const PRO_DEATH = 'Pro-Death';
const ANTI_DEATH = 'Anti-Death';
const SIGNIFICANT = 'Significant';
const REGULATORS = 'Regulators';
const ALL_GENES = 'All Genes';

function ResultsBody({ results, parameters }: { results: RunResults; parameters: RunParameters | null }) {
  const [tab, setTab] = useState(PRO_DEATH);
  const tableRef = useRef<HTMLDivElement>(null);

  // The table sits below the plot, so a card that switches its tab also brings it into view.
  const openTab = (label: string) => {
    setTab(label);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Control groups are not genes, so they stay out of the counts.
  const total = {
    label: 'Total Genes',
    value: results.rows.filter((row) => !row.control).length.toLocaleString(),
    onClick: () => openTab(ALL_GENES),
  };

  // The two modes share a layout but not their columns, their third stat, or their plots.
  let cards: StatCard[];
  let table: React.ReactNode;
  let plots: PlotTab[];
  // Undefined leaves the plot card as tall as its content.
  let plotHeight: number | undefined;

  if (results.mode === 'full') {
    const { proDeath, antiDeath } = topHits(results.rows);
    const significant = results.rows.filter(
      (row) => !row.control && row.deathFdr !== null && row.deathFdr < SIGNIFICANCE_FDR,
    );
    cards = [
      { label: 'Top Hits (Pro-Death)', value: String(proDeath.length), onClick: () => openTab(PRO_DEATH) },
      { label: 'Top Hits (Anti-Death)', value: String(antiDeath.length), onClick: () => openTab(ANTI_DEATH) },
      // Without stats the run has no FDR to count by, and so no tab to open.
      {
        label: `Significant Genes (death FDR < ${SIGNIFICANCE_FDR})`,
        value: results.hasStats ? significant.length.toLocaleString() : '—',
        onClick: results.hasStats ? () => openTab(SIGNIFICANT) : undefined,
      },
      total,
    ];
    table = (
      <TableTabs
        columns={fullColumns(results.hasStats)}
        tabs={[
          { label: PRO_DEATH, genes: proDeath },
          { label: ANTI_DEATH, genes: antiDeath },
          ...(results.hasStats ? [{ label: SIGNIFICANT, genes: significant }] : []),
          { label: ALL_GENES, genes: results.rows },
        ]}
        value={tab}
        onChange={setTab}
      />
    );
    plots = [
      {
        label: 'Phase Diagram',
        plot: (
          <PhaseDiagram
            genes={results.rows}
            proDeath={proDeath}
            antiDeath={antiDeath}
            geneList={parameters?.gene_list}
          />
        ),
      },
    ];
    plotHeight = PLOT_HEIGHT;
  } else {
    const { proDeath, antiDeath } = topHits(results.rows);
    const regulators = results.rows.filter(
      (row) => !row.control && row.deathPredict.toLowerCase().includes('regulator'),
    );
    cards = [
      { label: 'Top Hits (Pro-Death)', value: String(proDeath.length), onClick: () => openTab(PRO_DEATH) },
      { label: 'Top Hits (Anti-Death)', value: String(antiDeath.length), onClick: () => openTab(ANTI_DEATH) },
      {
        label: 'Death-Rate Regulators',
        value: regulators.length.toLocaleString(),
        onClick: () => openTab(REGULATORS),
      },
      total,
    ];
    table = (
      <TableTabs
        columns={GM_COLUMNS}
        tabs={[
          { label: PRO_DEATH, genes: proDeath },
          { label: ANTI_DEATH, genes: antiDeath },
          { label: REGULATORS, genes: regulators },
          { label: ALL_GENES, genes: results.rows },
        ]}
        value={tab}
        onChange={setTab}
      />
    );
    plots = [
      {
        label: 'Histograms',
        plot: (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography sx={{ fontSize: 13, color: '#888', textAlign: 'center', maxWidth: 360 }}>
              GM runs produce per-gene histograms rather than a phase diagram. Interactive histograms are
              not built yet; the worker&apos;s histogram images are under Download Output Files.
            </Typography>
          </Box>
        ),
      },
    ];
  }

  return (
    <>
      <StatCards cards={cards} />
      {results.excluded > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {results.excluded.toLocaleString()} {results.excluded === 1 ? 'row was' : 'rows were'} left out of{' '}
          {results.filename} for missing or non-positive rates.
        </Alert>
      )}
      {/* The plots first and the table under them, each at full width. The page scrolls to fit them. */}
      <Paper sx={{ p: 2, mb: 2, height: plotHeight }}>
        <PlotTabs tabs={plots} />
      </Paper>
      <Paper ref={tableRef} sx={{ p: 2, height: TABLE_HEIGHT }}>
        {table}
      </Paper>
    </>
  );
}

export default function Results({ runId, parameters, results, onBack, onNewAnalysis }: Props) {
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
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Results overview</Typography>
            <Typography sx={{ fontSize: 13, color: '#888', overflowWrap: 'anywhere' }}>
              Run {runId}
              {results.status === 'ready' && ` · ${MODE_LABELS[results.mode]} mode`}
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
            This run wrote no summary table (GM mode without stats). Its output files are under Download
            Output Files.
          </Alert>
        )}
        {results.status === 'ready' && results.results && (
          <ResultsBody results={results.results} parameters={parameters} />
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
