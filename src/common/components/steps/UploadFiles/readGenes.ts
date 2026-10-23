const unquote = (cell: string) => cell.trim().replace(/^"|"$/g, '');

// Every distinct name in a CSV's Gene column, for picking a run's gene list from. Read once when
// the file is added, a line at a time rather than split whole, as a file can be 50 MB.
export async function readGenes(file: File): Promise<string[]> {
  const text = await file.text();
  const headerEnd = text.indexOf('\n');
  const header = (headerEnd === -1 ? text : text.slice(0, headerEnd)).split(',').map(unquote);
  const column = header.indexOf('Gene');
  if (column === -1 || headerEnd === -1) return [];

  const genes = new Set<string>();
  let start = headerEnd + 1;
  while (start < text.length) {
    const end = text.indexOf('\n', start);
    const line = text.slice(start, end === -1 ? text.length : end);
    const gene = unquote(line.split(',', column + 1)[column] ?? '');
    if (gene) genes.add(gene);
    start = end === -1 ? text.length : end + 1;
  }
  return [...genes];
}

// The genes a run can highlight, sorted: those in both files, as MEDUSA joins them on sgRNA, less
// the non-targeting ones, which it renames. nont_id is a Python regex; one JavaScript can't read
// leaves them in.
export function sharedGenes(trt: string[], unt: string[], nontId: string): string[] {
  let nont: RegExp | null = null;
  try {
    nont = nontId ? new RegExp(nontId) : null;
  } catch {
    // Left unfiltered.
  }
  const inUnt = new Set(unt);
  return trt
    .filter((gene) => inUnt.has(gene) && !nont?.test(gene))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
