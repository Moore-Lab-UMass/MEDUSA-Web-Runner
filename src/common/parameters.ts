import { FormErrors, FormValues, RunMode, RunParameters } from '@/types';
import { DEFAULT_ED_ERR, DEFAULT_SIM_PERM, gmSearch, largestFittingNumIter } from './gmSearch';
import { MAX_GM_COMBINATIONS, MAX_GM_SIMULATIONS } from './worker';

const DRUG_FIELDS = ['grdrug1', 'do_val', 'grdrug2', 'drdrug'] as const;
const GENE_LEVELS = ['median', 'mean', 'min', 'max'] as const;

// Blank means "not supplied", which is different from zero.
function parseNumber(value: string): number | undefined | null {
  const text = value.trim();
  if (text === '') return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function deriveMode(parameters: RunParameters): RunMode {
  const { GRdrug1, Do, GRdrug2, DRdrug } = parameters;
  return [GRdrug1, Do, GRdrug2, DRdrug].every((value) => value !== undefined) ? 'full' : 'gm';
}

// What a general mode run will do, worked out before it is submitted.
export interface GmPlan {
  combinations: number;
  // Null when there were too many combinations to test.
  matches: number | null;
  // The num_iter the run is sent with: the one asked for, or the finest that fits.
  numIter: number | null;
  // The finest num_iter the worker can hold the matching simulations at. Null when none fits.
  maxNumIter: number | null;
  // True when the form left num_iter for the site to pick.
  picked: boolean;
}

const fmt = (value: number) => value.toLocaleString();

// Turns the form's strings into the API's parameter object, mirroring the API's own validation
// (medusa-api/src/schemas/run.ts) so mistakes surface on the field instead of as a 422. A general
// mode run is also checked against what the worker can hold, which the API does not do: past
// that, the worker is killed without reporting it, and the run never finishes.
export function buildParameters(form: FormValues): {
  parameters: RunParameters;
  errors: FormErrors;
  gm: GmPlan | null;
} {
  const errors: FormErrors = {};

  const number = (field: keyof FormValues, rule: 'positive' | 'nonnegative' | 'any', required = false) => {
    const value = parseNumber(form[field] as string);
    if (value === undefined) {
      if (required) errors[field] = 'Required';
      return undefined;
    }
    if (value === null) {
      errors[field] = 'Enter a number';
      return undefined;
    }
    if (rule === 'positive' && value <= 0) {
      errors[field] = 'Must be greater than 0';
      return undefined;
    }
    if (rule === 'nonnegative' && value < 0) {
      errors[field] = 'Cannot be negative';
      return undefined;
    }
    return value;
  };

  const count = (field: keyof FormValues) => {
    const value = number(field, 'positive');
    if (value !== undefined && !Number.isSafeInteger(value)) {
      errors[field] = 'Enter a whole number';
      return undefined;
    }
    return value;
  };

  const NPG = number('npg', 'positive', true);
  const T_end_unt = number('t_end_unt', 'positive', true);
  const T_end_tr = number('t_end_tr', 'positive', true);
  const T_start = number('t_start', 'any');
  if (T_end_unt !== undefined && (T_start ?? 0) >= T_end_unt) {
    errors.t_start = 'Must be less than the untreated end time';
  }

  // MEDUSA has no mode flag: it runs fully parameterized when all four drug parameters are set,
  // and GM otherwise. So the mode picked decides which of them are required. GM uses any it is
  // given to narrow its search, but needs ED, and at least one of the four left out.
  const fullMode = form.mode === 'full';
  const GRdrug1 = number('grdrug1', 'nonnegative', fullMode);
  const Do = number('do_val', 'nonnegative', fullMode);
  const GRdrug2 = number('grdrug2', 'nonnegative', fullMode);
  const DRdrug = number('drdrug', 'nonnegative', fullMode);
  if (!fullMode && [GRdrug1, Do, GRdrug2, DRdrug].every((value) => value !== undefined)) {
    for (const field of DRUG_FIELDS) errors[field] = 'Leave at least one blank in general mode';
  }

  // Parameters only one mode reads are left out of the other, as the form hides them.
  // ED is a relative viability: treated cells over untreated at the end.
  const ED = fullMode ? undefined : number('ed', 'positive', true);
  const ED_err = fullMode ? undefined : number('ed_err', 'nonnegative');
  const sim_perm = fullMode ? undefined : count('sim_perm');
  const bootstraps = fullMode ? count('bootstraps') : undefined;
  let num_iter = count('num_iter');

  // General mode simulates every combination of candidate rates that ends at ED. Too many, and the
  // worker runs out of time or memory; none, and MEDUSA fails. num_iter, the resolution of each
  // simulation, is what is left to fit them in, so a blank one is picked here rather than left to
  // MEDUSA's default of 1000, which only a handful of simulations fit.
  let gm: GmPlan | null = null;
  const searchable =
    !fullMode &&
    NPG !== undefined &&
    T_end_tr !== undefined &&
    ED !== undefined &&
    ![...DRUG_FIELDS, 'ed_err', 'sim_perm', 't_start'].some((field) => errors[field as keyof FormValues]);
  if (searchable) {
    const { combinations, matches } = gmSearch({
      NPG,
      T_end_tr,
      T_start: T_start ?? 0,
      GRdrug1,
      Do,
      GRdrug2,
      DRdrug,
      ED,
      ED_err: ED_err ?? DEFAULT_ED_ERR,
      sim_perm: sim_perm ?? DEFAULT_SIM_PERM,
    });
    const fitting = matches === null ? null : largestFittingNumIter(matches);
    const picked = num_iter === undefined;
    if (matches === null) {
      errors.sim_perm = `Gives ${fmt(combinations)} combinations to test, past the ${fmt(MAX_GM_COMBINATIONS)} the worker has time for. Lower it, or fill in a known rate.`;
    } else if (matches === 0) {
      errors.ed = `None of the ${fmt(combinations)} rate combinations ends within ED_err of this. Widen ED_err, raise sim_perm, or check the known rates.`;
    } else if (matches > MAX_GM_SIMULATIONS || fitting === null) {
      errors.sim_perm = `${fmt(matches)} simulations match, past the ${fmt(MAX_GM_SIMULATIONS)} that can run. Lower sim_perm or ED_err, or fill in a known rate.`;
    } else if (num_iter === undefined) {
      num_iter = fitting;
    } else if (num_iter > fitting) {
      errors.num_iter = `At most ${fmt(fitting)} fits the worker with ${fmt(matches)} simulations`;
    }
    gm = { combinations, matches, numIter: num_iter ?? null, maxNumIter: fitting, picked };
  }

  const nont_id = form.nont_id.trim();
  if (nont_id.length > 256) errors.nont_id = 'Must be 256 characters or fewer';

  const gene_level = GENE_LEVELS.find((level) => level === form.gene_level);

  const parameters: RunParameters = {
    NPG: NPG ?? 0,
    T_end_unt: T_end_unt ?? 0,
    T_end_tr: T_end_tr ?? 0,
    T_start,
    GRdrug1,
    Do,
    GRdrug2,
    DRdrug,
    ED,
    ED_err,
    sim_perm,
    num_iter,
    bootstraps,
    max_guides_nont: count('max_guides_nont'),
    gene_level,
    nont_id: nont_id || undefined,
    // The site always asks for both: stats gives each mode its summary table, and GM draws no
    // histograms without it.
    stats: true,
    plot: true,
  };

  // JSON.stringify drops undefined, but the object is also used directly, so strip them here.
  for (const key of Object.keys(parameters) as (keyof RunParameters)[]) {
    if (parameters[key] === undefined) delete parameters[key];
  }

  return { parameters, errors, gm };
}
