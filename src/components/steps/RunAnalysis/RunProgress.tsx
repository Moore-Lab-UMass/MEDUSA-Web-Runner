import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function RunProgress({ progress }: { progress: number }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Run Progress</Typography>
        <Tooltip title="Overall completion of the current run">
          <InfoOutlinedIcon sx={{ fontSize: 16, color: '#999' }} />
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>{progress}%</Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: '#888', mt: 0.75 }}>
        Estimated time remaining : 00hr 00mins 00secs
      </Typography>
    </Box>
  );
}
