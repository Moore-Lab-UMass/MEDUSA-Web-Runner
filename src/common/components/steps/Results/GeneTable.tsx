import { Table, TableColDef } from '@weng-lab/ui-components';
import { FullGeneRow, GmGeneRow } from '@/common/results';

export type GeneRow = FullGeneRow | GmGeneRow;

export default function GeneTable({ genes, columns }: { genes: GeneRow[]; columns: TableColDef[] }) {
  return (
    <Table
      rows={genes}
      columns={columns}
      getRowId={(row) => row.gene}
      density="compact"
      label="Gene Table"
      initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
    />
  );
}
