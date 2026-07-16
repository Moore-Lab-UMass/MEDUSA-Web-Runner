export interface LogLine {
  time: string;
  marker: '✓' | '▶' | '•';
  text: string;
  revealAt: number;
}

export const PROGRESS_STEPS = [5, 20, 35, 52, 70, 82, 94, 100];

export const LOG_LINES: LogLine[] = [
  { time: '09:14:02', marker: '✓', text: 'Job accepted by scheduler', revealAt: 0 },
  { time: '09:14:03', marker: '✓', text: 'Input validation complete', revealAt: 0 },
  { time: '09:14:05', marker: '✓', text: 'Compute resources provisioned', revealAt: 0 },

  { time: '09:14:08', marker: '▶', text: 'Starting simulation', revealAt: 1 },
  { time: '09:14:12', marker: '•', text: 'Building initial state', revealAt: 1 },
  { time: '09:14:15', marker: '•', text: 'Loading environmental variables', revealAt: 1 },
  { time: '09:14:19', marker: '•', text: 'Generating baseline entities', revealAt: 1 },

  { time: '09:14:32', marker: '▶', text: 'Executing simulation cycles', revealAt: 2 },
  { time: '09:14:34', marker: '•', text: 'Cycle 125 / 10,000 complete', revealAt: 2 },
  { time: '09:14:41', marker: '•', text: 'Cycle 500 / 10,000 complete', revealAt: 2 },
  { time: '09:14:48', marker: '•', text: 'Cycle 1,000 / 10,000 complete', revealAt: 2 },
  { time: '09:14:52', marker: '✓', text: 'Checkpoint #1 saved', revealAt: 2 },

  { time: '09:15:04', marker: '▶', text: 'Calculating gene scores', revealAt: 3 },
  { time: '09:15:11', marker: '•', text: 'Scoring pro-death candidates', revealAt: 3 },
  { time: '09:15:19', marker: '•', text: 'Scoring anti-death candidates', revealAt: 3 },
  { time: '09:15:27', marker: '✓', text: 'Gene scores computed', revealAt: 3 },

  { time: '09:15:33', marker: '▶', text: 'Bootstrapping statistics', revealAt: 4 },
  { time: '09:15:41', marker: '•', text: 'Resampling iteration 250,000 / 1,000,000', revealAt: 4 },
  { time: '09:15:52', marker: '•', text: 'Resampling iteration 750,000 / 1,000,000', revealAt: 4 },
  { time: '09:16:04', marker: '✓', text: 'Bootstrap statistics complete', revealAt: 4 },

  { time: '09:16:09', marker: '▶', text: 'Generating plots', revealAt: 5 },
  { time: '09:16:14', marker: '•', text: 'Rendering phase plot', revealAt: 5 },
  { time: '09:16:18', marker: '•', text: 'Rendering p-value distribution', revealAt: 5 },
  { time: '09:16:22', marker: '✓', text: 'Plots generated', revealAt: 5 },

  { time: '09:16:27', marker: '▶', text: 'Finalizing results', revealAt: 6 },
  { time: '09:16:31', marker: '•', text: 'Packaging output files', revealAt: 6 },
  { time: '09:16:35', marker: '✓', text: 'Run complete', revealAt: 7 },
];
