import Alert from '@mui/material/Alert';
import { GmPlan } from '@/common/parameters';
import { MAX_GM_SIMULATIONS } from '@/common/worker';

const fmt = (value: number) => value.toLocaleString();

// What a general mode run will simulate, kept up to date as the parameters change, so a search
// that cannot run is plain before Run MEDUSA is pressed.
export default function GmSearchPreview({ plan }: { plan: GmPlan | null }) {
  if (!plan) {
    return (
      <Alert severity="info" sx={{ mt: 3 }}>
        Fill in NPG, the treated end time and the effective dose to see what the general model (GM) will simulate.
      </Alert>
    );
  }
  const { combinations, matches, numIter, maxNumIter, picked } = plan;
  if (matches === null) {
    return (
      <Alert severity="warning" sx={{ mt: 3 }}>
        {fmt(combinations)} rate combinations to test: too many to finish in the worker&apos;s time. Lower sim_perm,
        or fill in a known rate.
      </Alert>
    );
  }
  if (matches === 0) {
    return (
      <Alert severity="warning" sx={{ mt: 3 }}>
        None of the {fmt(combinations)} rate combinations ends within ED_err of the effective dose, so there is
        nothing to simulate. Widen ED_err, raise sim_perm, or check the known rates.
      </Alert>
    );
  }
  if (maxNumIter === null || matches > MAX_GM_SIMULATIONS) {
    return (
      <Alert severity="warning" sx={{ mt: 3 }}>
        {fmt(matches)} of {fmt(combinations)} rate combinations match, past the {fmt(MAX_GM_SIMULATIONS)} simulations
        that can run. Lower sim_perm or ED_err, or fill in a known rate.
      </Alert>
    );
  }
  if (numIter === null) return null;
  if (numIter > maxNumIter) {
    return (
      <Alert severity="warning" sx={{ mt: 3 }}>
        {fmt(matches)} simulations match, which the worker can hold at num_iter {fmt(maxNumIter)} at most, not{' '}
        {fmt(numIter)}. Lower num_iter, or leave it blank to have it picked.
      </Alert>
    );
  }
  return (
    <Alert severity="info" sx={{ mt: 3 }}>
      {fmt(matches)} of {fmt(combinations)} rate combinations match the effective dose, so MEDUSA will run{' '}
      {fmt(matches)} {matches === 1 ? 'simulation' : 'simulations'} at num_iter {fmt(numIter)}
      {picked ? ', the finest the worker can hold for that many.' : '.'}
    </Alert>
  );
}
