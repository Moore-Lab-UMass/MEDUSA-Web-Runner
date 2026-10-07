'use client';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import GlobalStyles from '@mui/material/GlobalStyles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LazyLog } from '@melloware/react-logviewer';
import { LogChunk } from '@/types';

export default function LiveLog({ chunks }: { chunks: LogChunk[] }) {
  const [open, setOpen] = useState(true);

  // LazyLog renders this as plain text, never HTML. It needs a non-empty string to draw anything.
  const text = useMemo(
    () => chunks.flatMap((chunk) => chunk.lines).join('\n') || 'Waiting for log output…',
    [chunks],
  );

  return (
    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', flex: { md: 1 } }}>
      <GlobalStyles
        styles={{
          '.medusa-live-log': {
            backgroundColor: 'transparent !important',
            color: '#4ade80 !important',
          },
        }}
      />
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Live log</Typography>
        <IconButton size="small">
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>
      {/* On md+ this slot takes whatever height is left in the card and the log sizes to it (100cqh) */}
      <Box sx={{ flex: { md: '1 1 0px' }, minHeight: { md: 160 }, containerType: { md: 'size' } }}>
        <Collapse in={open}>
          <Box sx={{ pt: 1.5, height: { md: '100cqh' } }}>
            <Box
              sx={{
                height: { xs: 424, md: '100%' },
                borderRadius: 1.5,
                overflow: 'hidden',
                bgcolor: '#0d1117',
                p: 1.5,
              }}
            >
              <LazyLog
                text={text}
                follow
                height="auto"
                enableLineNumbers={false}
                enableGutters={false}
                enableSearch={false}
                selectableLines
                className="medusa-live-log"
              />
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
