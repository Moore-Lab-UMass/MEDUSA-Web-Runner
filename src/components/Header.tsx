'use client';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const NAV_LINKS = ['Simulation Tool', 'About', 'Help'];

export default function Header() {
  return (
    <AppBar position="sticky" elevation={0} color="primary" sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <Toolbar sx={{ minHeight: 56, px: 3, gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: 1, color: '#fff', lineHeight: 1, fontSize: 18 }}
          >
            MEDUSA
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {NAV_LINKS.map((label) => (
            <Button
              key={label}
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                textTransform: 'none',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Button
          variant="contained"
          color="secondary"
          disableElevation
          sx={{
            fontWeight: 700,
            fontSize: 13,
            textTransform: 'none',
            px: 2.5,
            borderRadius: 1.5,
          }}
        >
          Sign in
        </Button>
      </Toolbar>
    </AppBar>
  );
}
