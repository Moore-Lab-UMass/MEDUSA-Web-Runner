'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FormValues, UploadedFile } from '@/types';

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  formValues: FormValues;
  onFormChange: (field: keyof FormValues, value: string | boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

function FileSummary({ label, file }: { label: string; file: UploadedFile | null }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #e0e0e0',
        borderRadius: 1.5,
        px: 2,
        py: 1,
        bgcolor: '#fafafa',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: '#666', flexShrink: 0 }} />
        <Typography sx={{ fontSize: 12.5, color: '#666', flexShrink: 0 }}>{label}:</Typography>
        <Typography sx={{ fontSize: 13, color: '#333' }} noWrap>{file?.name ?? '—'}</Typography>
      </Box>
      {file && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} />}
    </Box>
  );
}

function ParamField({
  label,
  tooltip,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontSize: 13.5, color: '#555' }}>{label}</Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoOutlinedIcon sx={{ fontSize: 20, color: '#999' }} />
          </Tooltip>
        )}
      </Box>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ bgcolor: '#fff', maxWidth: 400 }}
      />
    </Box>
  );
}

export default function SetParameters({
  trtFile,
  untFile,
  formValues,
  onFormChange,
  onBack,
  onNext,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Uploaded files summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Input Files</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FileSummary label="Drug tested vs untreated" file={trtFile} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FileSummary label="Untreated vs baseline" file={untFile} />
          </Grid>
        </Grid>
      </Paper>

      {/* Parameters */}
      <Paper variant="outlined" sx={{ p: 5, mb: 3, bgcolor: '#f5f6f7', borderColor: '#e5e7ea' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Set Parameters</Typography>
        <Typography sx={{ fontSize: 13, color: '#888', mb: 4 }}>
          Configure the required simulation inputs below.
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ParamField
              label="Untreated net population growth rate"
              tooltip="NPG — 1/doubling time"
              placeholder="e.g. 0.0231"
              value={formValues.npg}
              onChange={(v) => onFormChange('npg', v)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <ParamField
              label="Untreated assay end time (hours)"
              tooltip="T_end_unt"
              placeholder="e.g. 120"
              value={formValues.t_end_unt}
              onChange={(v) => onFormChange('t_end_unt', v)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <ParamField
              label="Drug treated assay end time (hours)"
              tooltip="T_end_tr"
              placeholder="e.g. 120"
              value={formValues.t_end_tr}
              onChange={(v) => onFormChange('t_end_tr', v)}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#888' }}>
            Advanced Parameters (optional)
          </Typography>
          <Switch
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
          />
        </Box>

        <Collapse in={showAdvanced}>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2}>
            {[
              { field: 't_start', label: 'T_start', placeholder: '0', helper: 'hours' },
              { field: 'ed', label: 'ED', placeholder: '—', helper: 'relative viability' },
              { field: 'grdrug1', label: 'GRdrug1', placeholder: '0.015', helper: 'growth rate pre-death' },
              { field: 'do_val', label: 'Do', placeholder: '48', helper: 'hours' },
              { field: 'grdrug2', label: 'GRdrug2', placeholder: '-0.010', helper: 'growth rate post-death' },
              { field: 'drdrug', label: 'DRdrug', placeholder: '0.020', helper: 'death rate post-death' },
            ].map(({ field, label, placeholder, helper }) => (
              <Grid key={field} size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  label={label}
                  size="small"
                  placeholder={placeholder}
                  value={formValues[field as keyof FormValues] as string}
                  onChange={(e) => onFormChange(field as keyof FormValues, e.target.value)}
                  helperText={helper}
                  sx={{ bgcolor: '#fff' }}
                />
              </Grid>
            ))}

            {[
              { field: 'ed_err', label: 'ED_err', placeholder: '0.02', helper: '' },
              { field: 'sim_perm', label: 'sim_perm', placeholder: '10', helper: '' },
              { field: 'num_iter', label: 'num_iter', placeholder: '1000', helper: '' },
              { field: 'bootstraps', label: 'bootstraps', placeholder: '1000000', helper: '' },
              { field: 'nont_id', label: 'nont_id', placeholder: 'NONT', helper: 'regex' },
              { field: 'max_guides_nont', label: 'max_guides_nont', placeholder: '—', helper: '' },
            ].map(({ field, label, placeholder, helper }) => (
              <Grid key={field} size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  label={label}
                  size="small"
                  placeholder={placeholder}
                  value={formValues[field as keyof FormValues] as string}
                  onChange={(e) => onFormChange(field as keyof FormValues, e.target.value)}
                  helperText={helper}
                  sx={{ bgcolor: '#fff' }}
                />
              </Grid>
            ))}

            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <TextField
                select
                fullWidth
                label="gene_level"
                size="small"
                value={formValues.gene_level}
                onChange={(e) => onFormChange('gene_level', e.target.value)}
                sx={{ bgcolor: '#fff' }}
              >
                {['median', 'mean', 'min', 'max'].map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={formValues.stats}
                    onChange={(e) => onFormChange('stats', e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: 13 }}>stats</Typography>}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={formValues.plot}
                    onChange={(e) => onFormChange('plot', e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: 13 }}>plot</Typography>}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          disableElevation
          sx={{ px: 3, textTransform: 'none' }}
        >
          Run Simulation
        </Button>
      </Box>
    </Box>
  );
}
