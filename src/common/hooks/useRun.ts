'use client';
import { useEffect, useState } from 'react';
import { getLogs, getParameters, getRun, isTerminal, LOG_PAGE_SIZE, MedusaApiError } from '@/common/medusaApi';
import { LogChunk, RunParameters, RunState, RunStatus } from '@/types';

const POLL_INTERVAL_MS = 2000;
const MAX_BACKOFF_MS = 30000;

/**
 * Loads a run's submitted parameters, then polls its status and log chunks until it reaches a
 * terminal status.
 *
 * Give the consuming component `key={runId}` so a different run starts from empty state.
 */
export function useRun(runId: string) {
  const [run, setRun] = useState<RunState | null>(null);
  const [parameters, setParameters] = useState<RunParameters | null>(null);
  // The status on the first successful poll, so a page reopened on a finished run can tell
  // that apart from one that watched it finish.
  const [initialStatus, setInitialStatus] = useState<RunStatus | null>(null);
  const [logs, setLogs] = useState<LogChunk[]>([]);
  // A failure that polling again will not fix, such as an unknown run ID.
  const [error, setError] = useState<Error | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // The log cursor is a chunk sequence, and lives with the chunks it produced.
    let after = 0;
    let failures = 0;
    let hasParameters = false;

    // Fetches pages until one comes back short (or, once the run is over, empty).
    const fetchLogs = async (untilEmpty: boolean) => {
      for (;;) {
        const page = await getLogs(runId, after, signal);
        if (signal.aborted) return;
        const cursor = after;
        const fresh = page.logs.filter((chunk) => chunk.sequence > cursor);
        if (fresh.length > 0) {
          setLogs((prev) => {
            const last = prev.at(-1)?.sequence ?? 0;
            return [...prev, ...fresh.filter((chunk) => chunk.sequence > last)];
          });
        }
        after = page.latestSequence;
        if (page.logs.length === 0) return;
        if (!untilEmpty && page.logs.length < LOG_PAGE_SIZE) return;
      }
    };

    const poll = async () => {
      let delay = POLL_INTERVAL_MS;
      try {
        // Parameters never change after creation, so they are fetched once, inside the retry loop.
        if (!hasParameters) {
          const { parameters } = await getParameters(runId, signal);
          if (signal.aborted) return;
          setParameters(parameters);
          hasParameters = true;
        }

        const state = await getRun(runId, signal);
        if (signal.aborted) return;
        setRun(state);
        setInitialStatus((prev) => prev ?? state.status);

        const terminal = isTerminal(state.status);
        await fetchLogs(terminal);
        if (signal.aborted) return;

        failures = 0;
        setConnectionLost(false);
        if (terminal) return;
      } catch (caught) {
        if (signal.aborted) return;
        if (caught instanceof MedusaApiError && (caught.status === 400 || caught.status === 404)) {
          setError(caught);
          return;
        }
        failures += 1;
        setConnectionLost(true);
        delay = Math.min(POLL_INTERVAL_MS * 2 ** failures, MAX_BACKOFF_MS);
      }
      // Scheduled only after the previous poll settles, so polls never overlap.
      timer = setTimeout(poll, delay);
    };

    poll();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [runId]);

  return { run, parameters, initialStatus, logs, error, connectionLost };
}
