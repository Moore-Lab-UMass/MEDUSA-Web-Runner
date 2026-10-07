import { NextResponse } from 'next/server';

type ProxyOptions = {
  url: string;
  // The MEDUSA API is public for now. Once it requires a key, set MEDUSA_API_KEY and
  // every proxied request carries it; without one no Authorization header is sent.
  token?: string;
  method: 'GET' | 'POST';
  // Its body, if any, is forwarded upstream verbatim when method is "POST".
  request?: Request;
};

// Forwards a request to an upstream API with a Bearer token attached, then
// relays the upstream status and body back untouched.
export async function proxyRequest({ url, token, method, request }: ProxyOptions) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = 'Bearer ' + token;

  let body: string | undefined;
  if (method === 'POST' && request) {
    const text = await request.text();
    if (text) {
      body = text;
      headers['Content-Type'] = 'application/json';
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body, cache: 'no-store' });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNREACHABLE', message: 'The MEDUSA API could not be reached.' } },
      { status: 502 },
    );
  }

  const data = await response.text();

  // 204/205/304 must not carry a body — Response throws if one is supplied.
  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return new NextResponse(null, { status: response.status });
  }

  return new NextResponse(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
