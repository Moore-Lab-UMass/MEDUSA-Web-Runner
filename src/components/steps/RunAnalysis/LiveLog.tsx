'use client';
import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LogLine } from './logLines';

export default function LiveLog({ lines }: { lines: LogLine[] }) {
  const [open, setOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines.length]);

  return (
    <Box sx={{ mt: 3 }}>
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
        <Box
          ref={scrollRef}
          sx={{
            mt: 1.5,
            bgcolor: '#0d1117',
            borderRadius: 1.5,
            p: 2,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {lines.map((line, i) => (
            <Typography
              key={`${line.time}-${line.text}`}
              component="div"
              sx={{
                fontFamily: 'monospace',
                fontSize: 12.5,
                color: '#4ade80',
                lineHeight: 1.7,
                mt: i > 0 && lines[i - 1].revealAt !== line.revealAt ? 1.5 : 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {`[${line.time}] ${line.marker} ${line.text}`}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
