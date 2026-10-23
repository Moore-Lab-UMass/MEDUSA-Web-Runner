import { UploadedFile } from '@/types';
import { validateCsvFile } from './validateCsv';
import { readGenes } from './readGenes';

// A file as the form holds it: checked, sized, and with the genes it lists, which an invalid file
// has none of.
export async function toUploadedFile(file: File): Promise<UploadedFile> {
  const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
  const error = await validateCsvFile(file);
  const genes = error ? [] : await readGenes(file).catch(() => []);
  return { file, name: file.name, sizeMB, error, genes };
}
