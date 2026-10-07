import { TableColDef } from '@weng-lab/ui-components';

const fixed = (value: number | null) => (value == null ? '—' : value.toFixed(3));
const scientific = (value: number | null) => (value == null ? '—' : value.toExponential(2));
// "Likely_negative_regulator" reads better without the underscores.
const spaced = (value: string) => value.replaceAll('_', ' ') || '—';

const number = (field: string, headerName: string, valueFormatter = fixed): TableColDef => ({
  field,
  headerName,
  flex: 1,
  type: 'number',
  valueFormatter,
});

const GENE_COLUMN: TableColDef = { field: 'gene', headerName: 'Gene', flex: 1 };

// p-values and FDR only exist when the run had stats enabled.
export function fullColumns(hasStats: boolean): TableColDef[] {
  return [
    GENE_COLUMN,
    number('log2Growth', 'log₂ Rel. GR'),
    number('log2Death', 'log₂ Rel. DR'),
    ...(hasStats
      ? [
          number('deathPval', 'DR p-value', scientific),
          number('deathFdr', 'DR FDR', scientific),
          number('growthPval', 'GR p-value', scientific),
          number('growthFdr', 'GR FDR', scientific),
        ]
      : []),
  ];
}

// Percentiles of each gene's z-scored rates across the matching simulations, and MEDUSA's call from them.
export const GM_COLUMNS: TableColDef[] = [
  GENE_COLUMN,
  number('deathP25', 'DR z P25'),
  number('deathP50', 'DR z P50'),
  number('deathP75', 'DR z P75'),
  { field: 'deathPredict', headerName: 'DR class', flex: 1.5, valueFormatter: spaced },
  number('growthP50', 'GR z P50'),
  { field: 'growthPredict', headerName: 'GR class', flex: 1.5, valueFormatter: spaced },
];
