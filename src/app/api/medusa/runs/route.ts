import Config from '@/common/config.json';
import { proxyRequest } from '@/common/apiProxy';

const BASE_URL = Config.API.MEDUSA;

// Creates a run and returns its signed upload URLs.
export async function POST(request: Request) {
  return proxyRequest({
    url: `${BASE_URL}/runs`,
    token: process.env.MEDUSA_API_KEY,
    method: 'POST',
    request,
  });
}
