'use client';
import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { UploadedFile } from '@/types';

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  onFileDrop: (type: 'trt' | 'unt', file: File) => void;
  onNext: () => void;
}

const ACCEPTED = '.csv,.tsv,.json,.xlsx,.fasta,.bed,.vcf';
const ACCEPTED_LABEL = 'CSV, TSV, JSON, XLSX, FASTA, BED, VCF (max. 3MB)';

function UploadCard({
  label,
  tooltip,
  file,
  onDrop,
  onChoose,
}: {
  label: string;
  tooltip: string;
  file: UploadedFile | null;
  onDrop: (f: File) => void;
  onChoose: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500, color: '#969393' }}>{label}</Typography>
        <Tooltip title={tooltip}>
          <InfoOutlinedIcon sx={{ fontSize: 20, color: 'black' }} />
        </Tooltip>
      </Box>
      <Box
        onClick={onChoose}
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          border: '1.5px dashed',
          borderColor: dragging ? 'primary.main' : '#c9ccd1',
          borderRadius: 1.5,
          minHeight: 400,
          px: 2,
          bgcolor: dragging ? '#eef3ee' : '#fff',
          cursor: 'pointer',
          transition: 'all 0.15s',
          textAlign: 'center',
        }}
      >
        {file ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{file.name}</Typography>
            <Typography sx={{ fontSize: 12, color: '#888' }}>{file.sizeMB}</Typography>
          </>
        ) : (
          <>
            <UploadFileOutlinedIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 13, color: '#555' }}>
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>Click to upload</Box>
              {' '}or drag and drop
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: '#999' }}>{ACCEPTED_LABEL}</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function UploadFiles({ trtFile, untFile, onFileDrop, onNext }: Props) {
  const trtInputRef = useRef<HTMLInputElement>(null);
  const untInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (type: 'trt' | 'unt', files: FileList | null) => {
    if (files && files[0]) onFileDrop(type, files[0]);
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
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <UploadCard
              label="Untreated vs baseline (timepoint 0)"
              tooltip="UNT vs T0 comparison file"
              file={untFile}
              onDrop={(f) => onFileDrop('unt', f)}
              onChoose={() => untInputRef.current?.click()}
            />
          </Grid>
        </Grid>

        <input
          ref={trtInputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={(e) => handleFileInput('trt', e.target.files)}
        />
        <input
          ref={untInputRef}
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={(e) => handleFileInput('unt', e.target.files)}
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
