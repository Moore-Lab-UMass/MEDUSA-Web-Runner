'use client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function SignalChart() {
  const theme = useTheme();
  const conflated = theme.palette.grey[500];
  const growth = theme.palette.success.main;
  const death = theme.palette.error.main;

  const legend = [
    { label: 'conflated signal', color: conflated },
    { label: 'growth effect', color: growth },
    { label: 'death effect', color: death },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, fontFamily: 'monospace' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'text.disabled', mb: 1 }}>
        <span>sgRNA log2 fold change</span>
        <span>t = T_end</span>
      </Box>
      <svg viewBox="0 0 240 110" width="100%" role="img" aria-label="A conflated signal splitting into growth and death effects">
        <defs>
          <linearGradient id="to-growth" x1="40" x2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={conflated} />
            <stop offset="1" stopColor={growth} />
          </linearGradient>
          <linearGradient id="to-death" x1="40" x2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={conflated} />
            <stop offset="1" stopColor={death} />
          </linearGradient>
        </defs>
        <path
          d="M5 45 C20 45 30 65 45 65 C62 65 72 22 105 20 L230 20"
          fill="none"
          stroke="url(#to-growth)"
          strokeWidth="1.5"
        />
        <path
          d="M5 65 C20 65 30 45 45 45 C62 45 75 90 110 90 L230 90"
          fill="none"
          stroke="url(#to-death)"
          strokeWidth="1.5"
        />
      </svg>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, fontSize: 10, color: 'text.secondary' }}>
        {legend.map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 7, height: 7, bgcolor: item.color }} />
            {item.label}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default function WhatIsMedusa() {
  return (
    <Box component="section" sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography component="h2" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, lineHeight: 1.3, mb: 1.5 }}>
              [Problem its trying to solve] or [What is Medusa?]
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6, mb: 2 }}>
              MEDUSA untangles CRISPR screen data to reveal whether a gene slows cell growth, drives cell death, or
              both, turning one conflated signal into clear, mechanistic insight.
            </Typography>
            <Link
              href="#"
              underline="hover"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 13, color: 'primary.main' }}
            >
              Read more <ChevronRightIcon sx={{ fontSize: 16 }} />
            </Link>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SignalChart />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
