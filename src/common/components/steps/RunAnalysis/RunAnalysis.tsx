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
import RunDetails, { RETENTION_HOURS } from './RunDetails';
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
  // The run is still QUEUED or RUNNING long after its worker must have stopped.
  abandoned: boolean;
  onNewAnalysis: () => void;
  onViewResults: () => void;
}

// An ISO string or epoch milliseconds.
function formatDate(date: string | number | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// The log runs ahead of the API's coarse progress while the analysis is under way. Whichever is
// further along wins, so the bar never moves backwards and a finished run still reads 100.
function useRunProgress(run: RunState | null, logs: LogChunk[]) {
  const fromLog = useMemo(() => logProgress(logs), [logs]);
  const apiProgress = run?.progress ?? 0;
  if (fromLog !== null && fromLog.progress > apiProgress) return fromLog;
  return { progress: apiProgress, message: run?.latestMessage ?? null };
}

// A setting as the run used it: what it was given, or MEDUSA's default where it was left out.
function runSetting(parameters: RunParameters | null, value: number | undefined, fallback: number) {
  return parameters ? String(value ?? fallback) : '—';
}

function RunAlerts({ run, connectionLost, abandoned }: Pick<Props, 'run' | 'connectionLost' | 'abandoned'>) {
  const ended = run?.status === 'FAILED' || run?.status === 'CANCELLED';
  return (
    <>
      {connectionLost && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Lost contact with the MEDUSA API. Retrying; the run itself is not affected.
        </Alert>
      )}
      {abandoned && (
        <Alert severity="error" sx={{ mt: 2 }}>
          This run stopped without finishing. MEDUSA&apos;s worker has 30 minutes and 1 GiB of memory, and is
          stopped outright past either, before it can report the failure. General model (GM) runs with many matching
          simulations are the usual cause: start a new analysis with a narrower search.
        </Alert>
      )}
      {ended && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {run.error ?? 'The run did not complete.'}
        </Alert>
      )}
    </>
  );
}

export default function RunAnalysis({
  runId,
  run,
  parameters,
  logs,
  animateLog,
  connectionLost,
  abandoned,
  onNewAnalysis,
  onViewResults,
}: Props) {
  const { progress, message } = useRunProgress(run, logs);

  // Only ever formatted in the browser: `run` is null until the client has fetched it, so the
  // server always renders the placeholder and the viewer's own locale and time zone are safe.
  const dateCreated = formatDate(run?.createdAt);
  const savedUntil = run?.createdAt
    ? formatDate(Date.parse(run.createdAt) + RETENTION_HOURS * 3_600_000)
    : null;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: { md: 1 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', flex: { md: 1 } }}>
        <JobHeader status={run?.status ?? null} abandoned={abandoned} />
        <RunAlerts run={run} connectionLost={connectionLost} abandoned={abandoned} />
        <RunDetails
          runId={runId}
          numIter={runSetting(parameters, parameters?.num_iter, DEFAULT_NUM_ITER)}
          bootstraps={runSetting(parameters, parameters?.bootstraps, DEFAULT_BOOTSTRAPS)}
          dateCreated={dateCreated}
          savedUntil={savedUntil}
        />
        <RunProgress progress={progress} message={message} />
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
