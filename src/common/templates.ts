import { FormValues, RunMode, UploadedFile } from '@/types';
import { MEDUSA_DEFAULTS } from './parameters';
import { toUploadedFile } from './components/steps/UploadFiles/uploadedFile';

// There is a template for each mode, whose parameters run in it.
export type TemplateMode = RunMode;

// Both templates share the same sample data; only the parameters differ. Drop the real files in
// public/templates/ with these exact names once they're available.
const TEMPLATE_FILES = {
  trt: { path: '/templates/sample-trt.csv', name: 'sample-trt.csv' },
  unt: { path: '/templates/sample-unt.csv', name: 'sample-unt.csv' },
};

// The sample is triptolide (TRP) at 1uM on U2OS cells for 32 hours, with the parameters of
// MEDUSA's own example runs: every rate known for the fully parameterized one, and only NPG and
// the effective dose for GM. The optional parameters are filled in with MEDUSA's defaults, except
// num_iter in GM, where a blank one is picked to fit the worker.
export function templateFormValues(mode: TemplateMode, base: FormValues): FormValues {
  const shared = { ...base, ...MEDUSA_DEFAULTS, npg: '0.03704', t_end_unt: '32', t_end_tr: '32' };
  if (mode === 'full') {
    return { ...shared, grdrug1: '0.03704', do_val: '4', grdrug2: '0', drdrug: '0.01786' };
  }
  return { ...shared, num_iter: '', ed: '0.2436' };
}

async function fetchTemplateFile(path: string, name: string): Promise<UploadedFile> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Template sample files are not available yet.');
  const blob = await response.blob();
  return toUploadedFile(new File([blob], name, { type: 'text/csv' }));
}

export async function loadTemplateFiles(): Promise<{ trt: UploadedFile; unt: UploadedFile }> {
  const [trt, unt] = await Promise.all([
    fetchTemplateFile(TEMPLATE_FILES.trt.path, TEMPLATE_FILES.trt.name),
    fetchTemplateFile(TEMPLATE_FILES.unt.path, TEMPLATE_FILES.unt.name),
  ]);
  if (trt.error || unt.error) throw new Error(trt.error || unt.error || 'Template files failed validation.');
  return { trt, unt };
}
