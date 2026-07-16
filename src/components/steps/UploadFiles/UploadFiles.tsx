'use client';
import { useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import { UploadedFile } from '@/types';
import UploadCard from './UploadCard';

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  onFileDrop: (type: 'trt' | 'unt', file: File) => void;
  onFileRemove: (type: 'trt' | 'unt') => void;
  onNext: () => void;
}

const ACCEPTED = '.csv,.tsv,.json,.xlsx,.fasta,.bed,.vcf';

export default function UploadFiles({ trtFile, untFile, onFileDrop, onFileRemove, onNext }: Props) {
  const trtInputRef = useRef<HTMLInputElement>(null);
  const untInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (type: 'trt' | 'unt', input: HTMLInputElement) => {
    if (input.files && input.files[0]) onFileDrop(type, input.files[0]);
    input.value = '';
  };

  const canProceed = !!trtFile && !!untFile;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper variant="outlined" sx={{ p: 5, bgcolor: '#f5f6f7', borderColor: '#e5e7ea', minHeight: 600 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Upload Data File</Typography>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <UploadCard
              label="Drug tested vs untreated"
              tooltip="TRT vs UNT comparison file"
              file={trtFile}
              onDrop={(f) => onFileDrop('trt', f)}
              onChoose={() => trtInputRef.current?.click()}
              onRemove={() => onFileRemove('trt')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <UploadCard
              label="Untreated vs baseline (timepoint 0)"
              tooltip="UNT vs T0 comparison file"
              file={untFile}
              onDrop={(f) => onFileDrop('unt', f)}
              onChoose={() => untInputRef.current?.click()}
              onRemove={() => onFileRemove('unt')}
            />
          </Grid>
        </Grid>

        <input
          ref={trtInputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={(e) => handleFileInput('trt', e.target)}
        />
        <input
          ref={untInputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={(e) => handleFileInput('unt', e.target)}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!canProceed}
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          disableElevation
          sx={{ px: 3, textTransform: 'none' }}
        >
          Set Parameters
        </Button>
      </Box>
    </Box>
  );
}
