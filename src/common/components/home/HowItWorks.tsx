'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';

const CYCLE_MS = 5000;
const FADE_MS = 1200;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.';

// Set `image` to a path in /public once screenshots of each step are ready
const STEPS: { tab: string; title: string; body: string; image?: string }[] = [
  { tab: 'Step 1', title: 'Upload data', body: LOREM },
  { tab: 'Step 2', title: 'Set parameters', body: LOREM },
  { tab: 'Step 3', title: 'Run simulation', body: LOREM },
  { tab: 'Final Output', title: 'Results', body: LOREM },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = STEPS[active];

  // Restarts whenever the step changes, so clicking a tab gives it a full cycle
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % STEPS.length), CYCLE_MS);
    return () => clearTimeout(timer);
  }, [active, paused]);

  return (
    <Box
      component="section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{ bgcolor: 'grey.100', py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography component="h2" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, mb: 4 }}>
          How it works
        </Typography>

        <Tabs
          value={active}
          onChange={(_, value: number) => setActive(value)}
          variant="fullWidth"
          sx={{ mb: 3, '& .MuiTab-root': { fontSize: 13 } }}
        >
          {STEPS.map((s) => (
            <Tab key={s.tab} label={s.tab} />
          ))}
        </Tabs>

        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Fade key={active} in timeout={FADE_MS}>
              <div>
                <Typography component="h3" sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>{step.body}</Typography>
              </div>
            </Fade>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={2} sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden' }}>
              {/* All steps are stacked so the outgoing image fades out while the next fades in */}
              {STEPS.map((s, i) => (
                <Box
                  key={s.tab}
                  aria-hidden={i !== active}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.disabled',
                    fontSize: 14,
                    opacity: i === active ? 1 : 0,
                    transition: `opacity ${FADE_MS}ms ease-in-out`,
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  }}
                >
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={`${s.title} screenshot`}
                      fill
                      sizes="(min-width: 1200px) 752px, (min-width: 900px) 66vw, 100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    `${s.title} screenshot`
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
