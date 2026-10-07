'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import StepLayout from './StepLayout';
import RunAnalysis from './steps/RunAnalysis/RunAnalysis';
import Results from './steps/Results/Results';
import { useRun } from '@/common/hooks/useRun';
import { useRunResults } from '@/common/hooks/useRunResults';

export default function RunPage({ runId }: { runId: string }) {
  const router = useRouter();
  const { run, parameters, initialStatus, logs, error, connectionLost } = useRun(runId);
  const succeeded = run?.status === 'SUCCEEDED';
  // Loaded here rather than in Results so the parsed CSV survives switching back to the log.
  const results = useRunResults(runId, parameters, succeeded);
  const [view, setView] = useState<'run' | 'results' | null>(null);

  // Reopening a finished run lands on its results; a run watched to the end waits for "View Results".
  const showResults = succeeded && (view ?? (initialStatus === 'SUCCEEDED' ? 'results' : 'run')) === 'results';
  const handleNewAnalysis = () => router.push('/simulator');

  if (error) {
    return (
      <StepLayout step={3}>
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

  return (
    <StepLayout step={showResults ? 4 : 3}>
      {showResults ? (
        <Results
          runId={runId}
          parameters={parameters}
          results={results}
          onBack={() => setView('run')}
          onNewAnalysis={handleNewAnalysis}
        />
      ) : (
        <RunAnalysis
          runId={runId}
          run={run}
          parameters={parameters}
          logs={logs}
          connectionLost={connectionLost}
          onNewAnalysis={handleNewAnalysis}
          onViewResults={() => setView('results')}
        />
      )}
    </StepLayout>
  );
}
