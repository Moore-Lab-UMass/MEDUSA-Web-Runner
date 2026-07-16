import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function PValueTab() {
  return (
    <Box sx={{ p: 2, textAlign: 'center', color: '#888' }}>
      <Typography sx={{ fontSize: 13 }}>P-Value distribution histogram would appear here.</Typography>
    </Box>
  );
}
