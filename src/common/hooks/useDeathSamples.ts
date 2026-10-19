'use client';
import { useEffect, useState } from 'react';
import { DeathSamples, loadDeathSamples, SIMULATIONS_FILE } from '@/common/deathSamples';
import { getOutputUrls } from '@/common/medusaApi';
import { deriveMode } from '@/common/parameters';
import { RunParameters } from '@/types';

export type DeathSamplesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; samples: DeathSamples };

/**
 * Loads a succeeded GM run's per-simulation death rates once, for its histograms, and keeps them
 * for as long as the consumer stays mounted. Signed URLs are used immediately and never stored.
 *
 * Does nothing until `parameters` has loaded and the run has succeeded, nor for a fully
 * parameterized run, which has a single simulation and so nothing to draw a histogram of.
 */
export function useDeathSamples(runId: string, parameters: RunParameters | null, succeeded: boolean): DeathSamplesState {
  const [state, setState] = useState<DeathSamplesState>({ status: 'loading' });
  const gm = parameters !== null && deriveMode(parameters) === 'gm';
  const nontId = parameters?.nont_id ?? 'NONT';

  useEffect(() => {
    if (!succeeded || !gm) return;
    const controller = new AbortController();
    const { signal } = controller;
    // Set by the cleanup alongside the abort. Nothing after an await touches state once it is true.
    let cancelled = false;

    const load = async () => {
      try {
        const { outputs } = await getOutputUrls(runId, signal);
        const output = outputs.find(({ filename }) => filename === SIMULATIONS_FILE);
        if (!output) throw new Error(`This run wrote no ${SIMULATIONS_FILE} to draw histograms from.`);
        const samples = await loadDeathSamples(output.url, nontId, signal);
        if (cancelled) return;
        setState({ status: 'ready', samples });
      } catch (caught) {
        if (cancelled) return;
        setState({ status: 'error', message: caught instanceof Error ? caught.message : 'Could not load the histograms.' });
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [runId, nontId, gm, succeeded]);

  return state;
}
