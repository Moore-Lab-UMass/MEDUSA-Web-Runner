'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { ScatterPlot, Point } from '@weng-lab/visualization';
import {
  notSignificantData,
  proDeathData,
  antiDeathData,
  proDeathGenes,
  antiDeathGenes,
} from '@/data/dummyData';

type GeneGroup = { group: 'Anti-Death' | 'Pro-Death' | 'Not significant'; gene?: string };

const HIT_COLOR = '#a78bfa';
const HIT_STROKE = '#7c3aed';
const BACKGROUND_COLOR = '#b0b0b0';

const pointData: Point<GeneGroup>[] = [
  ...notSignificantData.map((p) => ({
    ...p,
    color: BACKGROUND_COLOR,
    metaData: { group: 'Not significant' as const },
  })),
  ...proDeathData.map((p, i) => ({
    ...p,
    color: HIT_COLOR,
    stroke: HIT_STROKE,
    r: 5,
    label: proDeathGenes[i].gene,
    metaData: { group: 'Pro-Death' as const, gene: proDeathGenes[i].gene },
  })),
  ...antiDeathData.map((p, i) => ({
    ...p,
    color: HIT_COLOR,
    stroke: HIT_STROKE,
    r: 5,
    label: antiDeathGenes[i].gene,
    metaData: { group: 'Anti-Death' as const, gene: antiDeathGenes[i].gene },
  })),
];

const FILTER_CHIPS = [
  { label: 'filterby option1 (200)', selected: true },
  { label: 'filterby option2 (18)', icon: <ArrowUpwardIcon sx={{ fontSize: 13 }} /> },
  { label: 'filterby option3 (27)', icon: <ArrowDownwardIcon sx={{ fontSize: 13 }} /> },
];

const LEGEND = [
  { label: 'Top hits', color: HIT_COLOR },
  { label: 'Not significant', color: BACKGROUND_COLOR },
];

export default function VolcanoPlot() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Treated / Untreated</Typography>
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

      {/* ScatterPlot draws the gradient's color bar past its own right edge, so pr reserves room for it */}
      <Box sx={{ flex: 1, minHeight: 100, pr: 11 }}>
        <ScatterPlot
          pointData={pointData}
          loading={false}
          leftAxisLabel="log₂(Relative Death Rate)"
          bottomAxisLabel="log₂(Relative Growth Rate)"
          disableZoom
          border
          originLine
          // The color bar runs high (top) to low (bottom), so the top label is the blue end
          backgroundGradient={{
            colorScale: ['red', 'white', 'blue'],
            legend: { label: 'L2FC TRvUT', minLabel: '0.8', maxLabel: '-0.8' },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
        {LEGEND.map(({ label, color }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
            <Typography sx={{ fontSize: 12, color: '#666' }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
