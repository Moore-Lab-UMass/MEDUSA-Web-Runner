'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { ScatterPlot, Point } from '@weng-lab/visualization';
import { notSignificantData, proDeathData, antiDeathData } from '@/data/dummyData';

type GeneGroup = { group: 'Anti-Death' | 'Pro-Death' | 'Not significant' };

const pointData: Point<GeneGroup>[] = [
  ...notSignificantData.map((p) => ({
    ...p,
    color: '#bdbdbd',
    opacity: 0.5,
    r: 2,
    metaData: { group: 'Not significant' as const },
  })),
  ...proDeathData.map((p) => ({
    ...p,
    color: '#2e7d32',
    metaData: { group: 'Pro-Death' as const },
  })),
  ...antiDeathData.map((p) => ({
    ...p,
    color: '#e53935',
    metaData: { group: 'Anti-Death' as const },
  })),
];

const FILTER_CHIPS = [
  { label: 'filterby option1 (200)', selected: true },
  { label: 'filterby option2 (18)', icon: <ArrowUpwardIcon sx={{ fontSize: 13 }} /> },
  { label: 'filterby option3 (27)', icon: <ArrowDownwardIcon sx={{ fontSize: 13 }} /> },
];

const LEGEND = [
  { label: 'Anti-Death', color: '#e53935' },
  { label: 'Pro-Death', color: '#2e7d32' },
  { label: 'Not significant', color: '#bdbdbd' },
];

export default function VolcanoPlot() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>[Plot name]</Typography>
      <Typography sx={{ fontSize: 12, color: '#888', mb: 1.5 }}>
        Treatment vs Control · 200 genes
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {FILTER_CHIPS.map(({ label, selected, icon }) => (
          <Chip
            key={label}
            label={label}
            icon={icon}
            variant={selected ? 'filled' : 'outlined'}
            sx={{
              fontSize: 12,
              bgcolor: selected ? '#1a1a1a' : 'transparent',
              color: selected ? '#fff' : '#555',
              borderColor: '#d8dbe0',
            }}
          />
        ))}
      </Box>

      <Box sx={{ flex: 1, minHeight: 260 }}>
        <ScatterPlot
          pointData={pointData}
          loading={false}
          leftAxisLabel="-log10(p)"
          bottomAxisLabel="log2 Fold Change"
          disableZoom
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
        {LEGEND.map(({ label, color }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
            <Typography sx={{ fontSize: 12, color: '#666' }}>{label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 14, height: 0, borderTop: '2px dashed #f9a825' }} />
          <Typography sx={{ fontSize: 12, color: '#f9a825' }}>p = 0.05</Typography>
        </Box>
      </Box>
    </Box>
  );
}
