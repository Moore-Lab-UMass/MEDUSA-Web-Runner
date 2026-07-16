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
import { LogLine } from './logLines';

export default function LiveLog({ lines }: { lines: LogLine[] }) {
  const [open, setOpen] = useState(true);

  const text = useMemo(
    () =>
      lines
        .reduce<string[]>((acc, line, i) => {
          if (i > 0 && lines[i - 1].revealAt !== line.revealAt) acc.push('');
          acc.push(`[${line.time}] ${line.marker} ${line.text}`);
          return acc;
        }, [])
        .join('\n'),
    [lines],
  );

  return (
    <Box sx={{ mt: 3 }}>
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
      <Collapse in={open}>
        <Box sx={{ mt: 1.5, borderRadius: 1.5, overflow: 'hidden', bgcolor: '#0d1117', p: 1.5 }}>
          <LazyLog
            text={text}
            follow
            height={400}
            enableLineNumbers={false}
            enableGutters={false}
            enableSearch={false}
            selectableLines
            className="medusa-live-log"
          />
        </Box>
      </Collapse>
    </Box>
  );
}
