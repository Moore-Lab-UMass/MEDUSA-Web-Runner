'use client';
import { useReducer, useState } from 'react';
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
  mode: 'full',
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
  // Blank leaves it to MEDUSA's 1000 when fully parameterized, and to the finest that fits in
  // general mode.
  num_iter: '',
  gene_level: 'median',
  nont_id: 'NONT',
  max_guides_nont: '',
  bootstraps: '1000000',
};

// What the two steps collect: the files, the parameters, and which step is showing.
type Setup = {
  step: 1 | 2;
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  formValues: FormValues;
  formErrors: FormErrors;
  // A template's files are for its mode, so it fixes the mode until a file is changed.
  modeLocked: boolean;
};

type SetupAction =
  | { type: 'goTo'; step: 1 | 2 }
  | { type: 'setFile'; which: 'trt' | 'unt'; file: UploadedFile | null }
  | { type: 'editForm'; field: keyof FormValues; value: string }
  | { type: 'fillForm'; values: FormValues }
  | { type: 'rejectForm'; errors: FormErrors }
  | { type: 'loadTemplate'; trt: UploadedFile; unt: UploadedFile; values: FormValues };

const INITIAL_SETUP: Setup = {
  step: 1,
  trtFile: null,
  untFile: null,
  formValues: DEFAULT_FORM,
  formErrors: {},
  modeLocked: false,
};

// Any change to the parameters clears their errors: the ED / drug-parameter rule spans several
// fields, so one edit can resolve errors on others.
function setupReducer(state: Setup, action: SetupAction): Setup {
  switch (action.type) {
    case 'goTo':
      return { ...state, step: action.step };
    case 'setFile':
      return action.which === 'trt'
        ? { ...state, trtFile: action.file, modeLocked: false }
        : { ...state, untFile: action.file, modeLocked: false };
    case 'editForm':
      return { ...state, formValues: { ...state.formValues, [action.field]: action.value }, formErrors: {} };
    case 'fillForm':
      return { ...state, formValues: action.values, formErrors: {} };
    case 'rejectForm':
      return { ...state, formErrors: action.errors };
    case 'loadTemplate':
      return {
        step: 2,
        trtFile: action.trt,
        untFile: action.unt,
        formValues: action.values,
        formErrors: {},
        modeLocked: true,
      };
  }
}

export default function MedusaApp() {
  const router = useRouter();
  const [{ step, trtFile, untFile, formValues, formErrors, modeLocked }, dispatch] = useReducer(
    setupReducer,
    INITIAL_SETUP,
  );
  const [submit, setSubmit] = useState<SubmitState>({ phase: 'idle' });
  const [template, setTemplate] = useState<{ loading: TemplateMode | null; error: string | null }>({
    loading: null,
    error: null,
  });
  const setStep = (to: 1 | 2) => dispatch({ type: 'goTo', step: to });

  const handleFormChange = (field: keyof FormValues, value: string) =>
    dispatch({ type: 'editForm', field, value });

  // TEMP: the sample parameters for whichever mode is picked.
  const handleLoadTestParameters = () =>
    dispatch({ type: 'fillForm', values: templateFormValues(formValues.mode, DEFAULT_FORM) });

  const handleFileDrop = async (type: 'trt' | 'unt', file: File) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const error = await validateCsvFile(file);
    dispatch({ type: 'setFile', which: type, file: { file, name: file.name, sizeMB, error } });
  };

  const handleFileRemove = (type: 'trt' | 'unt') => dispatch({ type: 'setFile', which: type, file: null });

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
      dispatch({ type: 'rejectForm', errors });
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
    setTemplate({ loading: mode, error: null });
    try {
      const { trt, unt } = await loadTemplateFiles();
      const values = templateFormValues(mode, DEFAULT_FORM);
      dispatch({ type: 'loadTemplate', trt, unt, values });
      setTemplate({ loading: null, error: null });
      // Fully parameterized mode is the "just show me" demo; general mode lands on Set
      // Parameters so the sample ED value is visible before the user runs it.
      if (mode === 'full') await handleRunSimulation(trt, unt, values);
    } catch (error) {
      setTemplate({ loading: null, error: error instanceof Error ? error.message : 'Could not load the template.' });
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
          templateLoading={template.loading}
          templateError={template.error}
          onUseTemplate={handleUseTemplate}
        />
      )}
      {step === 2 && (
        <SetParameters
          trtFile={trtFile}
          untFile={untFile}
          formValues={formValues}
          formErrors={formErrors}
          modeLocked={modeLocked}
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
