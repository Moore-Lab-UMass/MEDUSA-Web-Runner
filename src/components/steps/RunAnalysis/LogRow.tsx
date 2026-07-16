import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircularProgress from '@mui/material/CircularProgress';
import { LogItem } from './logSequence';

export default function LogRow({ item }: { item: LogItem }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {item.status === 'completed' ? (
          <CheckCircleIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
        ) : item.status === 'in_progress' ? (
          <CircularProgress size={14} thickness={5} />
        ) : (
          <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: '#bbb' }} />
        )}
        <Typography sx={{ fontSize: 13, color: item.status === 'pending' ? '#aaa' : '#333' }}>
          {item.label}
        </Typography>
      </Box>
      {item.status !== 'pending' && (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color:
              item.status === 'completed'
                ? '#2e7d32'
                : item.status === 'in_progress'
                ? '#e65100'
                : '#999',
          }}
        >
          {item.status === 'completed' ? 'Completed' : 'In progress'}
        </Typography>
      )}
    </Box>
  );
}
