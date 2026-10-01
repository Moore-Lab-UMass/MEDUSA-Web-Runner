'use client';
import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const NAV_LINKS = ['Simulation Tool', 'About', 'Help'];

export default function Header() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar, bgcolor: 'primary.dark' }}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 4 }, gap: { xs: 1, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Image src="/logo-dark.png" alt="MEDUSA logo" width={46} height={46} priority />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, letterSpacing: 1, color: 'primary.contrastText', lineHeight: 1, fontSize: 20 }}
          >
            MEDUSA
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
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
            flexShrink: 0,
          }}
        >
          Sign in
        </Button>
      </Toolbar>
    </AppBar>
  );
}
