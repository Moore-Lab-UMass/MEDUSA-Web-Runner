import { useMemo } from 'react';
import { Table, TableColDef } from '@weng-lab/ui-components';
import { FullGeneRow, GmGeneRow } from '@/common/results';

export type GeneRow = FullGeneRow | GmGeneRow;

// A table whose rows pick a gene: one is always selected, and clicking another moves it.
export interface GeneSelection {
  gene: string;
  onSelect: (gene: string) => void;
}

export default function GeneTable({
  genes,
  columns,
  title,
  selection,
}: {
  genes: GeneRow[];
  columns: TableColDef[];
  title: string;
  selection?: GeneSelection;
}) {
  const selectedGene = selection?.gene;
  const rowSelectionModel = useMemo(
    () => (selectedGene === undefined ? undefined : { type: 'include' as const, ids: new Set([selectedGene]) }),
    [selectedGene],
  );

  return (
    <Table
      rows={genes}
      columns={columns}
      getRowId={(row) => row.gene}
      density="compact"
      label={title}
      initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
      disableRowSelectionOnClick={!selection}
      disableMultipleRowSelection
      // The selected gene can be on another tab's list, and stays selected while this one is open.
      keepNonExistentRowsSelected
      rowSelectionModel={rowSelectionModel}
      // Ctrl-clicking the selected row would clear the selection, which is ignored to keep one.
      onRowSelectionModelChange={
        selection
          ? (model) => {
              const [id] = model.ids;
              if (id !== undefined) selection.onSelect(String(id));
            }
          : undefined
      }
      sx={selection ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : undefined}
    />
  );
}
