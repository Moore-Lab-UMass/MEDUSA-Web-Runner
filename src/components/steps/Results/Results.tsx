'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { proDeathGenes, antiDeathGenes } from '@/data/dummyData';
import PhasePlot from './PhasePlot';
import GeneTable from './GeneTable';
import PValueTab from './PValueTab';

const STAT_CARDS = [
  { label: 'Top Hits (Pro-Death)', value: '10', sub: 'view table →' },
  { label: 'Top Hits (Anti-Death)', value: '10', sub: 'view table →' },
  { label: 'Significant Genes', value: '1,248', sub: 'view table →' },
  { label: 'Total Genes', value: '18,732', sub: null },
];

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
