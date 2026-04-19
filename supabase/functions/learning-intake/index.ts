import { filterLearningDatum } from '../../../src/features/learning/learningFilter';
import type { LearningDatum } from '../../../src/types/neuragenesis';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface LearningRequestBody {
  datum: LearningDatum;
}

export async function learningIntakeHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const body = await parseJson<LearningRequestBody>(request);
  const result = filterLearningDatum(body.datum);

  return jsonResponse({
    ok: true,
    result,
    shouldPersistToLearningHistory: result.outcome === 'accepted',
  });
}

Deno.serve(learningIntakeHandler);
