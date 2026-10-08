'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepLayout from './StepLayout';
import UploadFiles from './steps/UploadFiles/UploadFiles';
import SetParameters from './steps/SetParameters/SetParameters';
import { validateCsvFile } from './steps/UploadFiles/validateCsv';
import { createRun, getRun, startRun, uploadFile } from '@/common/medusaApi';
import { buildParameters } from '@/common/parameters';
import { FormErrors, FormValues, SubmitState, UploadedFile } from '@/types';

const DEFAULT_FORM: FormValues = {
  npg: '0.0231',
  t_end_unt: '120',
  t_end_tr: '120',
  t_start: '0',
  ed: '',
  grdrug1: '',
  do_val: '',
  grdrug2: '',
  drdrug: '',
  ed_err: '0.02',
  sim_perm: '10',
  num_iter: '1000',
  gene_level: 'median',
  nont_id: 'NONT',
  max_guides_nont: '',
  bootstraps: '1000000',
  stats: true,
  plot: true,
};

// TEMP: fully parameterized test run, filled in by the "Load test parameters" button.
const TEST_FORM: FormValues = {
  ...DEFAULT_FORM,
  npg: '0.03704',
  t_end_unt: '32',
  t_end_tr: '32',
  grdrug1: '0.03704',
  do_val: '4',
  grdrug2: '0',
  drdrug: '0.01786',
};

export default function MedusaApp() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [trtFile, setTrtFile] = useState<UploadedFile | null>(null);
  const [untFile, setUntFile] = useState<UploadedFile | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submit, setSubmit] = useState<SubmitState>({ phase: 'idle' });

  const handleFormChange = (field: keyof FormValues, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    // The ED / drug-parameter rule spans several fields, so one edit can resolve errors on others.
    setFormErrors({});
  };

  // TEMP
  const handleLoadTestParameters = () => {
    setFormValues(TEST_FORM);
    setFormErrors({});
  };

  const handleFileDrop = async (type: 'trt' | 'unt', file: File) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const error = await validateCsvFile(file);
    const uploaded: UploadedFile = { file, name: file.name, sizeMB, error };
    if (type === 'trt') setTrtFile(uploaded);
    else setUntFile(uploaded);
  };

  const handleFileRemove = (type: 'trt' | 'unt') => {
    if (type === 'trt') setTrtFile(null);
    else setUntFile(null);
  };

  const handleRunSimulation = async () => {
    if (!trtFile || !untFile) return;

    const { parameters, errors } = buildParameters(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let runId: string | undefined;
    try {
      setSubmit({ phase: 'creating' });
      const created = await createRun({ file1: trtFile.file, file2: untFile.file }, parameters);
      runId = created.runId;

      // The two files upload in parallel; report them as one bar weighted by size.
      const loaded = { file1: 0, file2: 0 };
      const total = trtFile.file.size + untFile.file.size;
      const report = (key: 'file1' | 'file2', size: number) => (fraction: number) => {
        loaded[key] = fraction * size;
        setSubmit({ phase: 'uploading', progress: Math.round(((loaded.file1 + loaded.file2) / total) * 100) });
      };
      setSubmit({ phase: 'uploading', progress: 0 });
      await Promise.all([
        uploadFile(created.uploads.file1, trtFile.file, report('file1', trtFile.file.size)),
        uploadFile(created.uploads.file2, untFile.file, report('file2', untFile.file.size)),
      ]);

      setSubmit({ phase: 'starting' });
      await startRun(runId);
      router.push(`/runs/${runId}`);
    } catch (error) {
      // A failed start can still have launched the worker, so ask the API before reporting it.
      // Once the run has left CREATED its own page is the place to follow it, failure included.
      if (runId) {
        try {
          const run = await getRun(runId);
          if (run.status !== 'CREATED') {
            router.push(`/runs/${runId}`);
            return;
          }
        } catch {
          // Fall through to the original error.
        }
      }
      // Uploads cannot be repeated on the same run, so trying again starts a fresh one.
      setSubmit({ phase: 'idle', error: error instanceof Error ? error.message : 'Something went wrong.' });
    }
  };

  return (
    <StepLayout step={step}>
      {step === 1 && (
        <UploadFiles
          trtFile={trtFile}
          untFile={untFile}
          onFileDrop={handleFileDrop}
          onFileRemove={handleFileRemove}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <SetParameters
          trtFile={trtFile}
          untFile={untFile}
          formValues={formValues}
          formErrors={formErrors}
          submit={submit}
          onFormChange={handleFormChange}
          onLoadTestParameters={handleLoadTestParameters}
          onBack={() => setStep(1)}
          onNext={handleRunSimulation}
        />
      )}
    </StepLayout>
  );
}
