'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import UploadFiles from './steps/UploadFiles/UploadFiles';
import SetParameters from './steps/SetParameters/SetParameters';
import RunAnalysis from './steps/RunAnalysis/RunAnalysis';
import Results from './steps/Results/Results';
import { validateCsvFile } from './steps/UploadFiles/validateCsv';
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
  const [runCreatedAt, setRunCreatedAt] = useState('');

  const handleFormChange = (field: keyof FormValues, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileDrop = async (type: 'trt' | 'unt', file: File) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const error = await validateCsvFile(file);
    const uploaded: UploadedFile = { name: file.name, sizeMB, error };
    if (type === 'trt') setTrtFile(uploaded);
    else setUntFile(uploaded);
  };

  const handleFileRemove = (type: 'trt' | 'unt') => {
    if (type === 'trt') setTrtFile(null);
    else setUntFile(null);
  };

  const handleRunSimulation = () => {
    setRunCreatedAt(
      new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    );
    setStep(3);
  };

  const handleNewAnalysis = () => {
    setTrtFile(null);
    setUntFile(null);
    setStep(1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: '#fff', px: { xs: 2, sm: 3, md: 6, lg: 12, xl: 20 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: { md: 1 } }}>
        <Sidebar currentStep={step} />
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
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
              onNext={handleRunSimulation}
            />
          )}
          {step === 3 && (
            <RunAnalysis
              formValues={formValues}
              dateCreated={runCreatedAt}
              onCancel={() => setStep(1)}
              onBack={() => setStep(2)}
              onViewResults={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Results onBack={() => setStep(3)} onNewAnalysis={handleNewAnalysis} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
