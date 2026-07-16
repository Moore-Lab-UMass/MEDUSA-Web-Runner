'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Sidebar from './Sidebar';
import UploadFiles from './steps/UploadFiles';
import SetParameters from './steps/SetParameters';
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
  const [trtFile, setTrtFile] = useState<UploadedFile | null>(null);
  const [untFile, setUntFile] = useState<UploadedFile | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM);

  const handleFormChange = (field: keyof FormValues, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileDrop = (type: 'trt' | 'unt', file: File) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    if (type === 'trt') setTrtFile({ name: file.name, sizeMB });
    else setUntFile({ name: file.name, sizeMB });
  };

  const handleFileRemove = (type: 'trt' | 'unt') => {
    if (type === 'trt') setTrtFile(null);
    else setUntFile(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#fff', px: 25 }}>
      <Typography sx={{ px: 3, pt: 2.5, pb: 1, fontWeight: 600, fontSize: 15, color: '#222' }}>
        [MEDUSA Web runner]
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <Sidebar currentStep={step} />
        <Box sx={{ flex: 1, minWidth: 0, p: 3 }}>
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
              onFormChange={handleFormChange}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
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
