import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { RunStatus } from '@/types';

const STATUS_LABELS: Record<RunStatus, string> = {
  CREATED: 'Waiting for upload',
  QUEUED: 'Queued',
  RUNNING: 'Running',
  SUCCEEDED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export default function JobHeader({ status }: { status: RunStatus | null }) {
  const active = status === null || status === 'QUEUED' || status === 'RUNNING';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>MEDUSA run</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            border: '1px solid #d8dbe0',
            borderRadius: 10,
            px: 1.25,
            py: 0.25,
          }}
        >
          {active && <CircularProgress size={12} thickness={6} />}
          <Typography sx={{ fontSize: 12, color: '#555' }}>{status ? STATUS_LABELS[status] : 'Loading'}</Typography>
        </Box>
      </Box>
      {active && (
        <Typography sx={{ fontSize: 12, color: '#888', mt: 0.5 }}>
          The run continues if you close this window. Reopen this page&apos;s link to check on it.
        </Typography>
      )}
    </Box>
  );
}
