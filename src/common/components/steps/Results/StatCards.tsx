import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export interface StatCard {
  label: string;
  value: string;
}

export default function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((card) => (
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
