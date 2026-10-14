import Box from '@mui/material/Box';
import StepProgress, { StepLinks } from './StepProgress';
import { Step } from '@/types';

// Page frame shared by the wizard (/simulator) and the run page (/runs/[runId]).
export default function StepLayout({
  step,
  links,
  children,
}: {
  step: Step;
  // The steps the reader can jump to from here, by clicking them in the stepper.
  links?: StepLinks;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#fff', px: { xs: 2, sm: 3, md: 4, lg: 8, xl: 14 } }}>
      <StepProgress currentStep={step} links={links} />
      <Box sx={{ flex: 1, minWidth: 0, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}
