'use client';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#0d1b2a' }}>
      <Toolbar sx={{ minHeight: 52, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: 1.5, color: '#fff', lineHeight: 1 }}
          >
            MEDUSA
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}
          >
            Web Runner
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button
          startIcon={<ArticleOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, '&:hover': { color: '#fff' } }}
        >
          Docs
        </Button>
        <Button
          startIcon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, '&:hover': { color: '#fff' } }}
        >
          About
        </Button>
      </Toolbar>
    </AppBar>
  );
}
