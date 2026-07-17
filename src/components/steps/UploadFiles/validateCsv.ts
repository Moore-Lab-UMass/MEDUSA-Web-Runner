const REQUIRED_COLUMNS = ['sgRNA', 'Gene', 'log2FoldChange'];

function parseHeaderRow(headerLine: string): string[] {
  return headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
}

export async function validateCsvFile(file: File): Promise<string | undefined> {
  // if (!file.name.toLowerCase().endsWith('.csv')) return undefined;

  let text: string;
  try {
    text = await file.text();
  } catch {
    return 'Could not read file contents.';
  }

  const headerLine = text.split(/\r?\n/, 1)[0] ?? '';
  const headers = parseHeaderRow(headerLine);
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missing.length > 0) {
    return `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`;
  }
  return undefined;
}
