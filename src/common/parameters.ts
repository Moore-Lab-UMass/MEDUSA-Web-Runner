import { FormErrors, FormValues, RunMode, RunParameters } from '@/types';

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

// Turns the form's strings into the API's parameter object, mirroring the API's own validation
// (medusa-api/src/schemas/run.ts) so mistakes surface on the field instead of as a 422.
export function buildParameters(form: FormValues): { parameters: RunParameters; errors: FormErrors } {
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

  const GRdrug1 = number('grdrug1', 'nonnegative');
  const Do = number('do_val', 'nonnegative');
  const GRdrug2 = number('grdrug2', 'nonnegative');
  const DRdrug = number('drdrug', 'nonnegative');
  const ED = number('ed', 'any');

  // All four drug parameters select the fully parameterized mode. Short of that the run is GM,
  // which cannot go ahead without ED.
  const blankDrugFields = DRUG_FIELDS.filter((field) => form[field].trim() === '');
  if (blankDrugFields.length > 0 && form.ed.trim() === '') {
    if (blankDrugFields.length === DRUG_FIELDS.length) {
      errors.ed = 'Required unless GRdrug1, Do, GRdrug2 and DRdrug are all set';
    } else {
      for (const field of blankDrugFields) errors[field] = 'Set all four drug parameters, or set ED';
    }
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
    ED_err: number('ed_err', 'any'),
    sim_perm: count('sim_perm'),
    num_iter: count('num_iter'),
    bootstraps: count('bootstraps'),
    max_guides_nont: count('max_guides_nont'),
    gene_level,
    nont_id: nont_id || undefined,
    stats: form.stats,
    plot: form.plot,
  };

  // JSON.stringify drops undefined, but the object is also used directly, so strip them here.
  for (const key of Object.keys(parameters) as (keyof RunParameters)[]) {
    if (parameters[key] === undefined) delete parameters[key];
  }

  return { parameters, errors };
}
