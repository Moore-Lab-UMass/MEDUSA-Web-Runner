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

export interface UploadedFile {
  name: string;
  sizeMB: string;
  error?: string;
}

export type Step = 1 | 2 | 3 | 4;

export interface ScatterPoint {
  x: number;
  y: number;
}
