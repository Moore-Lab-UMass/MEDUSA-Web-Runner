'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { TableColDef } from '@weng-lab/ui-components';
import GeneTable, { GeneRow, GeneSelection } from './GeneTable';

export interface GeneTab {
  label: string;
  // The table's title while this tab is open.
  title: string;
  // What the pill counts, in full, for its tooltip.
  description: string;
  // What the pill shows, which need not be the number of rows (All Genes lists controls it doesn't count).
  count: string;
  // The rows the pill opens. A tab without them is shown, unselectable, for its count alone.
  genes?: GeneRow[];
}

// The table's tabs as a row of pills, each with its count, so they double as the run's stats.
export default function TableTabs({
  tabs,
  columns,
  selection,
}: {
  tabs: GeneTab[];
  columns: TableColDef[];
  selection?: GeneSelection;
}) {
  // Null until a pill is picked, which opens the first tab.
  const [value, setValue] = useState<string | null>(null);
  const open = tabs.find((tab) => tab.genes && tab.label === value) ?? tabs[0];

  // Opening a tab that doesn't list the selected gene selects its first, so the selection is
  // always a row in view.
  const openTab = (tab: GeneTab) => {
    setValue(tab.label);
    const first = tab.genes?.[0];
    if (selection && first && !tab.genes?.some((row) => row.gene === selection.gene)) selection.onSelect(first.gene);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box role="tablist" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {tabs.map((tab) => {
          const selected = tab === open;
          // The span lets the tooltip open on a disabled pill, which takes no pointer events itself.
          return (
            <Tooltip key={tab.label} title={tab.description} arrow placement="top">
              <span>
                <Chip
                  role="tab"
                  aria-selected={selected}
                  size="small"
                  variant={selected ? 'filled' : 'outlined'}
                  color={selected ? 'primary' : 'default'}
                  disabled={!tab.genes}
                  onClick={tab.genes ? () => openTab(tab) : undefined}
                  label={
                    <>
                      <Box component="span" sx={{ fontWeight: 800, mr: 0.75 }}>
                        {tab.count}
                      </Box>
                      <Box component="span" sx={{ color: selected ? 'inherit' : '#666' }}>
                        {tab.label}
                      </Box>
                    </>
                  }
                  sx={{ fontSize: 12.5 }}
                />
              </span>
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <GeneTable genes={open.genes ?? []} columns={columns} title={open.title} selection={selection} />
      </Box>
    </Box>
  );
}
