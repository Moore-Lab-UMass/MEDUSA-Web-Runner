import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import { proDeathGenes } from '@/data/dummyData';

export default function GeneTable({
  genes,
  type,
}: {
  genes: typeof proDeathGenes;
  type: 'pro' | 'anti';
}) {
  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Gene</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Score</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">p-value</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">FDR</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {genes.map((row) => (
            <TableRow key={row.gene} hover>
              <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{row.gene}</TableCell>
              <TableCell
                align="right"
                sx={{
                  fontSize: 13,
                  color: type === 'pro' ? '#c62828' : '#1565c0',
                  fontWeight: 500,
                }}
              >
                {row.score.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: 13 }}>{row.pvalue}</TableCell>
              <TableCell align="right" sx={{ fontSize: 13 }}>{row.fdr}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        size="small"
        sx={{ mt: 1, fontSize: 12, color: '#1565c0' }}
      >
        View full table
      </Button>
    </Box>
  );
}
