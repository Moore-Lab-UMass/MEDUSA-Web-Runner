import { BackgroundField, getFieldGrid } from '@weng-lab/visualization';

// The simulation behind a fully parameterized run. Only written with out_intermediate.
export const SIMTABLE = 'simtable.csv';

// The model's L2FC_TRvUT over the phase diagram's plane: x is log2(NPG) and y is log2(DR_drug),
// the relative growth and death rates the genes are placed by.
export type PhaseSurface = Pick<BackgroundField, 'x' | 'y' | 'values'>;

// pandas writes a missing value as an empty cell, which Number would read as zero.
const cell = (text: string | undefined) => (text ? Number(text) : NaN);

/**
 * Reads simtable.csv into the phase diagram's surface. The file has num_iter squared rows, a
 * million by default, so it is read a chunk at a time and never held whole as text or as rows.
 * Its cells are bare numbers, so splitting on commas is all the parsing it needs.
 */
export async function readSurface(response: Response): Promise<PhaseSurface> {
  if (!response.body) throw new Error(`${SIMTABLE} has no content.`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const x: number[] = [];
  const y: number[] = [];
  const values: number[] = [];
  let columns: { growth: number; death: number; l2fc: number } | null = null;

  const readLine = (line: string) => {
    if (!line) return;
    const cells = line.split(',');
    if (!columns) {
      const header = cells.map((name) => name.trim());
      columns = { growth: header.indexOf('NPG'), death: header.indexOf('DR_drug'), l2fc: header.indexOf('L2FC_TRvUT') };
      if (Object.values(columns).includes(-1)) throw new Error(`${SIMTABLE} is missing a column.`);
      return;
    }
    // A rate without a log2 comes out non-finite, and getFieldGrid drops the point.
    x.push(Math.log2(cell(cells[columns.growth])));
    y.push(Math.log2(cell(cells[columns.death])));
    values.push(cell(cells[columns.l2fc]));
  };

  // What follows the last newline read so far: the start of a line the next chunk finishes.
  let partial = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = (partial + decoder.decode(value, { stream: true })).split('\n');
    partial = lines.pop() ?? '';
    for (const line of lines) readLine(line);
  }
  readLine(partial + decoder.decode());

  return getFieldGrid(x, y, values);
}

// The grid line at or below `at` that has another above it. `at` is held to the grid's extent
// first: gene rates are stored as float32, so one on the grid's edge can round just past it.
function lineBelow(lines: ArrayLike<number>, at: number) {
  const last = lines.length - 1;
  const held = Math.min(Math.max(at, lines[0]), lines[last]);
  let low = 0;
  let high = last;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (lines[middle] <= held) low = middle;
    else high = middle;
  }
  return { line: low, along: (held - lines[low]) / (lines[low + 1] - lines[low]) };
}

/**
 * The surface's value at a point, interpolated between the four grid values around it, as the
 * plot paints it. NaN where any of the four is missing, or the grid has no cell to be inside.
 */
export function surfaceAt({ x, y, values }: PhaseSurface, atX: number, atY: number): number {
  if (x.length < 2 || y.length < 2) return NaN;
  const column = lineBelow(x, atX);
  const row = lineBelow(y, atY);
  const at = (i: number, j: number) => values[j * x.length + i];
  const below = at(column.line, row.line) + (at(column.line + 1, row.line) - at(column.line, row.line)) * column.along;
  const above =
    at(column.line, row.line + 1) + (at(column.line + 1, row.line + 1) - at(column.line, row.line + 1)) * column.along;
  return below + (above - below) * row.along;
}
