'use client';
import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { LogChunk, RunParameters, RunState } from '@/types';
import JobHeader from './JobHeader';
import RunDetails from './RunDetails';
import RunProgress from './RunProgress';
import LiveLog from './LiveLog';
import { logProgress } from './logProgress';

// What MEDUSA uses when a parameter was left out of the run.
const DEFAULT_NUM_ITER = 1000;
const DEFAULT_BOOTSTRAPS = 1000000;

interface Props {
  runId: string;
  run: RunState | null;
  parameters: RunParameters | null;
  logs: LogChunk[];
  // False when the page was opened on a run that had already ended, whose log is shown whole.
  animateLog: boolean;
  connectionLost: boolean;
  onNewAnalysis: () => void;
  onViewResults: () => void;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RunAnalysis({
  runId,
  run,
  parameters,
  logs,
  animateLog,
  connectionLost,
  onNewAnalysis,
  onViewResults,
}: Props) {
  // The log runs ahead of the API's coarse progress while the analysis is under way. Whichever is
  // further along wins, so the bar never moves backwards and a finished run still reads 100.
  const fromLog = useMemo(() => logProgress(logs), [logs]);
  const apiProgress = run?.progress ?? 0;
  const logAhead = fromLog !== null && fromLog.progress > apiProgress;

  // Only ever formatted in the browser: `run` is null until the client has fetched it, so the
  // server always renders the placeholder and the viewer's own locale and time zone are safe.
  const dateCreated = formatDate(run?.createdAt);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: { md: 1 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flex: { md: 1 } }}>
        <JobHeader status={run?.status ?? null} />
        {connectionLost && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Lost contact with the MEDUSA API. Retrying; the run itself is not affected.
          </Alert>
        )}
        {(run?.status === 'FAILED' || run?.status === 'CANCELLED') && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {run.error ?? 'The run did not complete.'}
          </Alert>
        )}
        <RunDetails
          runId={runId}
          numIter={parameters ? String(parameters.num_iter ?? DEFAULT_NUM_ITER) : '—'}
          bootstraps={parameters ? String(parameters.bootstraps ?? DEFAULT_BOOTSTRAPS) : '—'}
          dateCreated={dateCreated}
        />
        <RunProgress
          progress={logAhead ? fromLog.progress : apiProgress}
          message={logAhead ? fromLog.message : (run?.latestMessage ?? null)}
        />
        <LiveLog chunks={logs} animate={animateLog} />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />} onClick={onNewAnalysis}>
          New analysis
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onViewResults}
          disabled={run?.status !== 'SUCCEEDED'}
          disableElevation
          sx={{ px: 3 }}
        >
          View Results
        </Button>
      </Box>
    </Box>
  );
}
