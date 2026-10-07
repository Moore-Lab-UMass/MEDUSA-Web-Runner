export interface FormValues {
  npg: string;
  t_end_unt: string;
  t_end_tr: string;
  t_start: string;
  ed: string;
  grdrug1: string;
  do_val: string;
  grdrug2: string;
  drdrug: string;
  ed_err: string;
  sim_perm: string;
  num_iter: string;
  gene_level: string;
  nont_id: string;
  max_guides_nont: string;
  bootstraps: string;
  stats: boolean;
  plot: boolean;
}

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export interface UploadedFile {
  file: File;
  name: string;
  sizeMB: string;
  error?: string;
}

export type Step = 1 | 2 | 3 | 4;

// Where a submission is between "Run Simulation" and landing on the run page.
export type SubmitState =
  | { phase: 'idle'; error?: string }
  | { phase: 'creating' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'starting' };

// Parameters as the MEDUSA API stores them: case-sensitive keys, real numbers and booleans,
// and optional values left out rather than sent as null or "".
export interface RunParameters {
  NPG: number;
  T_end_unt: number;
  T_end_tr: number;
  T_start?: number;
  GRdrug1?: number;
  Do?: number;
  GRdrug2?: number;
  DRdrug?: number;
  ED?: number;
  ED_err?: number;
  sim_perm?: number;
  num_iter?: number;
  bootstraps?: number;
  max_guides_nont?: number;
  out_intermediate?: boolean;
  stats?: boolean;
  plot?: boolean;
  gene_list?: string[];
  gene_level?: 'median' | 'mean' | 'min' | 'max';
  nont_id?: string;
}

// "full" supplies all four drug parameters; anything less is GM and requires ED.
export type RunMode = 'full' | 'gm';

export type RunStatus = 'CREATED' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface RunState {
  runId: string;
  status: RunStatus;
  stage: string;
  progress: number;
  latestMessage: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

export interface UploadTarget {
  method: string;
  url: string;
  contentType: string;
  headers: Record<string, string>;
}

export interface CreatedRun {
  runId: string;
  status: RunStatus;
  uploads: { file1: UploadTarget; file2: UploadTarget };
}

export interface LogChunk {
  sequence: number;
  createdAt: string;
  lines: string[];
}

export interface RunOutput {
  filename: string;
  url: string;
}
