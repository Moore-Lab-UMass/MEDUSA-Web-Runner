'use client';
import { useEffect, useState } from 'react';
import { getOutputUrls } from '@/common/medusaApi';
import { deriveMode } from '@/common/parameters';
import { PhaseSurface, readSurface, SIMTABLE } from '@/common/phaseSurface';
import { parseResults, RunResults, summaryOutput } from '@/common/results';
import { RunMode, RunParameters } from '@/types';

export type RunResultsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  // results is null when the run wrote no summary CSV (GM mode without stats).
  // surface is the phase diagram's background, which arrives after the results. It is null
  // when the run wrote no simtable.csv, or the file could not be read.
  | { status: 'ready'; mode: RunMode; results: RunResults | null; surface: PhaseSurface | 'loading' | null };

/**
 * Loads a succeeded run's summary CSV once, then its simulation surface if it has one, and keeps
 * what was parsed for as long as the consumer stays mounted. Signed URLs are used immediately
 * and never stored.
 *
 * Does nothing until `parameters` has loaded and the run has succeeded.
 */
export function useRunResults(runId: string, parameters: RunParameters | null, succeeded: boolean): RunResultsState {
  const [state, setState] = useState<RunResultsState>({ status: 'loading' });

  useEffect(() => {
    if (!succeeded || !parameters) return;
    const controller = new AbortController();
    const { signal } = controller;
    // Set by the cleanup alongside the abort. Nothing after an await touches state once it is true.
    let cancelled = false;

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
            if (cancelled) return;
            throw new Error(`Could not download ${filename} from storage.`, { cause: caught });
          }
          if (!response.ok) throw new Error(`Could not download ${filename} (${response.status}).`);
          results = parseResults(mode, filename, await response.text(), parameters);
        }

        if (cancelled) return;
        // Only a fully parameterized run's phase diagram draws the surface.
        const simtable = results?.mode === 'full' ? outputs.find(({ filename }) => filename === SIMTABLE) : undefined;
        setState({ status: 'ready', mode, results, surface: simtable ? 'loading' : null });
        if (!simtable) return;

        // The results are already showing, and the diagram reads without its background, so a
        // surface that fails to load is left out rather than reported as the results failing.
        const surface = await fetch(simtable.url, { signal })
          .then((response) => (response.ok ? readSurface(response) : null))
          .catch(() => null);
        if (cancelled) return;
        setState({ status: 'ready', mode, results, surface });
      } catch (caught) {
        if (cancelled) return;
        setState({ status: 'error', message: caught instanceof Error ? caught.message : 'Could not load results.' });
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [runId, parameters, succeeded]);

  return state;
}
