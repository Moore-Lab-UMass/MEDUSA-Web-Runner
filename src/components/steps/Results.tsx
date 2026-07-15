'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { nontargetingData, proDeathData, antiDeathData, proDeathGenes, antiDeathGenes } from '@/data/dummyData';

const STAT_CARDS = [
  { label: 'Top Hits (Pro-Death)', value: '10', sub: 'view table →' },
  { label: 'Top Hits (Anti-Death)', value: '10', sub: 'view table →' },
  { label: 'Significant Genes', value: '1,248', sub: 'view table →' },
  { label: 'Total Genes', value: '18,732', sub: null },
];

function PhasePlot() {
  return (
    <Box sx={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-6, 6]}
            tickCount={7}
            label={{
              value: 'log2 Fold Change (UNT vs T0)',
              position: 'insideBottom',
              offset: -25,
              style: { fontSize: 11, fill: '#555' },
            }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[-6, 6]}
            tickCount={7}
            label={{
              value: 'log2 Fold Change (TRT vs UNT)',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 11, fill: '#555' },
            }}
            tick={{ fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="#ccc" />
          <ReferenceLine y={0} stroke="#ccc" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(val) => (typeof val === 'number' ? val.toFixed(3) : val)}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <Scatter
            name="Non-targeting"
            data={nontargetingData}
            fill="#777777"
            opacity={0.4}
            r={2}
          />
          <Scatter
            name="Pro-death"
            data={proDeathData}
            fill="#e53935"
            opacity={0.85}
            r={3}
          />
          <Scatter
            name="Anti-death"
            data={antiDeathData}
            fill="#1e88e5"
            opacity={0.85}
            r={3}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
}

function GeneTable({
  genes,
  type,
}: {
  genes: typeof proDeathGenes;
  type: 'pro' | 'anti';
}) {
  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Gene</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Score</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">p-value</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">FDR</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {genes.map((row) => (
            <TableRow key={row.gene} hover>
              <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{row.gene}</TableCell>
              <TableCell
                align="right"
                sx={{
                  fontSize: 13,
                  color: type === 'pro' ? '#c62828' : '#1565c0',
                  fontWeight: 500,
                }}
              >
                {row.score.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: 13 }}>{row.pvalue}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13 }}>{row.fdr}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        size="small"
        sx={{ mt: 1, fontSize: 12, color: '#1565c0' }}
      >
        View full table
      </Button>
    </Box>
  );
}

function PValueTab() {
  return (
    <Box sx={{ p: 2, textAlign: 'center', color: '#888' }}>
      <Typography sx={{ fontSize: 13 }}>P-Value distribution histogram would appear here.</Typography>
    </Box>
  );
}

export default function Results({ onNewAnalysis }: { onNewAnalysis: () => void }) {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5 }}>Results Overview</Typography>
          <Typography sx={{ fontSize: 13, color: '#666' }}>
            Download your results or explore key summaries below.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}>
            Download All
          </Button>
          <Button variant="outlined" size="small" startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}>
            Open in New Tab
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STAT_CARDS.map((card) => (
          <Grid key={card.label} size={{ xs: 6, md: 3 }}>
            <Paper sx={{ p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 12, color: '#666', mb: 0.5 }}>{card.label}</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{card.value}</Typography>
              {card.sub && (
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                  sx={{ fontSize: 11, p: 0, mt: 0.5, color: '#1565c0', minWidth: 0 }}
                >
                  view table
                </Button>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #e0e0e0', px: 2, '& .MuiTabs-indicator': { height: 3 } }}
        >
          {['Top Pro-Death Hits', 'Top Anti-Death Hits', 'P-Value Distribution', 'Phase Plot'].map(
            (label, i) => (
              <Tab
                key={label}
                label={label}
                sx={{ fontSize: 13, textTransform: 'none', fontWeight: tab === i ? 600 : 400 }}
              />
            ),
          )}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography component="div" sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>
                  Top Pro-Death Hits
                  <Chip label="10" size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                </Typography>
                <GeneTable genes={proDeathGenes} type="pro" />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>Phase Plot</Typography>
                <PhasePlot />
              </Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography component="div" sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>
                  Top Anti-Death Hits
                  <Chip label="10" size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                </Typography>
                <GeneTable genes={antiDeathGenes} type="anti" />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>Phase Plot</Typography>
                <PhasePlot />
              </Grid>
            </Grid>
          )}
          {tab === 2 && <PValueTab />}
          {tab === 3 && (
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>Phase Plot</Typography>
              <PhasePlot />
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onNewAnalysis}>
          New Analysis
        </Button>
      </Box>
    </Box>
  );
}
