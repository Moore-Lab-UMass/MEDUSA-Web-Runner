import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TemplateMode } from '@/common/templates';

const OPTIONS: { mode: TemplateMode; label: string }[] = [
  { mode: 'full', label: 'Fully parameterized model (FP)' },
  { mode: 'gm', label: 'General model (GM)' },
];

// Fills the form with either template's parameters, keeping the files already uploaded.
export default function LoadTemplateButton({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (mode: TemplateMode) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleSelect = (mode: TemplateMode) => {
    setAnchor(null);
    onSelect(mode);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        endIcon={<ArrowDropDownIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        sx={{ bgcolor: '#fff', textTransform: 'none' }}
      >
        Load Template Parameters
      </Button>
      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {OPTIONS.map(({ mode, label }) => (
          <MenuItem key={mode} onClick={() => handleSelect(mode)} sx={{ fontSize: 14 }}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
