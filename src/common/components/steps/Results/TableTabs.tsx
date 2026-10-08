'use client';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { TableColDef } from '@weng-lab/ui-components';
import GeneTable, { GeneRow } from './GeneTable';

export interface GeneTab {
  label: string;
  genes: GeneRow[];
}

// The open tab is held by the parent, by label, so the stat cards can switch it too.
export default function TableTabs({
  tabs,
  columns,
  value,
  onChange,
}: {
  tabs: GeneTab[];
  columns: TableColDef[];
  value: string;
  onChange: (label: string) => void;
}) {
  const open = tabs.find((tab) => tab.label === value) ?? tabs[0];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={open.label}
        onChange={(_, label) => onChange(label)}
        sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 36, '& .MuiTabs-indicator': { height: 2 } }}
      >
        {tabs.map(({ label }) => (
          <Tab
            key={label}
            value={label}
            label={label}
            sx={{ fontSize: 13, minHeight: 36, py: 0.5 }}
          />
        ))}
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <GeneTable genes={open.genes} columns={columns} />
      </Box>
    </Box>
  );
}
