import Config from '@/common/config.json';
import { proxyRequest } from '@/common/apiProxy';

const BASE_URL = Config.API.MEDUSA;

export async function GET(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  return proxyRequest({
    url: `${BASE_URL}/runs/${encodeURIComponent(runId)}`,
    token: process.env.MEDUSA_API_KEY,
    method: 'GET',
  });
}
