'use client';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ArrowForwardIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/KeyboardArrowLeft';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { buildParameters } from '@/common/parameters';
import { FormErrors, FormValues, RunMode, SubmitState, UploadedFile } from '@/types';
import FileSummary from './FileSummary';
import ParamField from './ParamField';
import GmSearchPreview from './GmSearchPreview';

type FieldConfig = { field: keyof FormValues; label: string; tooltip: string; placeholder: string };

const MODES: { mode: RunMode; title: string; description: string }[] = [
  {
    mode: 'full',
    title: 'Fully parameterized',
    description: "Every rate of the drug's response is known. Each gene gets one relative growth and death rate.",
  },
  {
    mode: 'gm',
    title: 'General mode',
    description:
      'Some or all of the rates are unknown. Needs the effective dose, and gives each gene a distribution of possible rates.',
  },
];

// Required in fully parameterized mode; in GM, any that are known narrow the search.
const DRUG_RATE_FIELDS: FieldConfig[] = [
  {
    field: 'grdrug1',
    label: 'Growth rate before death onset',
    tooltip: 'GRdrug1 — growth rate of treated cells before they start dying (1/doubling time)',
    placeholder: 'e.g. 0.015',
  },
  { field: 'do_val', label: 'Death onset time (hours)', tooltip: 'Do — when treated cells start dying', placeholder: 'e.g. 48' },
  {
    field: 'grdrug2',
    label: 'Growth rate after death onset',
    tooltip: 'GRdrug2 — growth rate of treated cells once they start dying (1/doubling time)',
    placeholder: 'e.g. 0.010',
  },
  {
    field: 'drdrug',
    label: 'Death rate after death onset',
    tooltip: 'DRdrug — lethal fraction / (T_end_tr − Do)',
    placeholder: 'e.g. 0.020',
  },
];

// `only` marks a parameter that just one mode reads; the other mode hides it. `gmPlaceholder`
// stands in for `placeholder` in general mode, where a blank means something else.
const ADVANCED_PARAMS: (FieldConfig & { only?: RunMode; gmPlaceholder?: string })[] = [
  { field: 't_start', label: 'T_start', tooltip: 'Assay start time (hours)', placeholder: '0' },
  {
    field: 'ed_err',
    label: 'ED_err',
    tooltip: 'Allowed difference between the measured and simulated ED. Wider matches more simulations',
    placeholder: '0.02',
    only: 'gm',
  },
  {
    field: 'sim_perm',
    label: 'sim_perm',
    tooltip:
      'Candidate values tried for each unknown rate. The search tests this to the power of the unknown rates, and simulates each match',
    placeholder: '10',
    only: 'gm',
  },
  {
    field: 'num_iter',
    label: 'num_iter',
    tooltip:
      'Resolution of each simulation, which has this many squared points. Left blank in general mode, the finest the worker can hold for the matching simulations is picked',
    placeholder: '1000',
    gmPlaceholder: 'auto',
  },
  {
    field: 'bootstraps',
    label: 'bootstraps',
    tooltip: 'Bootstraps for the empiric p-values',
    placeholder: '1000000',
    only: 'full',
  },
  {
    field: 'nont_id',
    label: 'nont_id',
    tooltip: 'Regular expression matching the non-targeting guides in the Gene column',
    placeholder: 'NONT',
  },
  {
    field: 'max_guides_nont',
    label: 'max_guides_nont',
    tooltip: 'Guides grouped into each non-targeting "gene". Defaults to the most guides any gene has',
    placeholder: '—',
  },
];
const ADVANCED_FIELDS = ADVANCED_PARAMS.map(({ field }) => field);

const SUBMIT_LABELS: Record<SubmitState['phase'], string> = {
  idle: 'Run Simulation',
  creating: 'Creating run…',
  uploading: 'Uploading files…',
  starting: 'Starting run…',
};

const sectionHeadingSx = { fontWeight: 600, fontSize: 15, mt: 4, mb: 0.5 };
const sectionNoteSx = { fontSize: 13, color: '#888', mb: 2 };

interface Props {
  trtFile: UploadedFile | null;
  untFile: UploadedFile | null;
  formValues: FormValues;
  formErrors: FormErrors;
  // Set when the files came from a template, which picked the mode.
  modeLocked: boolean;
  submit: SubmitState;
  onFormChange: (field: keyof FormValues, value: string) => void;
  // TEMP
  onLoadTestParameters: () => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SetParameters({
  trtFile,
  untFile,
  formValues,
  formErrors,
  modeLocked,
  submit,
  onFormChange,
  onLoadTestParameters,
  onBack,
  onNext,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // An error on a collapsed field would be invisible, so errors force the section open.
  const hasAdvancedErrors = Object.keys(formErrors).some((field) => ADVANCED_FIELDS.includes(field as keyof FormValues));
  const advancedOpen = showAdvanced || hasAdvancedErrors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const submitting = submit.phase !== 'idle';
  const { mode } = formValues;
  // What general mode will simulate, from the parameters as they stand.
  const gmPlan = useMemo(() => (mode === 'gm' ? buildParameters(formValues).gm : null), [mode, formValues]);

  const drugRateGrid = (
    <Grid container spacing={3}>
      {DRUG_RATE_FIELDS.map(({ field, label, tooltip, placeholder }) => (
        <Grid key={field} size={{ xs: 12, sm: 6, md: 3 }}>
          <ParamField
            label={label}
            tooltip={tooltip}
            placeholder={placeholder}
            value={formValues[field] as string}
            onChange={(v) => onFormChange(field, v)}
            error={formErrors[field]}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Uploaded files summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Input Files</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FileSummary label="Drug tested vs untreated" file={trtFile} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FileSummary label="Untreated vs baseline" file={untFile} />
          </Grid>
        </Grid>
      </Paper>

      {/* Parameters */}
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 5 }, mb: 3, bgcolor: '#f5f6f7', borderColor: '#e5e7ea' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Set Parameters</Typography>
        <Typography sx={{ fontSize: 13, color: '#888', mb: 3 }}>
          Choose how MEDUSA should run, then fill in what that mode needs.
        </Typography>

        {/* Mode */}
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={mode}
          disabled={modeLocked || submitting}
          onChange={(_, picked: RunMode | null) => picked && onFormChange('mode', picked)}
          sx={{ bgcolor: '#fff' }}
        >
          {MODES.map(({ mode: option, title, description }) => (
            <ToggleButton
              key={option}
              value={option}
              sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, p: 2, textAlign: 'left', textTransform: 'none' }}
            >
              <Typography component="span" sx={{ display: 'block', fontWeight: 600, fontSize: 14 }}>
                {title}
              </Typography>
              <Typography component="span" sx={{ display: 'block', fontSize: 12.5, color: '#666', lineHeight: 1.4 }}>
                {description}
              </Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {modeLocked && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1, color: '#888' }}>
            <LockOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: 12.5 }}>
              Set by the template. Upload your own files to choose the mode.
            </Typography>
          </Box>
        )}

        {/* Required by both modes */}
        <Typography sx={sectionHeadingSx}>Screen</Typography>
        <Typography sx={sectionNoteSx}>Required in both modes.</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ParamField
              label="Untreated net population growth rate"
              tooltip="NPG — 1/doubling time"
              placeholder="e.g. 0.0231"
              value={formValues.npg}
              onChange={(v) => onFormChange('npg', v)}
              width={325}
              error={formErrors.npg}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <ParamField
              label="Untreated assay end time (hours)"
              tooltip="T_end_unt"
              placeholder="e.g. 120"
              value={formValues.t_end_unt}
              onChange={(v) => onFormChange('t_end_unt', v)}
              width={325}
              error={formErrors.t_end_unt}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <ParamField
              label="Drug treated assay end time (hours)"
              tooltip="T_end_tr"
              placeholder="e.g. 120"
              value={formValues.t_end_tr}
              onChange={(v) => onFormChange('t_end_tr', v)}
              width={325}
              error={formErrors.t_end_tr}
            />
          </Grid>
        </Grid>

        {/* Required by the mode picked */}
        {mode === 'full' ? (
          <>
            <Typography sx={sectionHeadingSx}>Drug response rates</Typography>
            <Typography sx={sectionNoteSx}>All four are required in fully parameterized mode.</Typography>
            {drugRateGrid}
          </>
        ) : (
          <>
            <Typography sx={sectionHeadingSx}>Effective dose</Typography>
            <Typography sx={sectionNoteSx}>
              Required in general mode: the treated cells&apos; viability relative to the untreated at the end. MEDUSA
              simulates the rate combinations that end at it, taking both arms down at the treated end time.
            </Typography>
            <ParamField
              label="Effective dose"
              tooltip="ED — relative viability of treated cells at the assay endpoint"
              placeholder="e.g. 0.25"
              value={formValues.ed}
              onChange={(v) => onFormChange('ed', v)}
              width={325}
              error={formErrors.ed}
            />
            <Typography sx={sectionHeadingSx}>Known drug response rates (optional)</Typography>
            <Typography sx={sectionNoteSx}>
              Fill in any you know to narrow the search. Leave at least one blank: with all four, MEDUSA runs
              fully parameterized.
            </Typography>
            {drugRateGrid}
            <GmSearchPreview plan={gmPlan} />
          </>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#888' }}>
            Advanced Parameters (optional)
          </Typography>
          <Switch
            checked={advancedOpen}
            onChange={(e) => setShowAdvanced(e.target.checked)}
          />
        </Box>

        <Collapse in={advancedOpen}>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2}>
            {ADVANCED_PARAMS.filter(({ only }) => !only || only === mode).map(
              ({ field, label, tooltip, placeholder, gmPlaceholder }) => (
                <Grid key={field} size={{ xs: 6, sm: 4, md: 2 }}>
                  <ParamField
                    label={label}
                    tooltip={tooltip}
                    placeholder={mode === 'gm' ? (gmPlaceholder ?? placeholder) : placeholder}
                    value={formValues[field] as string}
                    onChange={(v) => onFormChange(field, v)}
                    error={formErrors[field]}
                  />
                </Grid>
              ),
            )}

            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <TextField
                select
                fullWidth
                label="gene_level"
                size="small"
                value={formValues.gene_level}
                onChange={(e) => onFormChange('gene_level', e.target.value)}
                sx={{ bgcolor: '#fff' }}
              >
                {['median', 'mean', 'min', 'max'].map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>

          </Grid>
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
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={submitting}>
            Back
          </Button>
          {/* TEMP: remove once testing is done */}
          <Button variant="text" onClick={onLoadTestParameters} disabled={submitting}>
            Load test parameters
          </Button>
        </Box>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          disabled={submitting}
          disableElevation
          sx={{ px: 3 }}
        >
          {SUBMIT_LABELS[submit.phase]}
        </Button>
      </Box>
    </Box>
  );
}
