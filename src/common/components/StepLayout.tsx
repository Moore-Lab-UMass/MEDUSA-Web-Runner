import Box from '@mui/material/Box';
import StepProgress from './StepProgress';
import { Step } from '@/types';

// Page frame shared by the wizard (/simulator) and the run page (/runs/[runId]).
export default function StepLayout({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#fff', px: { xs: 2, sm: 3, md: 4, lg: 8, xl: 14 } }}>
      <StepProgress currentStep={step} />
      <Box sx={{ flex: 1, minWidth: 0, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}
