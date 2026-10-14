import { Table, TableColDef } from '@weng-lab/ui-components';
import { FullGeneRow, GmGeneRow } from '@/common/results';

export type GeneRow = FullGeneRow | GmGeneRow;

export default function GeneTable({
  genes,
  columns,
  title,
}: {
  genes: GeneRow[];
  columns: TableColDef[];
  title: string;
}) {
  return (
    <Table
      rows={genes}
      columns={columns}
      getRowId={(row) => row.gene}
      density="compact"
      label={title}
      initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
    />
  );
}
