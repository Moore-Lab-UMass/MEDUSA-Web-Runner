import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function ParamField({
  label,
  tooltip,
  value,
  onChange,
  placeholder,
  width,
}: {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
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
        sx={{ bgcolor: '#fff', ...(width ? { width } : {}) }}
      />
    </Box>
  );
}
