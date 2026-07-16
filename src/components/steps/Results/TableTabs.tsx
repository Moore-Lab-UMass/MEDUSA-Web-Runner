'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import GeneTable from './GeneTable';
import { proDeathGenes, antiDeathGenes, allGenes } from '@/data/dummyData';

const TABS = [
  { label: 'Table 1', genes: proDeathGenes },
  { label: 'Table 2', genes: antiDeathGenes },
  { label: 'Table 3', genes: allGenes },
];

export default function TableTabs() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 36, '& .MuiTabs-indicator': { height: 2 } }}
      >
        {TABS.map(({ label }) => (
          <Tab
            key={label}
            label={label}
            sx={{ fontSize: 13, textTransform: 'none', minHeight: 36, py: 0.5 }}
          />
        ))}
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <GeneTable genes={TABS[tab].genes} />
      </Box>
    </Box>
  );
}
