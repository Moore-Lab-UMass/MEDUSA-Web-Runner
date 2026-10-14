import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { POINT_KINDS } from './genePoints';

// The row under the plot: what each color of point is.
export default function PointLegend() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
      {POINT_KINDS.map(({ label, color }) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
          <Typography sx={{ fontSize: 12, color: '#666' }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
