import { Table, TableColDef } from '@weng-lab/ui-components';
import { proDeathGenes } from '@/data/dummyData';

type GeneRow = (typeof proDeathGenes)[number];

const columns: TableColDef<GeneRow>[] = [
  { field: 'gene', headerName: 'Gene', flex: 1 },
  { field: 'score', headerName: 'Score', flex: 1, type: 'number' },
  { field: 'pvalue', headerName: 'p-value', flex: 1 },
  { field: 'fdr', headerName: 'FDR', flex: 1 },
];

export default function GeneTable({ genes }: { genes: GeneRow[] }) {
  return (
    <Table
      rows={genes}
      columns={columns}
      getRowId={(row) => row.gene}
      density="compact"
      showToolbar={false}
      pageSizeOptions={[5, 10, 25]}
      initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
    />
  );
}
