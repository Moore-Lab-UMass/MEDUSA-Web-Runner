import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

export default function JobHeader({
  jobName,
  running,
  onCancel,
}: {
  jobName: string;
  running: boolean;
  onCancel: () => void;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{jobName}</Typography>
          {running && (
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
              <CircularProgress size={12} thickness={6} />
              <Typography sx={{ fontSize: 12, color: '#555' }}>Running</Typography>
            </Box>
          )}
        </Box>
        <Tooltip title="Cancel run">
          <IconButton onClick={onCancel} size="medium" sx={{ backgroundColor: '#efe9e9' }}>
            <Box sx={{ width: 10, height: 10, bgcolor: 'error.main', borderRadius: 0.5 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography sx={{ fontSize: 12, color: '#888', mt: 0.5 }}>Do not close this window</Typography>
    </Box>
  );
}
