import Config from '@/common/config.json';
import { proxyRequest } from '@/common/apiProxy';

const BASE_URL = Config.API.MEDUSA;

export async function GET(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  // A chunk sequence cursor, not a line number.
  const after = new URL(request.url).searchParams.get('after') ?? '0';

  return proxyRequest({
    url: `${BASE_URL}/runs/${encodeURIComponent(runId)}/logs?after=${encodeURIComponent(after)}`,
    token: process.env.MEDUSA_API_KEY,
    method: 'GET',
  });
}
