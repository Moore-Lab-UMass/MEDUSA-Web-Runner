'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepLayout from './StepLayout';
import UploadFiles from './steps/UploadFiles/UploadFiles';
import SetParameters from './steps/SetParameters/SetParameters';
import { validateCsvFile } from './steps/UploadFiles/validateCsv';
import { createRun, getRun, startRun, uploadFile } from '@/common/medusaApi';
import { buildParameters } from '@/common/parameters';
import { addRunTiming, beginRunTimings } from '@/common/runTimings';
import { loadTemplateFiles, templateFormValues, TemplateMode } from '@/common/templates';
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

export default function MedusaApp() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [trtFile, setTrtFile] = useState<UploadedFile | null>(null);
  const [untFile, setUntFile] = useState<UploadedFile | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submit, setSubmit] = useState<SubmitState>({ phase: 'idle' });
  const [templateLoading, setTemplateLoading] = useState<TemplateMode | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const handleFormChange = (field: keyof FormValues, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    // The ED / drug-parameter rule spans several fields, so one edit can resolve errors on others.
    setFormErrors({});
  };

  // TEMP
  const handleLoadTestParameters = () => {
    setFormValues(templateFormValues('full', DEFAULT_FORM));
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

  // Explicit args let the template flow run immediately on freshly fetched files/values instead
  // of waiting on state updates to land; the "Run Simulation" button relies on the state defaults.
  const handleRunSimulation = async (
    trt: UploadedFile | null = trtFile,
    unt: UploadedFile | null = untFile,
    values: FormValues = formValues,
  ) => {
    if (!trt || !unt) return;

    const { parameters, errors } = buildParameters(values);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // TEMP: see src/common/runTimings.ts.
    beginRunTimings();
    const timed = async (label: string, work: Promise<unknown>) => {
      const start = performance.now();
      await work;
      addRunTiming(label, performance.now() - start);
    };

    let runId: string | undefined;
    try {
      setSubmit({ phase: 'creating' });
      const created = await createRun({ file1: trt.file, file2: unt.file }, parameters);
      runId = created.runId;

      // The two files upload in parallel; report them as one bar weighted by size.
      const loaded = { file1: 0, file2: 0 };
      const total = trt.file.size + unt.file.size;
      const report = (key: 'file1' | 'file2', size: number) => (fraction: number) => {
        loaded[key] = fraction * size;
        setSubmit({ phase: 'uploading', progress: Math.round(((loaded.file1 + loaded.file2) / total) * 100) });
      };
      setSubmit({ phase: 'uploading', progress: 0 });
      await timed(
        'Both uploads, in parallel, wall clock',
        Promise.all([
          timed(
            `Upload file1 (${trt.sizeMB})`,
            uploadFile(created.uploads.file1, trt.file, report('file1', trt.file.size)),
          ),
          timed(
            `Upload file2 (${unt.sizeMB})`,
            uploadFile(created.uploads.file2, unt.file, report('file2', unt.file.size)),
          ),
        ]),
      );

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

  const handleUseTemplate = async (mode: TemplateMode) => {
    setTemplateError(null);
    setTemplateLoading(mode);
    try {
      const { trt, unt } = await loadTemplateFiles();
      const values = templateFormValues(mode, DEFAULT_FORM);
      setTrtFile(trt);
      setUntFile(unt);
      setFormValues(values);
      setFormErrors({});
      setStep(2);
      setTemplateLoading(null);
      // Fully parameterized mode is the "just show me" demo; general mode lands on Set
      // Parameters so the sample ED value is visible before the user runs it.
      if (mode === 'full') await handleRunSimulation(trt, unt, values);
    } catch (error) {
      setTemplateLoading(null);
      setTemplateError(error instanceof Error ? error.message : 'Could not load the template.');
    }
  };

  // The stepper follows the Back and Next buttons: no going back mid-submit, no going on without
  // two valid files. Running and results belong to a run, which this page has yet to make.
  const filesReady = !!trtFile && !!untFile && !trtFile.error && !untFile.error;
  const links = {
    1: submit.phase === 'idle' ? () => setStep(1) : undefined,
    2: filesReady ? () => setStep(2) : undefined,
  };

  return (
    <StepLayout step={step} links={links}>
      {step === 1 && (
        <UploadFiles
          trtFile={trtFile}
          untFile={untFile}
          onFileDrop={handleFileDrop}
          onFileRemove={handleFileRemove}
          onNext={() => setStep(2)}
          templateLoading={templateLoading}
          templateError={templateError}
          onUseTemplate={handleUseTemplate}
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
          onNext={() => handleRunSimulation()}
        />
      )}
    </StepLayout>
  );
}
