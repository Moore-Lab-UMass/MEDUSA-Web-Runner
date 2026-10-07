'use client';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';

export default function Hero() {
  return (
    <Box
      component="section"
      sx={(theme) => ({
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        // Placeholder dot pattern until the scatterplot background image is ready
        backgroundImage: `radial-gradient(${alpha(theme.palette.secondary.main, 0.12)} 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px',
        px: 2,
        py: { xs: 10, md: 14 },
        textAlign: 'center',
      })}
    >
      <Typography component="h1" sx={{ fontSize: { xs: 36, md: 44 }, fontWeight: 700, letterSpacing: 0.5, mb: 2 }}>
        MEDUSA
      </Typography>
      <Typography sx={{ maxWidth: 560, mx: 'auto', fontSize: 16, lineHeight: 1.7, opacity: 0.7, mb: 4 }}>
        CRISPR screens reveal which genes affect drug response. MEDUSA reveals why: growth, death, or both.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Button
          component={NextLink}
          href="/simulator"
          variant="contained"
          color="secondary"
          disableElevation
        >
          Start Medusa Web Simulator
        </Button>
        <Button
          href="#"
          variant="outlined"
          color="secondary"
        >
          Read Documentation
        </Button>
      </Box>
    </Box>
  );
}
