'use client';
import { ReactNode, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import { buildParameters, formMode } from '@/common/parameters';
import { FormErrors, FormValues, RunMode, SubmitState, UploadedFile } from '@/types';
import FileSummary from './FileSummary';
import ParamField from './ParamField';
import GmSearchPreview from './GmSearchPreview';
import GeneListField from './GeneListField';
import { sharedGenes } from '../UploadFiles/readGenes';
import RunModeLabel from './RunModeLabel';
import LoadTemplateButton from './LoadTemplateButton';
import { TemplateMode } from '@/common/templates';

type FieldConfig = {
  field: keyof FormValues;
  label: string;
  tooltip: string;
  options?: string[];
};

const REQUIRED_FIELDS: FieldConfig[] = [
  {
    field: 'npg',
    label: 'Untreated net population growth rate',
    tooltip: '[NPG] growth baseline used to normalize treatment effects',
  },
  { field: 't_end_unt', label: 'Untreated assay end time (hours)', tooltip: '[T_end_unt] untreated endpoint time' },
  { field: 't_end_tr', label: 'Drug treated assay end time (hours)', tooltip: '[T_end_tr] treated endpoint time' },
];

// Laid out as medusaproject.org has them. The four drug parameters (*) all set run fully
// parameterized; in GM, any that are set narrow the search.
const OPTIONAL_FIELDS: FieldConfig[] = [
  { field: 't_start', label: 'Assay start time (hours)', tooltip: '[T_start] default is 0 hours' },
  { field: 'grdrug1', label: 'Treated growth rate before death onset*', tooltip: '[GRdrug1] pre-onset treated growth segment' },
  { field: 'do_val', label: 'Death onset time (hours)*', tooltip: '[Do] piecewise transition time' },
  { field: 'grdrug2', label: 'Treated growth rate after death onset*', tooltip: '[GRdrug2] post-onset treated growth segment' },
  { field: 'drdrug', label: 'Treated death rate after death onset*', tooltip: '[DRdrug] post-onset treated death segment' },
  {
    field: 'max_guides_nont',
    label: 'Max guides per synthetic nontarget gene',
    tooltip:
      '[max_guides_nont] the number of guides to assign to nontargeting genes. To assign a gene to nontargeting sgRNA, MEDUSA randomly assigns n number of random nont sgRNA to a gene. This is usually not specified, and defaults to max guide number per gene in the library (eg, 4). This parameter is useful in rare cases where a small number of genes in a library have many more sgRNA than the rest.',
  },
  {
    field: 'nont_id',
    label: 'Non-targeting guide ID',
    tooltip: '[nont_id] regular expression to identify non-targeting guides in the gene column',
  },
  {
    field: 'gene_level',
    label: 'Guide-to-gene aggregation',
    tooltip: '[gene_level] metric to collapse sgRNA to genes',
    options: ['median', 'mean', 'min', 'max'],
  },
];

const GM_FIELDS: FieldConfig[] = [
  {
    field: 'ed',
    label: 'Effective dose',
    tooltip:
      '[ED] relative viability at treated endpoint. Helps to define a list drug parameter values that could plausibly yield the observed population sizes at the assay endpoint',
  },
  {
    field: 'ed_err',
    label: 'Effective dose error',
    tooltip: '[ED_err] allowable difference between empiric ED and simulated ED. This parameter is only used if ED is specified.',
  },
  {
    field: 'sim_perm',
    label: 'Parameter space size',
    tooltip:
      '[sim_perm] candidate values tried for each unknown rate. The search tests this to the power of the unknown rates, and simulates each match',
  },
];

const TECHNICAL_FIELDS: FieldConfig[] = [
  {
    field: 'num_iter',
    label: '# of simulation iterations',
    tooltip:
      '[num_iter] higher values result in smoother estimates but longer run times. Left blank in the general model (GM), the finest the worker can hold for the matching simulations is picked',
  },
  {
    field: 'bootstraps',
    label: '# bootstrap iterations',
    tooltip: '[bootstraps] required to calculate statistics',
  },
];

// Everything in the collapsible Optional / Advanced section.
const ADVANCED_FIELDS: (keyof FormValues)[] = [
  ...[...OPTIONAL_FIELDS, ...GM_FIELDS, ...TECHNICAL_FIELDS].map(({ field }) => field),
  'gene_list',
];

// Names a field in the list of what stops the run.
const FIELD_LABELS = {
  ...Object.fromEntries(
    [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS, ...GM_FIELDS, ...TECHNICAL_FIELDS].map(({ field, label }) => [
      field,
      label.replace('*', ''),
    ]),
  ),
  gene_list: 'Genes to highlight',
} as Record<keyof FormValues, string>;

const RUN_LABELS: Record<RunMode, string> = { full: 'Run MEDUSA (FP)', gm: 'Run MEDUSA (GM)' };

const SUBMIT_LABELS: Record<Exclude<SubmitState['phase'], 'idle'>, string> = {
  creating: 'Creating run…',
  uploading: 'Uploading files…',
  starting: 'Starting run…',
};

const sectionHeadingSx = { fontWeight: 600, fontSize: 14, mt: 3, mb: 1.5 };
const sectionNoteSx = { fontSize: 13, color: '#888' };

// A bordered box with its title on the border, as medusaproject.org groups its parameters.
function ParamGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      component="fieldset"
      sx={{ m: 0, mt: 3, px: { xs: 2, sm: 2.5 }, pt: 1, pb: 3, border: '1px solid #dfe3e8', borderRadius: 2 }}
    >
      <Typography component="legend" sx={{ px: 1, fontWeight: 600, fontSize: 15 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function FieldGrid({
  fields,
  columns,
  formValues,
  formErrors,
  onFormChange,
}: {
  fields: FieldConfig[];
  // How many fields fit on a row at full width.
  columns: 2 | 3;
  formValues: FormValues;
  formErrors: FormErrors;
  onFormChange: (field: keyof FormValues, value: string) => void;
}) {
  return (
    <Grid container spacing={3}>
      {fields.map(({ field, label, tooltip, options }) => (
        <Grid key={field} size={{ xs: 12, sm: 6, md: 12 / columns }}>
          <ParamField
            label={label}
            tooltip={tooltip}
            options={options}
            value={formValues[field]}
            onChange={(v) => onFormChange(field, v)}
            error={formErrors[field]}
          />
        </Grid>
      ))}
    </Grid>
  );
}

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  formValues: FormValues;
  formErrors: FormErrors;
  submit: SubmitState;
  onFormChange: (field: keyof FormValues, value: string) => void;
  showAdvanced: boolean;
  onShowAdvancedChange: (open: boolean) => void;
  onLoadTemplateParameters: (mode: TemplateMode) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SetParameters({
  trtFile,
  untFile,
  formValues,
  formErrors,
  submit,
  onFormChange,
  showAdvanced,
  onShowAdvancedChange,
  onLoadTemplateParameters,
  onBack,
  onNext,
}: Props) {
  // An error on a collapsed field would be invisible, so errors force the section open.
  const hasAdvancedErrors = Object.keys(formErrors).some((field) => ADVANCED_FIELDS.includes(field as keyof FormValues));
  const advancedOpen = showAdvanced || hasAdvancedErrors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const submitting = submit.phase !== 'idle';
  // The parameters as they stand: the problems that would stop the run, and what general mode will
  // simulate (null when fully parameterized). With any problem, the run can't start in either mode.
  const { errors: problems, gm: gmPlan } = useMemo(() => buildParameters(formValues), [formValues]);
  const issues = Object.entries(problems).map(([field, message]) => `${FIELD_LABELS[field as keyof FormValues]}: ${message}`);
  const drugMode = formMode(formValues);
  const mode = issues.length === 0 ? drugMode : null;
  const gridProps = { formValues, formErrors, onFormChange };
  const pickableGenes = useMemo(
    () => sharedGenes(trtFile?.genes ?? [], untFile?.genes ?? [], formValues.nont_id.trim()),
    [trtFile, untFile, formValues.nont_id],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Uploaded files summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Input Files</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FileSummary
              label="Drug treated vs untreated"
              tooltip="[TvU] CSV file of log2 fold change of drug treated vs untreated"
              file={trtFile}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FileSummary
              label="Untreated vs baseline (timepoint 0)"
              tooltip="[UvT0] CSV file of log2 fold change of untreated vs baseline (timepoint 0)"
              file={untFile}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Parameters */}
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 5 }, mb: 3, bgcolor: '#f5f6f7', borderColor: '#e5e7ea' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Set Parameters</Typography>
            <Typography sx={{ fontSize: 13, color: '#888' }}>
              MEDUSA picks its model from the drug parameters marked * that are filled in.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <LoadTemplateButton disabled={submitting} onSelect={onLoadTemplateParameters} />
            <RunModeLabel mode={mode} issues={issues} />
          </Box>
        </Box>

        <ParamGroup title="Required Parameters">
          <FieldGrid fields={REQUIRED_FIELDS} columns={3} {...gridProps} />
        </ParamGroup>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#888' }}>
            Optional / Advanced Parameters
          </Typography>
          <Switch
            checked={advancedOpen}
            onChange={(e) => onShowAdvancedChange(e.target.checked)}
          />
        </Box>

        <Collapse in={advancedOpen}>
          <Divider sx={{ my: 3 }} />
          <FieldGrid fields={OPTIONAL_FIELDS} columns={3} {...gridProps} />

          <Typography sx={sectionHeadingSx}>General model (GM) settings</Typography>
          <FieldGrid fields={GM_FIELDS} columns={2} {...gridProps} />
          {drugMode === 'gm' && <GmSearchPreview plan={gmPlan} />}

          <Typography sx={sectionHeadingSx}>Technical simulation controls</Typography>
          <Typography sx={{ ...sectionNoteSx, mb: 1 }}>
            * If missing, MEDUSA runs the general model (GM) and effective dose is required.
          </Typography>
          <FieldGrid fields={TECHNICAL_FIELDS} columns={2} {...gridProps} />

          <Typography sx={sectionHeadingSx}>Plots</Typography>
          <GeneListField
            value={formValues.gene_list}
            onChange={(v) => onFormChange('gene_list', v)}
            error={formErrors.gene_list}
            genes={pickableGenes}
          />
        </Collapse>
      </Paper>

      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>Fix the highlighted parameters before running.</Alert>
      )}
      {submit.phase === 'idle' && submit.error && (
        <Alert severity="error" sx={{ mb: 2 }}>{submit.error}</Alert>
      )}
      {submit.phase === 'uploading' && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12.5, color: '#666', mb: 0.5 }}>
            Uploading input files · {submit.progress}%. Keep this window open until the run starts.
          </Typography>
          <LinearProgress variant="determinate" value={submit.progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          disabled={submitting || !mode}
          disableElevation
          sx={{ px: 3 }}
        >
          {submit.phase === 'idle' ? (mode ? RUN_LABELS[mode] : 'Run MEDUSA') : SUBMIT_LABELS[submit.phase]}
        </Button>
      </Box>
    </Box>
  );
}
