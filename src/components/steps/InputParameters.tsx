'use client';
import { useRef, useState } from 'react';
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
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FormValues, UploadedFile } from '@/types';

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  formValues: FormValues;
  onFormChange: (field: keyof FormValues, value: string | boolean) => void;
  onFileDrop: (type: 'trt' | 'unt', file: File) => void;
  onNext: () => void;
}

function FileDropZone({
  label,
  file,
  onDrop,
  onChoose,
}: {
  label: string;
  file: UploadedFile | null;
  onDrop: (f: File) => void;
  onChoose: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#555', mb: 0.5 }}>{label}</Typography>
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onDrop(f);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1.5px dashed ${dragging ? '#1565c0' : '#ccc'}`,
          borderRadius: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: dragging ? '#e3f2fd' : '#fafafa',
          transition: 'all 0.15s',
        }}
      >
        {file ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: '#666' }} />
            <Typography sx={{ fontSize: 13, color: '#333' }}>{file.name}</Typography>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: '#999' }}>Drag and drop CSV file here</Typography>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={onChoose}
          sx={{ fontSize: 12, minWidth: 100, borderColor: '#bbb', color: '#333' }}
        >
          Choose File
        </Button>
      </Box>
    </Box>
  );
}

export default function InputParameters({
  trtFile,
  untFile,
  formValues,
  onFormChange,
  onFileDrop,
  onNext,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const trtInputRef = useRef<HTMLInputElement>(null);
  const untInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (type: 'trt' | 'unt', files: FileList | null) => {
    if (files && files[0]) onFileDrop(type, files[0]);
  };


  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>MEDUSA Web Runner</Typography>
      <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
        Analytical identification of death-regulatory genes from CRISPR-based chemogenetic profiling screens.
      </Typography>

      {/* Input Files + About section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Input Files</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FileDropZone
                label="TRT vs UNT CSV (TvU)"
                file={trtFile}
                onDrop={(f) => onFileDrop('trt', f)}
                onChoose={() => trtInputRef.current?.click()}
              />
              <FileDropZone
                label="UNT vs T0 CSV (UvT0)"
                file={untFile}
                onDrop={(f) => onFileDrop('unt', f)}
                onChoose={() => untInputRef.current?.click()}
              />
            </Box>
            <input
              ref={trtInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => handleFileInput('trt', e.target.files)}
            />
            <input
              ref={untInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => handleFileInput('unt', e.target.files)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2.5, bgcolor: '#f8f9ff', borderColor: '#c5cae9', height: '100%' }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>About MEDUSA</Typography>
              <Typography sx={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                MEDUSA infers death kinetics and identifies genes whose perturbation promotes or
                blocks cell death in chemogenetic screens.
              </Typography>
              <Button
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                size="small"
                sx={{ mt: 1.5, fontSize: 12, p: 0, textTransform: 'none', color: '#1565c0' }}
              >
                Learn more
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Required Parameters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Required Parameters</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="NPG"
              size="small"
              placeholder="e.g. 0.0231"
              value={formValues.npg}
              onChange={(e) => onFormChange('npg', e.target.value)}
              helperText="1/doubling time"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="T_end_unt"
              size="small"
              placeholder="e.g. 120"
              value={formValues.t_end_unt}
              onChange={(e) => onFormChange('t_end_unt', e.target.value)}
              helperText="hours"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="T_end_tr"
              size="small"
              placeholder="e.g. 120"
              value={formValues.t_end_tr}
              onChange={(e) => onFormChange('t_end_tr', e.target.value)}
              helperText="hours"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Optional / Advanced Parameters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Optional / Advanced Parameters
          </Typography>
          {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>

        <Collapse in={showAdvanced}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {/* Row 1: growth/kinetics params */}
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
                />
              </Grid>
            ))}

            {/* Row 2: simulation params */}
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          sx={{ px: 3 }}
        >
          Next: Review
        </Button>
      </Box>
    </Box>
  );
}
