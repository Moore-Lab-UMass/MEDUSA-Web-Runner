const REQUIRED_COLUMNS = ['sgRNA', 'Gene', 'log2FoldChange'];

// The API's per-file limit (MAX_FILE_SIZE_BYTES on medusa-api).
export const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Enough to hold the header row without reading a 50 MB file into memory.
const HEADER_SAMPLE_BYTES = 64 * 1024;

function parseHeaderRow(headerLine: string): string[] {
  return headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
}

export async function validateCsvFile(file: File): Promise<string | undefined> {
  // The API rejects any other filename, so catch it before a run is created.
  if (!file.name.toLowerCase().endsWith('.csv')) return 'File name must end in .csv';
  if (file.size === 0) return 'File is empty.';
  if (file.size > MAX_FILE_SIZE_BYTES) return `File is larger than ${MAX_FILE_SIZE_MB} MB.`;

  let text: string;
  try {
    text = await file.slice(0, HEADER_SAMPLE_BYTES).text();
  } catch {
    return 'Could not read file contents.';
  }

  const headerLine = text.split(/\r?\n/, 1)[0] ?? '';
  const headers = parseHeaderRow(headerLine);
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missing.length > 0) {
    return `Missing required header${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`;
  }
  return undefined;
}
