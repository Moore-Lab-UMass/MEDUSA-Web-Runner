import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const STAT_CARDS = [
  { label: 'Top Hits (Pro-Death)', value: '10' },
  { label: 'Top Hits (Anti-Death)', value: '10' },
  { label: 'Significant Genes', value: '1,248' },
  { label: 'Total Genes', value: '18,732' },
];

export default function StatCards() {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {STAT_CARDS.map((card) => (
        <Grid key={card.label} size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{card.value}</Typography>
            <Typography sx={{ fontSize: 12.5, color: '#666', mt: 0.5 }}>{card.label}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
