'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import LogRow from './LogRow';
import { LOG_SEQUENCE, PROGRESS_STEPS } from './logSequence';

interface Props {
  onCancel: () => void;
  onViewResults: () => void;
}

export default function RunAnalysis({ onCancel, onViewResults }: Props) {
  const [seqIndex, setSeqIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (seqIndex >= LOG_SEQUENCE.length - 1) {
      setDone(true);
      return;
    }
    const delay = seqIndex === 0 ? 800 : seqIndex < 4 ? 1200 : 1800;
    const t = setTimeout(() => setSeqIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [seqIndex]);

  const progress = PROGRESS_STEPS[seqIndex];
  const logItems = LOG_SEQUENCE[seqIndex];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Running MEDUSA</Typography>
      <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
        Your analysis is in progress. This may take a few minutes.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Progress</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>{progress}%</Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Log</Typography>
            {logItems.map((item) => (
              <LogRow key={item.label} item={item} />
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5 }}>Run Details</Typography>
            {[
              { label: 'Job ID', value: 'MEDUSA_20240515_001' },
              { label: 'Started', value: 'May 15, 2024 10:24 AM' },
              { label: 'Mode', value: 'Fully parameterized' },
              { label: 'num_iter', value: '1000' },
              { label: 'bootstraps', value: '1000000' },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}
              >
                <Typography sx={{ fontSize: 13, color: '#666' }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{value}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" color="error" onClick={onCancel} disabled={done}>
          Cancel Run
        </Button>
        <Button
          variant="contained"
          onClick={onViewResults}
          disabled={!done}
        >
          View Results
        </Button>
      </Box>
    </Box>
  );
}
