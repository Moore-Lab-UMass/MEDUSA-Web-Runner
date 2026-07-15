'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
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
    <Box sx={{ width: 210, flexShrink: 0, py: 3, alignSelf: 'stretch' }}>
      <Timeline sx={{ p: 0, m: 0 }}>
        {STEPS.map((step, i) => {
          const num = (i + 1) as Step;
          const isActive = num === currentStep;
          const isCompleted = num < currentStep;
          const isLast = i === STEPS.length - 1;

          return (
            <TimelineItem key={num} sx={{ minHeight: 56 }}>
              <TimelineOppositeContent sx={{ flex: 0, minWidth: 0, p: 0, m: 0 }} />
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    width: 25,
                    height: 25,
                    m: 0,
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isActive || isCompleted ? 'primary.main' : '#e0e0e0',
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isActive ? '#fff' : '#888',
                        lineHeight: 1,
                      }}
                    >
                      {num}
                    </Typography>
                  )}
                </TimelineDot>
                {!isLast && (
                  <TimelineConnector
                    sx={{
                      flexGrow: 0,
                      height: 12,
                      my: 1,
                      width: 2,
                      borderRadius: 1,
                      bgcolor: isCompleted ? 'primary.main' : '#e0e0e0',
                    }}
                  />
                )}
              </TimelineSeparator>
              <TimelineContent sx={{ py: .5, px: 2, display: 'flex', minHeight: 25 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#111' : isCompleted ? 'primary.main' : '#999',
                  }}
                >
                  {step.label}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
}
