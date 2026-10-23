import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// How long a run, its log and its output files are kept after it is created.
export const RETENTION_HOURS = 48;

export default function RunDetails({
  runId,
  numIter,
  bootstraps,
  dateCreated,
  savedUntil,
}: {
  runId: string;
  numIter: string;
  bootstraps: string;
  dateCreated: string;
  // When the run is deleted, RETENTION_HOURS after it was created. Null until the run has loaded.
  savedUntil: string | null;
}) {
  const fields = [
    { label: 'Run ID', value: runId },
    { label: 'num_iter', value: numIter },
    { label: 'bootstraps', value: bootstraps },
    { label: 'Date Created', value: dateCreated },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Run Details</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          bgcolor: '#fff',
          border: '1px solid #e5e7ea',
          borderRadius: 1.5,
          px: 2.5,
          py: 1.5,
        }}
      >
        {fields.map(({ label, value }) => (
          <Typography key={label} sx={{ fontSize: 12.5, color: '#666' }}>
            {label}:{' '}
            <Typography component="span" sx={{ fontSize: 12.5, color: '#222', fontWeight: 500 }}>
              {value}
            </Typography>
          </Typography>
        ))}
        <Typography sx={{ fontSize: 12.5, color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InfoOutlinedIcon sx={{ fontSize: 14 }} />
          Saved for {RETENTION_HOURS} hours{savedUntil && `, until ${savedUntil}`}
        </Typography>
      </Box>
    </Box>
  );
}
