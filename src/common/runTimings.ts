// TEMP: times one submission, to find where the gap between creating a run and its worker
// starting goes. The report is printed to the browser console when polling first sees the run
// leave the queue. Remove this file and its call sites (marked TEMP) once that is answered.
import { RunState } from '@/types';

type Timings = {
  entries: { label: string; ms: number; apiMs?: number }[];
  // As it appears in the request path, so URL-encoded.
  encodedRunId?: string;
  // Epoch ms, by this machine's clock, at which POST /start responded.
  startResponseAt?: number;
  // Seconds after that response at which polling first saw each status.
  firstSeen: Partial<Record<RunState['status'], number>>;
  reported: boolean;
};

// Module state rather than storage: going from the form to the run page is a client-side
// navigation, so it survives. A full reload in between drops it and nothing is reported.
let timings: Timings | null = null;

const format = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`);
const row = (label: string, value: string) => `${label.padEnd(42)} ${value}`;

export function beginRunTimings() {
  timings = { entries: [], firstSeen: {}, reported: false };
}

export function addRunTiming(label: string, ms: number) {
  timings?.entries.push({ label, ms });
}

// Called by the API client for every request. Only the two calls of a submission are kept.
// `serverTiming` is the proxy's header, carrying how long the MEDUSA API itself took.
export function noteApiRequest(method: string, path: string, ms: number, serverTiming: string | null) {
  if (!timings || method !== 'POST') return;
  const isCreate = path === '/runs';
  const isStart = path.endsWith('/start');
  if (!isCreate && !isStart) return;

  const upstream = serverTiming?.match(/upstream;dur=([\d.]+)/);
  timings.entries.push({
    label: isCreate ? 'POST /runs' : 'POST /runs/<runId>/start',
    ms,
    apiMs: upstream ? Number(upstream[1]) : undefined,
  });
  if (isStart) {
    timings.encodedRunId = path.split('/')[2];
    timings.startResponseAt = Date.now();
  }
}

// Called on every status poll of a run page.
export function noteRunStatus(run: RunState, pollIntervalMs: number) {
  if (!timings || timings.reported || timings.startResponseAt === undefined) return;
  if (timings.encodedRunId !== encodeURIComponent(run.runId)) return;

  const seconds = (Date.now() - timings.startResponseAt) / 1000;
  timings.firstSeen[run.status] ??= seconds;
  if (run.status === 'CREATED' || run.status === 'QUEUED') return;
  timings.reported = true;

  const queued = timings.firstSeen.QUEUED;
  const lines = [
    `MEDUSA run timings, run ${run.runId}`,
    ...timings.entries.map(({ label, ms, apiMs }) =>
      row(label, format(ms) + (apiMs === undefined ? '' : `   (MEDUSA API alone, without the web app's proxy: ${format(apiMs)})`)),
    ),
    row(
      `/start response -> first poll ${run.status}`,
      `${seconds.toFixed(1)} s   (polls are ${pollIntervalMs / 1000} s apart, so up to that much late` +
        (queued === undefined ? ')' : `; first saw QUEUED at +${queued.toFixed(1)} s)`),
    ),
  ];
  if (run.startedAt) {
    const startedAfter = (Date.parse(run.startedAt) - timings.startResponseAt) / 1000;
    lines.push(
      row(
        '/start response -> API startedAt',
        `${startedAfter.toFixed(1)} s   (the API's own timestamp against this machine's clock)`,
      ),
    );
  }
  console.log(lines.join('\n'));
}
