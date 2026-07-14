'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

const COLUMNS = [
  { heading: 'Lorem ipsum', items: ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum'] },
  { heading: 'Lorem ipsum', items: ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum'] },
  { heading: 'Lorem ipsum', items: ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum'] },
  { heading: 'Lorem ipsum', items: ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum'] },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'rgba(255,255,255,0.75)', mt: 'auto' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              borderRadius: 999,
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Logo
          </Box>
          <Typography sx={{ fontWeight: 800, letterSpacing: 1, color: '#fff', fontSize: 16 }}>
            MEDUSA
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {COLUMNS.map((col, i) => (
            <Grid key={i} size={{ xs: 6, sm: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#fff', mb: 1.5 }}>
                {col.heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {col.items.map((item, j) => (
                  <Link
                    key={j}
                    href="#"
                    underline="hover"
                    sx={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#fff' } }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: 4,
          py: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          Copyright © lorem ipsum
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link href="#" underline="hover" sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#fff' } }}>
            Privacy & Policy
          </Link>
          <Link href="#" underline="hover" sx={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#fff' } }}>
            Terms & Condition
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
