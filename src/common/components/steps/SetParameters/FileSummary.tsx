import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { UploadedFile } from '@/types';

export default function FileSummary({
  label,
  tooltip,
  file,
}: {
  label: string;
  tooltip?: string;
  file: UploadedFile | null;
}) {
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
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#999', flexShrink: 0 }} />
          </Tooltip>
        )}
      </Box>
      {file && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} />}
    </Box>
  );
}
