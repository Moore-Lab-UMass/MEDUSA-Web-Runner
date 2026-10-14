'use client';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { Step } from '@/types';

// What clicking each step does. A step without one, or the step already open, is not clickable.
export type StepLinks = Partial<Record<Step, () => void>>;

interface StepProgressProps {
  currentStep: Step;
  links?: StepLinks;
}

const STEPS: { label: string }[] = [
  { label: 'Upload Files' },
  { label: 'Set Parameters' },
  { label: 'Run Simulation' },
  { label: 'Results' },
];

// Horizontal stepper shown above the page content at every screen size.
export default function StepProgress({ currentStep, links = {} }: StepProgressProps) {
  return (
    <Box
      component="nav"
      aria-label="Simulator steps"
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'flex-start',
        py: { xs: 2, md: 3 },
        px: { xs: 2, sm: 3 },
        overflowX: 'auto',
      }}
    >
      {STEPS.map((step, i) => {
        const num = (i + 1) as Step;
        const isActive = num === currentStep;
        const isCompleted = num < currentStep;
        const isLast = i === STEPS.length - 1;
        const onClick = isActive ? undefined : links[num];

        const content = (
          <>
            <Box
              sx={{
                width: 25,
                height: 25,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: isActive || isCompleted ? 'primary.main' : '#e0e0e0',
              }}
            >
              {isCompleted ? (
                <CheckIcon sx={{ fontSize: { xs: 14, md: 16 }, color: '#fff' }} />
              ) : (
                <Typography
                  component="span"
                  sx={{ fontSize: { xs: 12, md: 13 }, fontWeight: 700, color: isActive ? '#fff' : '#888', lineHeight: 1 }}
                >
                  {num}
                </Typography>
              )}
            </Box>
            <Typography
              component="span"
              className="step-label"
              sx={{
                fontSize: { xs: 10.5, md: 13 },
                textAlign: 'center',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#111' : isCompleted ? 'primary.main' : '#999',
              }}
            >
              {step.label}
            </Typography>
          </>
        );
        const columnSx = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 56 };

        return (
          <Box
            key={step.label}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flex: isLast ? '0 0 auto' : '1 1 0',
              minWidth: isLast ? 0 : 64,
            }}
          >
            {onClick ? (
              <ButtonBase
                onClick={onClick}
                sx={{
                  ...columnSx,
                  borderRadius: 1,
                  '&:hover .step-label, &.Mui-focusVisible .step-label': { textDecoration: 'underline' },
                }}
              >
                {content}
              </ButtonBase>
            ) : (
              <Box aria-current={isActive ? 'step' : undefined} sx={columnSx}>
                {content}
              </Box>
            )}
            {!isLast && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  mt: '12px',
                  mx: 1,
                  minWidth: 16,
                  borderRadius: 1,
                  bgcolor: isCompleted ? 'primary.main' : '#e0e0e0',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
