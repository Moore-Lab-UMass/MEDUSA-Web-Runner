'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import { Step } from '@/types';

interface SidebarProps {
  currentStep: Step;
}

const STEPS: { label: string; sub?: string }[] = [
  { label: 'Input & Parameters' },
  { label: 'Review' },
  { label: 'Run Analysis' },
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
        borderRight: '1px solid #e8eaed',
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
              px: 1.5,
              py: 1,
              mb: 0.5,
              borderRadius: 2,
              bgcolor: isActive ? '#1565c0' : 'transparent',
              cursor: 'default',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: isActive
                  ? 'rgba(255,255,255,0.25)'
                  : isCompleted
                  ? '#1565c0'
                  : '#e0e0e0',
              }}
            >
              {isCompleted ? (
                <CheckIcon sx={{ fontSize: 14, color: '#fff' }} />
              ) : (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isActive ? '#fff' : '#666',
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
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : isCompleted ? '#1565c0' : '#555',
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
