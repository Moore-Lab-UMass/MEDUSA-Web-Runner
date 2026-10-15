'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { TemplateMode } from '@/common/templates';

interface TemplateCardConfig {
  mode: TemplateMode;
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
}

const CARDS: TemplateCardConfig[] = [
  {
    mode: 'full',
    title: 'Fully Parameterized Mode',
    description: 'Best when every drug-response rate is known (NPG, GRdrug1, Do, GRdrug2, DRdrug). Loads a sample run — triptolide (TRP) on U2OS cells — and runs it immediately.',
    cta: 'Run sample analysis',
    icon: <TuneOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
  },
  {
    mode: 'gm',
    title: 'General Mode',
    description: 'Use when some or all screen parameters are unknown. Only NPG is required; MEDUSA returns a distribution of possible solutions per gene. Loads into Set Parameters for review.',
    cta: 'Review sample parameters',
    icon: <LeaderboardIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
  },
];

interface Props {
  loading: TemplateMode | null;
  error: string | null;
  onSelect: (mode: TemplateMode) => void;
}

export default function TemplateOptions({ loading, error, onSelect }: Props) {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 12.5, color: '#999', px: 1 }}>OR USE A TEMPLATE</Typography>
      </Divider>

      {error && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'error.main' }}>
          <ErrorOutlineIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontSize: 13 }}>{error}</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {CARDS.map((card) => {
          const isLoading = loading === card.mode;
          const disabled = loading !== null;
          return (
            <Grid key={card.mode} size={{ xs: 12, sm: 6 }}>
              <Box
                onClick={() => !disabled && onSelect(card.mode)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  height: '100%',
                  border: '1px solid #e5e7ea',
                  borderRadius: 1.5,
                  p: 3,
                  bgcolor: '#fff',
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled && !isLoading ? 0.6 : 1,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  '&:hover': disabled ? undefined : { borderColor: 'primary.main', boxShadow: 1 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {card.icon}
                  <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{card.title}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.5, flex: 1 }}>
                  {card.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  {isLoading && <CircularProgress size={14} />}
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'primary.main' }}>
                    {isLoading ? 'Loading…' : card.cta}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
