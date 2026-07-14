'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Header from './Header';
import Sidebar from './Sidebar';
import InputParameters from './steps/InputParameters';
import Review from './steps/Review';
import RunAnalysis from './steps/RunAnalysis';
import Results from './steps/Results';
import { Step, FormValues, UploadedFile } from '@/types';

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
  const [step, setStep] = useState<Step>(1);
  const [trtFile, setTrtFile] = useState<UploadedFile | null>({ name: 'trt_vs_unt.csv', sizeMB: '12.4 MB' });
  const [untFile, setUntFile] = useState<UploadedFile | null>({ name: 'unt_vs_t0.csv', sizeMB: '11.8 MB' });
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM);

  const handleFormChange = (field: keyof FormValues, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileDrop = (type: 'trt' | 'unt', file: File) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    if (type === 'trt') setTrtFile({ name: file.name, sizeMB });
    else setUntFile({ name: file.name, sizeMB });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#f0f2f5' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, bgcolor: '#fff' }}>
        <Sidebar currentStep={step} />
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {step === 1 && (
            <InputParameters
              trtFile={trtFile}
              untFile={untFile}
              formValues={formValues}
              onFormChange={handleFormChange}
              onFileDrop={handleFileDrop}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Review
              trtFile={trtFile}
              untFile={untFile}
              formValues={formValues}
              onBack={() => setStep(1)}
              onRun={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <RunAnalysis
              onCancel={() => setStep(1)}
              onViewResults={() => setStep(4)}
            />
          )}
          {step === 4 && <Results onNewAnalysis={() => setStep(1)} />}
        </Box>
      </Box>
    </Box>
  );
}
