'use client';
import { useEffect, useState } from 'react';
import { getOutputUrls } from '@/common/medusaApi';
import { deriveMode } from '@/common/parameters';
import { parseResults, RunResults, summaryOutput } from '@/common/results';
import { RunMode, RunParameters } from '@/types';

export type RunResultsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  // results is null when the run wrote no summary CSV (GM mode without stats).
  | { status: 'ready'; mode: RunMode; results: RunResults | null };

/**
 * Loads a succeeded run's summary CSV once, and keeps the parsed rows for as long as the
 * consumer stays mounted. Signed URLs are used immediately and never stored.
 *
 * Does nothing until `parameters` has loaded and the run has succeeded.
 */
export function useRunResults(runId: string, parameters: RunParameters | null, succeeded: boolean): RunResultsState {
  const [state, setState] = useState<RunResultsState>({ status: 'loading' });

  useEffect(() => {
    if (!succeeded || !parameters) return;
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      try {
        const { outputs } = await getOutputUrls(runId, signal);
        const mode = deriveMode(parameters);
        const summary = summaryOutput(mode, outputs);

        let results: RunResults | null = null;
        if (summary) {
          const { filename, url } = summary;
          let response: Response;
          try {
            // Straight to GCS: the signature in the URL is the authorization, so no headers are added.
            response = await fetch(url, { signal });
          } catch (caught) {
            if (signal.aborted) return;
            throw new Error(`Could not download ${filename} from storage.`, { cause: caught });
          }
          if (!response.ok) throw new Error(`Could not download ${filename} (${response.status}).`);
          results = parseResults(mode, filename, await response.text(), parameters);
        }

        if (!signal.aborted) setState({ status: 'ready', mode, results });
      } catch (caught) {
        if (signal.aborted) return;
        setState({ status: 'error', message: caught instanceof Error ? caught.message : 'Could not load results.' });
      }
    };

    load();
    return () => controller.abort();
  }, [runId, parameters, succeeded]);

  return state;
}
