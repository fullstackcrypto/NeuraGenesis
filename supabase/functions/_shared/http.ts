declare const Deno: {
  serve: (handler: (request: Request) => Promise<Response> | Response) => void;
};

export { Deno };

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    },
  });
}

export async function parseJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function handleOptions(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return jsonResponse({ ok: true }, 200);
  }

  return null;
}
