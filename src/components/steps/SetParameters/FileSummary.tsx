import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { UploadedFile } from '@/types';

export default function FileSummary({ label, file }: { label: string; file: UploadedFile | null }) {
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
