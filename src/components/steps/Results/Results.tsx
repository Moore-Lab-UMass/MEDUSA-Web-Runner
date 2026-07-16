'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { TwoPaneLayout } from '@weng-lab/ui-components';
import StatCards from './StatCards';
import TableTabs from './TableTabs';
import VolcanoPlot from './VolcanoPlot';

interface Props {
  onBack: () => void;
  onNewAnalysis: () => void;
}

export default function Results({ onBack, onNewAnalysis }: Props) {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f5f6f7', borderColor: '#e5e7ea' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Results overview</Typography>
            <Typography sx={{ fontSize: 13, color: '#888' }}>
              secondary text if any goes here
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
            sx={{ textTransform: 'none' }}
          >
            Download Output Files
          </Button>
        </Box>

        <StatCards />

        <Paper sx={{ p: 1 }}>
          <TwoPaneLayout
            direction={"row"}
            TableComponent={<TableTabs />}
            plots={[
              {
                tabTitle: 'Visualization',
                plotComponent: <VolcanoPlot />,
              },
            ]}
          />
        </Paper>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2}}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
          onClick={onNewAnalysis}
          sx={{ textTransform: 'none' }}
        >
          Start over
        </Button>
      </Box>
    </Box>
  );
}
