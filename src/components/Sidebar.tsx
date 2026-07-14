'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { Step } from '@/types';

interface SidebarProps {
  currentStep: Step;
}

const STEPS: { label: string }[] = [
  { label: 'Upload Files' },
  { label: 'Set Parameters' },
  { label: 'Run Simulation' },
  { label: 'Results' },
];

export default function Sidebar({ currentStep }: SidebarProps) {
  return (
    <Box
      sx={{
        width: 210,
        flexShrink: 0,
        py: 3,
        px: 2,
        alignSelf: 'stretch',
      }}
    >
      {STEPS.map((step, i) => {
        const num = (i + 1) as Step;
        const isActive = num === currentStep;
        const isCompleted = num < currentStep;

        return (
          <Box
            key={num}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1,
              py: 1,
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: isActive || isCompleted ? 'primary.main' : '#e0e0e0',
              }}
            >
              {isCompleted ? (
                <CheckIcon sx={{ fontSize: 13, color: '#fff' }} />
              ) : (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isActive ? '#fff' : '#888',
                    lineHeight: 1,
                  }}
                >
                  {num}
                </Typography>
              )}
            </Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#111' : isCompleted ? 'primary.main' : '#999',
                lineHeight: 1.3,
              }}
            >
              {step.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
