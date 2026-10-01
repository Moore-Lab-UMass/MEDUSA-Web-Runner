'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const INSTALL_COMMANDS = ['git clone https://github.com/lee-lab/medusa.git', 'cd medusa', 'pip install -r requirements.txt'].join('\n');

export default function RunLocally() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMANDS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box component="section" sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        <Typography component="h2" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 300, textAlign: 'center', mb: 1 }}>
          [Want to use MEDUSA locally?]
        </Typography>
        <Typography sx={{ fontSize: 13, textAlign: 'center', color: 'secondary.dark', mb: 5 }}>
          Copy the commands below to install MEDUSA in your own Python environment. Read{' '}
          <Link href="#" sx={{ color: 'secondary.main', fontWeight: 700 }}>
            documentation
          </Link>{' '}
          to learn more.
        </Typography>

        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            border: 1,
            borderColor: 'primary.main',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75, px: 1.5, py: 1, borderBottom: 1, borderColor: 'primary.main' }}>
            {[0, 1, 2].map((dot) => (
              <Box key={dot} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2 }}>
            <Box
              component="pre"
              sx={{ m: 0, flex: 1, overflowX: 'auto', fontSize: 12, lineHeight: 1.8, color: 'secondary.dark' }}
            >
              {INSTALL_COMMANDS}
            </Box>
            <Tooltip title={copied ? 'Copied' : 'Copy'}>
              <IconButton size="small" onClick={handleCopy} aria-label="Copy install commands" sx={{ color: 'secondary.main' }}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
