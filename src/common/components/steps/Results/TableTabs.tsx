'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { TableColDef } from '@weng-lab/ui-components';
import GeneTable, { GeneRow } from './GeneTable';

export interface GeneTab {
  label: string;
  genes: GeneRow[];
}

export default function TableTabs({ tabs, columns }: { tabs: GeneTab[]; columns: TableColDef[] }) {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 36, '& .MuiTabs-indicator': { height: 2 } }}
      >
        {tabs.map(({ label }) => (
          <Tab
            key={label}
            label={label}
            sx={{ fontSize: 13, minHeight: 36, py: 0.5 }}
          />
        ))}
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <GeneTable genes={tabs[tab].genes} columns={columns} />
      </Box>
    </Box>
  );
}
