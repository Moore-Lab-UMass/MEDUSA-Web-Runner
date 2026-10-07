import { CreatedRun, LogChunk, RunOutput, RunParameters, RunState, RunStatus, UploadTarget } from '@/types';

// Same-origin proxy routes (src/app/api/medusa) that attach the API key server-side.
const BASE_URL = '/api/medusa';

// The API returns at most this many log chunks per page; a full page means more are waiting.
export const LOG_PAGE_SIZE = 100;

export class MedusaApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'MedusaApiError';
  }
}

export function isTerminal(status: RunStatus) {
  return status === 'SUCCEEDED' || status === 'FAILED' || status === 'CANCELLED';
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(BASE_URL + path, { ...init, cache: 'no-store' });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // A non-JSON body is reported through the status below.
  }

  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new MedusaApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? `Request failed (${response.status}).`,
    );
  }
  return body as T;
}

const runPath = (runId: string) => '/runs/' + encodeURIComponent(runId);

// file1 is treated vs untreated (TvU), file2 is untreated vs T0 (UvT0). Swapping them changes the analysis.
export function createRun(files: { file1: File; file2: File }, parameters: RunParameters) {
  // text/csv is sent even when the browser leaves File.type empty; the API accepts nothing else.
  const metadata = (file: File) => ({ filename: file.name, size: file.size, contentType: 'text/csv' });

  return api<CreatedRun>('/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: { file1: metadata(files.file1), file2: metadata(files.file2) },
      parameters,
    }),
  });
}

// Uploads raw bytes straight to GCS. XMLHttpRequest rather than fetch, for upload progress.
export function uploadFile(target: UploadTarget, file: File, onProgress?: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(target.method, target.url);
    // Every returned header is part of the signature; the PUT is rejected without them.
    for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload of ${file.name} failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error(`Upload of ${file.name} failed. Check your connection and try again.`));
    xhr.send(file);
  });
}

export function startRun(runId: string) {
  return api<{ runId: string; status: RunStatus }>(runPath(runId) + '/start', { method: 'POST' });
}

export function getRun(runId: string, signal?: AbortSignal) {
  return api<RunState>(runPath(runId), { signal });
}

export function getParameters(runId: string, signal?: AbortSignal) {
  return api<{ runId: string; parameters: RunParameters }>(runPath(runId) + '/parameters', { signal });
}

// `after` is a chunk sequence. latestSequence is the last one returned, or `after` again on an empty page.
export function getLogs(runId: string, after: number, signal?: AbortSignal) {
  return api<{ logs: LogChunk[]; latestSequence: number }>(runPath(runId) + '/logs?after=' + after, { signal });
}

// Only available once the run has SUCCEEDED. The URLs expire, so request them again rather than storing them.
export function getOutputUrls(runId: string, signal?: AbortSignal) {
  return api<{ outputs: RunOutput[] }>(runPath(runId) + '/outputs/access-urls', { method: 'POST', signal });
}
