import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

export default function RunProgress({ progress, message }: { progress: number; message: string | null }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Run Progress</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>{progress}%</Typography>
      </Box>
      {/* Progress is reported per stage, so the bar jumps rather than tracking time remaining */}
      <Typography sx={{ fontSize: 12, color: '#888', mt: 0.75, minHeight: 18 }}>
        {message}
      </Typography>
    </Box>
  );
}
