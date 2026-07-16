'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { UploadedFile } from '@/types';

const ACCEPTED_LABEL = 'CSV, TSV, JSON, XLSX, FASTA, BED, VCF (max. 3MB)';

export default function UploadCard({
  label,
  tooltip,
  file,
  onDrop,
  onChoose,
  onRemove,
}: {
  label: string;
  tooltip: string;
  file: UploadedFile | null;
  onDrop: (f: File) => void;
  onChoose: () => void;
  onRemove: () => void;
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
      {file ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            border: '1px solid #e5e7ea',
            borderRadius: 1.5,
            px: 3,
            py: 4,
            bgcolor: '#fff',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 1,
              bgcolor: '#eef3ee',
              flexShrink: 0,
            }}
          >
            <UploadFileOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, gap: .5, display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, color: '#222' }}>{file.name}</Typography>
            <Typography sx={{ fontSize: 11.5, color: '#888', mb: 0.5 }}>{file.sizeMB} · Complete</Typography>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: '#e5e7ea',
                '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 2 },
              }}
            />
          </Box>
          <IconButton onClick={onRemove} size="small" sx={{ flexShrink: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 18, color: '#888' }} />
          </IconButton>
        </Box>
      ) : (
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
          <UploadFileOutlinedIcon sx={{ fontSize: 30, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 13, color: '#555' }}>
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>Click to upload</Box>
            {' '}or drag and drop
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: '#999' }}>{ACCEPTED_LABEL}</Typography>
        </Box>
      )}
    </Box>
  );
}
