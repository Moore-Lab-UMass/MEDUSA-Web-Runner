'use client';
import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

type Size = { width: number; height: number };

interface Props {
  // What the plot keeps of each dimension for its axes. At or below that there is no plot area
  // left to draw in, and the plot is left out.
  margin: number;
  children: (size: Size) => React.ReactNode;
}

// Takes the room left to it in a column and hands the plot inside it that room as a pixel size.
export default function PlotFrame({ margin, children }: Props) {
  // Measured here and handed to the plot as an explicit size. Left to measure itself, a plot's
  // size is 0x0 until its first measurement lands, which is the case `margin` describes.
  const [size, setSize] = useState<Size | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const plottable = size !== null && size.width > margin && size.height > margin;

  return (
    <Box ref={measureRef} sx={{ flex: 1, minHeight: 100, position: 'relative' }}>
      {size === null && (
        // Until the first measurement lands there is no size to draw the plot at.
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Shown for a moment at most, too briefly for the default arc to grow out of a dot */}
          <CircularProgress disableShrink />
        </Box>
      )}
      {plottable && (
        // Out of flow, so the plot's fixed pixel size can never stop this box from shrinking.
        <Box sx={{ position: 'absolute', top: 0, left: 0 }}>{children(size)}</Box>
      )}
    </Box>
  );
}
