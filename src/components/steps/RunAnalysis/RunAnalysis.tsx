'use client';
import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { FormValues } from '@/types';
import JobHeader from './JobHeader';
import RunDetails from './RunDetails';
import RunProgress from './RunProgress';
import LiveLog from './LiveLog';
import { LOG_LINES, PROGRESS_STEPS } from './logLines';

interface Props {
  formValues: FormValues;
  onCancel: () => void;
  onBack: () => void;
  onViewResults: () => void;
}

export default function RunAnalysis({ formValues, onCancel, onBack, onViewResults }: Props) {
  const [seqIndex, setSeqIndex] = useState(0);
  const done = seqIndex >= PROGRESS_STEPS.length - 1;

  useEffect(() => {
    if (done) return;
    const delay = seqIndex === 0 ? 800 : seqIndex < 4 ? 1200 : 1800;
    const t = setTimeout(() => setSeqIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [seqIndex, done]);

  const progress = PROGRESS_STEPS[seqIndex];
  const visibleLines = useMemo(
    () => LOG_LINES.filter((line) => line.revealAt <= seqIndex),
    [seqIndex],
  );

  const dateCreated = useMemo(
    () => new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    [],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 4 }}>
        <JobHeader jobName="[Job name]" running={!done} onCancel={onCancel} />
        <RunDetails
          runId="102k.9d0iol.902"
          numIter={formValues.num_iter}
          bootstraps={formValues.bootstraps}
          dateCreated={dateCreated}
        />
        <RunProgress progress={progress} />
        <LiveLog lines={visibleLines} />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onViewResults}
          disabled={!done}
          disableElevation
          sx={{ px: 3, textTransform: 'none' }}
        >
          View Results
        </Button>
      </Box>
    </Box>
  );
}
