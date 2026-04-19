import { evaluateWelfare } from '../../../src/features/welfare/welfarePolicy';
import type { WelfareSnapshot } from '../../../src/types/neuragenesis';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface WelfareRequestBody {
  snapshot: WelfareSnapshot;
}

export async function welfareCheckHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const body = await parseJson<WelfareRequestBody>(request);
  const result = evaluateWelfare(body.snapshot);

  return jsonResponse({
    ok: true,
    result,
    reviewRequired: result.shouldInterrupt,
  });
}

Deno.serve(welfareCheckHandler);
