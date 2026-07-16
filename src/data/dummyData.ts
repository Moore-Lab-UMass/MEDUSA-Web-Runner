import { ScatterPoint } from '@/types';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePoints(
  seed: number,
  count: number,
  meanX: number,
  meanY: number,
  stdX: number,
  stdY: number,
): ScatterPoint[] {
  const rand = mulberry32(seed);
  const points: ScatterPoint[] = [];
  for (let i = 0; i < count; i++) {
    const u1 = rand();
    const u2 = rand();
    const z1 = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u2 + 0.0001)) * Math.cos(2 * Math.PI * u1);
    points.push({
      x: parseFloat((meanX + z1 * stdX).toFixed(3)),
      y: parseFloat((meanY + z2 * stdY).toFixed(3)),
    });
  }
  return points;
}

function toVolcanoShape(points: ScatterPoint[], minY: number): ScatterPoint[] {
  return points.map((p) => ({ x: p.x, y: parseFloat(Math.max(minY, Math.abs(p.y)).toFixed(3)) }));
}

export const notSignificantData: ScatterPoint[] = toVolcanoShape(
  generatePoints(42, 150, 0, 0.6, 1.9, 0.5),
  0.05,
);
export const proDeathData: ScatterPoint[] = toVolcanoShape(
  generatePoints(7, 25, -3.4, 6, 1.4, 1.6),
  1.6,
);
export const antiDeathData: ScatterPoint[] = toVolcanoShape(
  generatePoints(13, 25, 2.7, 6, 1, 1.6),
  1.6,
);

export const proDeathGenes = [
  { gene: 'CYLD', score: 3.21, pvalue: '1.2e-06', fdr: '3.4e-04' },
  { gene: 'BAX', score: 2.87, pvalue: '3.1e-06', fdr: '5.2e-04' },
  { gene: 'BBC3', score: 2.65, pvalue: '6.5e-06', fdr: '8.7e-04' },
  { gene: 'HRK', score: 2.45, pvalue: '9.2e-06', fdr: '1.2e-03' },
  { gene: 'PMAIP1', score: 2.31, pvalue: '1.3e-05', fdr: '1.6e-03' },
  { gene: 'BID', score: 2.18, pvalue: '2.1e-05', fdr: '2.3e-03' },
  { gene: 'CASP3', score: 2.04, pvalue: '3.4e-05', fdr: '3.5e-03' },
  { gene: 'BCL2L11', score: 1.97, pvalue: '4.8e-05', fdr: '4.6e-03' },
  { gene: 'BNIP3L', score: 1.88, pvalue: '6.2e-05', fdr: '5.8e-03' },
  { gene: 'DAPK1', score: 1.75, pvalue: '9.1e-05', fdr: '8.1e-03' },
];

export const antiDeathGenes = [
  { gene: 'BCL2', score: -3.14, pvalue: '1.8e-06', fdr: '3.9e-04' },
  { gene: 'MCL1', score: -2.93, pvalue: '2.7e-06', fdr: '4.8e-04' },
  { gene: 'BCL2L1', score: -2.71, pvalue: '5.2e-06', fdr: '7.4e-04' },
  { gene: 'BCLAF1', score: -2.55, pvalue: '8.1e-06', fdr: '1.1e-03' },
  { gene: 'BIRC5', score: -2.38, pvalue: '1.4e-05', fdr: '1.7e-03' },
  { gene: 'XIAP', score: -2.22, pvalue: '2.3e-05', fdr: '2.6e-03' },
  { gene: 'BIRC2', score: -2.09, pvalue: '3.8e-05', fdr: '3.9e-03' },
  { gene: 'CIAP1', score: -1.95, pvalue: '5.5e-05', fdr: '5.2e-03' },
  { gene: 'CFLAR', score: -1.82, pvalue: '7.9e-05', fdr: '7.2e-03' },
  { gene: 'AVEN', score: -1.71, pvalue: '1.1e-04', fdr: '9.6e-03' },
];

export const allGenes = [...proDeathGenes, ...antiDeathGenes].sort(
  (a, b) => Math.abs(b.score) - Math.abs(a.score),
);
