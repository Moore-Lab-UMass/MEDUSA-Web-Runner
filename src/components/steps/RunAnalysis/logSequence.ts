export type LogStatus = 'completed' | 'in_progress' | 'pending';

export interface LogItem {
  label: string;
  status: LogStatus;
}

export const LOG_SEQUENCE: LogItem[][] = [
  [
    { label: 'Validating input files', status: 'in_progress' },
    { label: 'Preparing data', status: 'pending' },
    { label: 'Simulating parameter space', status: 'pending' },
    { label: 'Calculating gene scores', status: 'pending' },
    { label: 'Bootstrapping statistics', status: 'pending' },
    { label: 'Generating plots', status: 'pending' },
    { label: 'Finalizing results', status: 'pending' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'in_progress' },
    { label: 'Simulating parameter space', status: 'pending' },
    { label: 'Calculating gene scores', status: 'pending' },
    { label: 'Bootstrapping statistics', status: 'pending' },
    { label: 'Generating plots', status: 'pending' },
    { label: 'Finalizing results', status: 'pending' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'completed' },
    { label: 'Simulating parameter space', status: 'in_progress' },
    { label: 'Calculating gene scores', status: 'pending' },
    { label: 'Bootstrapping statistics', status: 'pending' },
    { label: 'Generating plots', status: 'pending' },
    { label: 'Finalizing results', status: 'pending' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'completed' },
    { label: 'Simulating parameter space', status: 'completed' },
    { label: 'Calculating gene scores', status: 'in_progress' },
    { label: 'Bootstrapping statistics', status: 'pending' },
    { label: 'Generating plots', status: 'pending' },
    { label: 'Finalizing results', status: 'pending' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'completed' },
    { label: 'Simulating parameter space', status: 'completed' },
    { label: 'Calculating gene scores', status: 'completed' },
    { label: 'Bootstrapping statistics', status: 'in_progress' },
    { label: 'Generating plots', status: 'pending' },
    { label: 'Finalizing results', status: 'pending' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'completed' },
    { label: 'Simulating parameter space', status: 'completed' },
    { label: 'Calculating gene scores', status: 'completed' },
    { label: 'Bootstrapping statistics', status: 'completed' },
    { label: 'Generating plots', status: 'in_progress' },
    { label: 'Finalizing results', status: 'pending' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'completed' },
    { label: 'Simulating parameter space', status: 'completed' },
    { label: 'Calculating gene scores', status: 'completed' },
    { label: 'Bootstrapping statistics', status: 'completed' },
    { label: 'Generating plots', status: 'completed' },
    { label: 'Finalizing results', status: 'in_progress' },
  ],
  [
    { label: 'Validating input files', status: 'completed' },
    { label: 'Preparing data', status: 'completed' },
    { label: 'Simulating parameter space', status: 'completed' },
    { label: 'Calculating gene scores', status: 'completed' },
    { label: 'Bootstrapping statistics', status: 'completed' },
    { label: 'Generating plots', status: 'completed' },
    { label: 'Finalizing results', status: 'completed' },
  ],
];

export const PROGRESS_STEPS = [5, 20, 35, 52, 70, 82, 94, 100];
