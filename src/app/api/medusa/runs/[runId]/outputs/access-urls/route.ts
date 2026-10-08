import Config from '@/common/config.json';
import { proxyRequest } from '@/common/apiProxy';

const BASE_URL = Config.API.MEDUSA;

// Signs short-lived download URLs for a succeeded run's output files.
export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  return proxyRequest({
    url: `${BASE_URL}/runs/${encodeURIComponent(runId)}/outputs/access-urls`,
    token: process.env.MEDUSA_API_KEY,
    method: 'POST',
  });
}
