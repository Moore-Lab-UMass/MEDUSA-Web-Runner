'use client';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { TwoPaneLayout } from '@weng-lab/ui-components';
import { RunResultsState } from '@/common/hooks/useRunResults';
import { RunResults, SIGNIFICANCE_FDR, topHits } from '@/common/results';
import { RunParameters } from '@/types';
import StatCards, { StatCard } from './StatCards';
import TableTabs from './TableTabs';
import PhaseDiagram from './PhaseDiagram';
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

function ResultsBody({ results, parameters }: { results: RunResults; parameters: RunParameters | null }) {
  // Control groups are not genes, so they stay out of the counts.
  const total = { label: 'Total Genes', value: results.rows.filter((row) => !row.control).length.toLocaleString() };

  // The two modes share a layout but not their columns, their third stat, or a plot.
  let cards: StatCard[];
  let table: React.ReactNode;
  let plot: React.ReactNode;

  if (results.mode === 'full') {
    const { proDeath, antiDeath } = topHits(results.rows);
    const significant = results.rows.filter(
      (row) => !row.control && row.deathFdr !== null && row.deathFdr < SIGNIFICANCE_FDR,
    );
    cards = [
      { label: 'Top Hits (Pro-Death)', value: String(proDeath.length) },
      { label: 'Top Hits (Anti-Death)', value: String(antiDeath.length) },
      // Without stats the run has no FDR to count by.
      {
        label: `Significant Genes (death FDR < ${SIGNIFICANCE_FDR})`,
        value: results.hasStats ? significant.length.toLocaleString() : '—',
      },
      total,
    ];
    table = (
      <TableTabs
        columns={fullColumns(results.hasStats)}
        tabs={[
          { label: 'Pro-Death', genes: proDeath },
          { label: 'Anti-Death', genes: antiDeath },
          { label: 'All Genes', genes: results.rows },
        ]}
      />
    );
    plot = (
      <PhaseDiagram
        genes={results.rows}
        proDeath={proDeath}
        antiDeath={antiDeath}
        geneList={parameters?.gene_list}
      />
    );
  } else {
    const { proDeath, antiDeath } = topHits(results.rows);
    const regulators = results.rows.filter(
      (row) => !row.control && row.deathPredict.toLowerCase().includes('regulator'),
    );
    cards = [
      { label: 'Top Hits (Pro-Death)', value: String(proDeath.length) },
      { label: 'Top Hits (Anti-Death)', value: String(antiDeath.length) },
      { label: 'Death-Rate Regulators', value: regulators.length.toLocaleString() },
      total,
    ];
    table = (
      <TableTabs
        columns={GM_COLUMNS}
        tabs={[
          { label: 'Pro-Death', genes: proDeath },
          { label: 'Anti-Death', genes: antiDeath },
          { label: 'All Genes', genes: results.rows },
        ]}
      />
    );
    plot = (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography sx={{ fontSize: 13, color: '#888', textAlign: 'center', maxWidth: 360 }}>
          GM runs produce per-gene histograms rather than a phase diagram. Interactive histograms are
          not built yet; the worker&apos;s histogram images are under Download Output Files.
        </Typography>
      </Box>
    );
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
      {/* On md+ this card takes whatever height is left and the panes size to it (100cqh) */}
      <Paper sx={{ p: 1, flex: { md: '1 1 0px' }, minHeight: { md: 336 }, containerType: { md: 'size' } }}>
        <TwoPaneLayout
          direction={{ xs: 'column', md: 'row' }}
          rowHeight="100cqh"
          TableComponent={table}
          plots={[
            {
              tabTitle: 'Visualization',
              plotComponent: plot,
            },
          ]}
        />
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
