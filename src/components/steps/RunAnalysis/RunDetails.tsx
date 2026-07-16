import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function RunDetails({
  runId,
  numIter,
  bootstraps,
  dateCreated,
}: {
  runId: string;
  numIter: string;
  bootstraps: string;
  dateCreated: string;
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
        <Tooltip title="Metadata about this simulation run">
          <InfoOutlinedIcon sx={{ fontSize: 16, color: '#999' }} />
        </Tooltip>
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
      </Box>
      <Button
        size="small"
        sx={{ mt: 0.75, fontSize: 12, color: '#1565c0', p: 0, minWidth: 0, textTransform: 'none' }}
      >
        See more details
      </Button>
    </Box>
  );
}
