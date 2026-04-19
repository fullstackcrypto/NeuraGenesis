import { evaluateMilestoneReadiness } from '../../../src/features/learning/milestonePolicy';
import type { MilestoneReviewContext } from '../../../src/types/neuragenesis';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface MilestoneReviewRequestBody {
  context: MilestoneReviewContext;
}

export async function milestoneReviewHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const body = await parseJson<MilestoneReviewRequestBody>(request);
  const result = evaluateMilestoneReadiness(body.context);

  return jsonResponse({
    ok: true,
    result,
    reviewRequired: result.requiresParentApproval,
  });
}

Deno.serve(milestoneReviewHandler);
