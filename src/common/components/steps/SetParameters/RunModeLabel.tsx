import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { RunMode } from '@/types';

const MODES: Record<RunMode, { title: string; tooltip: string }> = {
  full: {
    title: 'Fully parameterized model (FP)',
    tooltip:
      'All four drug parameters marked * are set, so MEDUSA runs the fully parameterized model (FP). To run the general model (GM) instead, leave at least one of them blank and enter the effective dose.',
  },
  gm: {
    title: 'General model (GM)',
    tooltip:
      'At least one drug parameter marked * is blank, so MEDUSA runs the general model (GM), which yields a distribution of possible solutions for each gene. To run the fully parameterized model (FP), fill in all four.',
  },
};

function WontRunTooltip({ issues }: { issues: string[] }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12 }}>
        Fully parameterized model (FP) needs the required parameters and all four marked *. General model (GM) needs the
        required parameters and the effective dose. To fix:
      </Typography>
      <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
        {issues.map((issue) => (
          <Typography component="li" key={issue} sx={{ fontSize: 12 }}>{issue}</Typography>
        ))}
      </Box>
    </Box>
  );
}

// Which model the parameters as they stand will run, which MEDUSA decides from them, or that
// they can't run in either until `issues` are fixed. `mode` is null then.
export default function RunModeLabel({ mode, issues }: { mode: RunMode | null; issues: string[] }) {
  const title = mode ? MODES[mode].title : "Won't run";
  const tooltip = mode ? MODES[mode].tooltip : <WontRunTooltip issues={issues} />;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        border: '1px solid',
        borderColor: mode ? '#e0e0e0' : 'error.light',
        borderRadius: 1.5,
        px: 1.5,
        py: 0.75,
        bgcolor: '#fff',
      }}
    >
      {mode && <Typography sx={{ fontSize: 12.5, color: '#888' }}>Runs</Typography>}
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: mode ? 'primary.main' : 'error.main' }}>{title}</Typography>
      <Tooltip title={tooltip}>
        <InfoOutlinedIcon sx={{ fontSize: 18, color: '#999' }} />
      </Tooltip>
    </Box>
  );
}
