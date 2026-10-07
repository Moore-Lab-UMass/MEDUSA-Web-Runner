'use client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

const DATASETS = [
  {
    id: 'dataset-1',
    title: 'Dataset 1 - Chemo resistant screen',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.',
  },
  {
    id: 'dataset-2',
    title: 'Dataset 2 - Lorem ipsum',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna.',
  },
];

export default function ExampleDatasets() {
  return (
    <Box component="section" sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        <Typography component="h2" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, textAlign: 'center' }}>
          Try out the tool with these example datasets
        </Typography>
        <Typography sx={{ fontSize: 14, textAlign: 'center', mb: 3 }}>
          No data of your own yet? Run MEDUSA on a real screen and see the kind of output you&apos;ll get.
        </Typography>

        <Grid container spacing={2}>
          {DATASETS.map((dataset) => (
            <Grid key={dataset.id} size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: 15, mb: 1 }}>{dataset.title}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, flex: 1 }}>
                  {dataset.description}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: 12, borderRadius: 1 }}
                  >
                    Try this dataset
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
