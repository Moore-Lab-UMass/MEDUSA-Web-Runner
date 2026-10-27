'use client';
import Image from 'next/image';
import NextLink from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Nav links (Simulation Tool, About, Help) and Sign in are removed for now; see git history to restore.
export default function Header() {
  return (
    <AppBar position="sticky" elevation={4} sx={{ top: 0, zIndex: (theme) => theme.zIndex.appBar, bgcolor: 'primary.dark' }}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 4 }, gap: { xs: 1, sm: 3 } }}>
        <Box
          component={NextLink}
          href="/simulator"
          sx={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}
        >
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
      </Toolbar>
    </AppBar>
  );
}
