import { GenePoint } from './genePoints';
import { formatL2fc, SURFACE_LABEL } from './surfaceScale';

// What hovering a gene shows. The plot's own tooltip lists the metadata as it is, so this one is
// here to write the L2FC.
export default function GeneTooltip({ point: { metaData } }: { point: GenePoint }) {
  return (
    <div>
      <div>
        <strong>Gene: </strong>
        {metaData?.gene}
      </div>
      <div>
        <strong>Group: </strong>
        {metaData?.group}
      </div>
      {typeof metaData?.l2fc === 'number' && (
        <div>
          <strong>{SURFACE_LABEL}: </strong>
          {formatL2fc(metaData.l2fc)}
        </div>
      )}
    </div>
  );
}
