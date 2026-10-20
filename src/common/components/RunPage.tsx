'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import StepLayout from './StepLayout';
import RunAnalysis from './steps/RunAnalysis/RunAnalysis';
import Results from './steps/Results/Results';
import { useRun } from '@/common/hooks/useRun';
import { isTerminal } from '@/common/medusaApi';
import { useRunResults } from '@/common/hooks/useRunResults';
import { useDeathSamples } from '@/common/hooks/useDeathSamples';
import { simulateSurface } from '@/common/phaseSurface';

export default function RunPage({ runId }: { runId: string }) {
  const router = useRouter();
  const { run, parameters, initialStatus, logs, error, connectionLost, abandoned } = useRun(runId);
  const succeeded = run?.status === 'SUCCEEDED';
  // Loaded here rather than in Results so the parsed CSV survives switching back to the log.
  const results = useRunResults(runId, parameters, succeeded);
  // A GM run's histograms, from a file that can be far larger than the summary, so loaded apart
  // from it: the table is up while these are still arriving.
  const samples = useDeathSamples(runId, parameters, succeeded);
  // The phase diagram's background needs only the parameters, so it is worked out as soon as they
  // arrive, while the run is still going, and is there when the genes are.
  const surface = useMemo(() => (parameters ? simulateSurface(parameters) : null), [parameters]);
  const [view, setView] = useState<'run' | 'results' | null>(null);

  // Reopening a finished run lands on its results; a run watched to the end waits for "View Results".
  const showResults = succeeded && (view ?? (initialStatus === 'SUCCEEDED' ? 'results' : 'run')) === 'results';
  const handleNewAnalysis = () => router.push('/simulator');

  if (error) {
    return (
      <StepLayout step={3} links={{ 1: handleNewAnalysis }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 5 }, bgcolor: '#f5f6f7', borderColor: '#e5e7ea' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Run not found</Typography>
          <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
            {error.message} Check the link, or start a new analysis.
          </Typography>
          <Box>
            <Button variant="contained" disableElevation onClick={handleNewAnalysis}>
              New analysis
            </Button>
          </Box>
        </Paper>
      </StepLayout>
    );
  }

  // The stepper switches between the log and the results, the latter once there are any. Upload
  // Files starts over, as there is no going back into the run this page is following.
  const links = {
    1: handleNewAnalysis,
    3: () => setView('run'),
    4: succeeded ? () => setView('results') : undefined,
  };

  return (
    <StepLayout step={showResults ? 4 : 3} links={links}>
      {showResults ? (
        <Results
          runId={runId}
          parameters={parameters}
          results={results}
          surface={surface}
          samples={samples}
          onBack={() => setView('run')}
          onNewAnalysis={handleNewAnalysis}
        />
      ) : (
        <RunAnalysis
          runId={runId}
          run={run}
          parameters={parameters}
          logs={logs}
          animateLog={initialStatus !== null && !isTerminal(initialStatus)}
          connectionLost={connectionLost}
          abandoned={abandoned}
          onNewAnalysis={handleNewAnalysis}
          onViewResults={() => setView('results')}
        />
      )}
    </StepLayout>
  );
}
