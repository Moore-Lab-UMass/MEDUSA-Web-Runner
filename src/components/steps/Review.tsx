'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { FormValues, UploadedFile } from '@/types';

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  formValues: FormValues;
  onBack: () => void;
  onRun: () => void;
}

function ParamRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.5 }}>
      <Typography sx={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{value || '—'}</Typography>
        {unit && <Typography sx={{ fontSize: 11, color: '#888' }}>{unit}</Typography>}
      </Box>
    </Box>
  );
}

function FileRow({ label, file }: { label: string; file: UploadedFile | null }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #e0e0e0',
        borderRadius: 1.5,
        px: 2,
        py: 1.2,
        mb: 1,
        bgcolor: '#fafafa',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: '#666' }} />
        <Typography sx={{ fontSize: 13 }}>{file?.name ?? 'No file selected'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {file && (
          <Typography sx={{ fontSize: 12, color: '#888' }}>({file.sizeMB})</Typography>
        )}
        {file && <CheckCircleIcon sx={{ fontSize: 16, color: '#2e7d32' }} />}
      </Box>
    </Box>
  );
}

const OPTIONAL_PARAMS = [
  [
    { label: 'T_start', field: 't_start', unit: '' },
    { label: 'ED', field: 'ed', unit: '' },
    { label: 'max_guides_nont', field: 'max_guides_nont', unit: '' },
  ],
  [
    { label: 'GRdrug1', field: 'grdrug1', unit: '' },
    { label: 'ED_err', field: 'ed_err', unit: '' },
    { label: 'nont_id', field: 'nont_id', unit: '' },
  ],
  [
    { label: 'Do', field: 'do_val', unit: '' },
    { label: 'sim_perm', field: 'sim_perm', unit: '' },
    { label: 'gene_level', field: 'gene_level', unit: '' },
  ],
  [
    { label: 'GRdrug2', field: 'grdrug2', unit: '' },
    { label: 'num_iter', field: 'num_iter', unit: '' },
    { label: 'stats', field: 'stats', unit: '' },
  ],
  [
    { label: 'DRdrug', field: 'drdrug', unit: '' },
    { label: 'bootstraps', field: 'bootstraps', unit: '' },
    { label: 'plot', field: 'plot', unit: '' },
  ],
];

export default function Review({ trtFile, untFile, formValues, onBack, onRun }: Props) {
  const fmt = (field: keyof FormValues): string => {
    const v = formValues[field];
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return v || '—';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Review Your Settings</Typography>
      <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
        Please review your inputs and parameters before running MEDUSA.
      </Typography>

      <Grid container spacing={3}>
        {/* Left: Input Files */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Input Files</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#666', mb: 0.5 }}>
              TRT vs UNT CSV (TvU)
            </Typography>
            <FileRow label="TRT" file={trtFile} />
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#666', mb: 0.5, mt: 1 }}>
              UNT vs T0 CSV (UvT0)
            </Typography>
            <FileRow label="UNT" file={untFile} />
          </Paper>
        </Grid>

        {/* Right: Required Parameters */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Required Parameters</Typography>
            <ParamRow label="NPG" value={formValues.npg} unit="1/doubling time" />
            <ParamRow label="T_end_unt" value={formValues.t_end_unt} unit="hours" />
            <ParamRow label="T_end_tr" value={formValues.t_end_tr} unit="hours" />
          </Paper>
        </Grid>

        {/* Optional Parameters - full width */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Optional / Advanced Parameters
            </Typography>
            <Grid container spacing={0}>
              {OPTIONAL_PARAMS.map((row, ri) => (
                <Grid key={ri} size={{ xs: 12 }}>
                  <Grid container>
                    {row.map(({ label, field }) => (
                      <Grid key={field} size={{ xs: 4 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            px: 1.5,
                            py: 0.6,
                            borderBottom: ri < OPTIONAL_PARAMS.length - 1 ? '1px solid #f0f0f0' : 'none',
                          }}
                        >
                          <Typography sx={{ fontSize: 12, color: '#666' }}>{label}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                            {fmt(field as keyof FormValues)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<PlayArrowIcon />}
          onClick={onRun}
          sx={{ px: 3 }}
        >
          Run Analysis
        </Button>
      </Box>
    </Box>
  );
}
