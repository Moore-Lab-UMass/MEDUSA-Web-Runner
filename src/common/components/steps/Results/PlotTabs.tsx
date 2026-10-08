'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

export interface PlotTab {
  label: string;
  plot: React.ReactNode;
}

// One tab per plot. Each mode has a single plot so far; the tab bar is there for the ones to come.
export default function PlotTabs({ tabs }: { tabs: PlotTab[] }) {
  // Null until a tab is picked, which shows the first one.
  const [value, setValue] = useState<string | null>(null);
  const open = tabs.find((tab) => tab.label === value) ?? tabs[0];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={open.label}
        onChange={(_, label) => setValue(label)}
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
      <Box sx={{ flex: 1, minHeight: 0, pt: 2 }}>{open.plot}</Box>
    </Box>
  );
}
