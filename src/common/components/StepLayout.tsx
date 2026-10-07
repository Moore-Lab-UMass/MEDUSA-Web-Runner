import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import { Step } from '@/types';

// Page frame shared by the wizard (/simulator) and the run page (/runs/[runId]).
export default function StepLayout({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#fff', px: { xs: 2, sm: 3, md: 6, lg: 12, xl: 20 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: { md: 1 } }}>
        <Sidebar currentStep={step} />
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
