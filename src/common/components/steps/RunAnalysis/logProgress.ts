import { LogChunk } from '@/types';

// The API only reports progress at the start (20) and the end (100) of the analysis, so the
// steps in between are read off the lines MEDUSA prints as it reaches each one. The percentages
// follow how long each step took in a measured run; steps a run skips (stats, plot) are passed over.
const MILESTONES = [
  { marker: 'Started MEDUSA', progress: 35, message: 'Starting MEDUSA' },
  { marker: 'Mapping empiric guide-level', progress: 40, message: 'Mapping guide-level fold changes to rates' },
  { marker: 'Collapsing relative rates', progress: 45, message: 'Collapsing guides to gene level' },
  { marker: 'Calculating empiric pvalues', progress: 70, message: 'Calculating p-values' },
  { marker: 'Making plots', progress: 88, message: 'Making plots' },
  { marker: 'Done!', progress: 95, message: 'Analysis finished' },
  { marker: 'Uploading output files', progress: 97, message: 'Uploading output files' },
];

// The furthest step the log has reached, or null before MEDUSA has printed anything.
export function logProgress(chunks: LogChunk[]) {
  let reached = -1;
  for (const chunk of chunks) {
    for (const line of chunk.lines) {
      for (let i = MILESTONES.length - 1; i > reached; i--) {
        if (line.includes(MILESTONES[i].marker)) {
          reached = i;
          break;
        }
      }
    }
  }
  return reached === -1 ? null : MILESTONES[reached];
}
