import { FormValues, UploadedFile } from '@/types';
import { validateCsvFile } from './components/steps/UploadFiles/validateCsv';

export type TemplateMode = 'full' | 'gm';

// Both templates share the same sample data; only the parameters differ. Drop the real files in
// public/templates/ with these exact names once they're available.
const TEMPLATE_FILES = {
  trt: { path: '/templates/sample-trt.csv', name: 'sample-trt.csv' },
  unt: { path: '/templates/sample-unt.csv', name: 'sample-unt.csv' },
};

export function templateFormValues(mode: TemplateMode, base: FormValues): FormValues {
  if (mode === 'full') {
    return {
      ...base,
      npg: '0.03704',
      t_end_unt: '32',
      t_end_tr: '32',
      grdrug1: '0.03704',
      do_val: '4',
      grdrug2: '0',
      drdrug: '0.01786',
    };
  }
  return {
    ...base,
    npg: '0.0231',
    t_end_unt: '120',
    t_end_tr: '120',
    ed: '0.5',
  };
}

async function fetchTemplateFile(path: string, name: string): Promise<UploadedFile> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Template sample files are not available yet.');
  const blob = await response.blob();
  const file = new File([blob], name, { type: 'text/csv' });
  const error = await validateCsvFile(file);
  const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
  return { file, name, sizeMB, error };
}

export async function loadTemplateFiles(): Promise<{ trt: UploadedFile; unt: UploadedFile }> {
  const [trt, unt] = await Promise.all([
    fetchTemplateFile(TEMPLATE_FILES.trt.path, TEMPLATE_FILES.trt.name),
    fetchTemplateFile(TEMPLATE_FILES.unt.path, TEMPLATE_FILES.unt.name),
  ]);
  if (trt.error || unt.error) throw new Error(trt.error || unt.error || 'Template files failed validation.');
  return { trt, unt };
}
