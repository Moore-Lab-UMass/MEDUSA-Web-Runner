import Config from '@/common/config.json';
import { proxyRequest } from '@/common/apiProxy';

const BASE_URL = Config.API.MEDUSA;

// Launches the worker once both inputs are uploaded.
export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  return proxyRequest({
    url: `${BASE_URL}/runs/${encodeURIComponent(runId)}/start`,
    token: process.env.MEDUSA_API_KEY,
    method: 'POST',
  });
}
