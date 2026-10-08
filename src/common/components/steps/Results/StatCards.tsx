import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export interface StatCard {
  label: string;
  value: string;
  // Opens the table tab listing what the value counts. A card without one is not clickable.
  onClick?: () => void;
}

// Spans, since the clickable cards put these inside a button.
function CardText({ card }: { card: StatCard }) {
  return (
    <>
      <Typography component="span" sx={{ display: 'block', fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
        {card.value}
      </Typography>
      <Typography component="span" sx={{ display: 'block', fontSize: 12.5, color: '#666', mt: 0.5 }}>
        {card.label}
      </Typography>
    </>
  );
}

export default function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
            {card.onClick ? (
              <CardActionArea onClick={card.onClick} sx={{ height: '100%', p: 2.5, textAlign: 'center' }}>
                <CardText card={card} />
              </CardActionArea>
            ) : (
              <Box sx={{ p: 2.5, textAlign: 'center' }}>
                <CardText card={card} />
              </Box>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
