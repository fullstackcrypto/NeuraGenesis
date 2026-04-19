import { filterLearningDatum } from '../../../src/features/learning/learningFilter';
import { evaluateMilestoneReadiness } from '../../../src/features/learning/milestonePolicy';
import { evaluateWelfare } from '../../../src/features/welfare/welfarePolicy';
import type { LearningDatum, MilestoneReviewContext, WelfareSnapshot } from '../../../src/types/neuragenesis';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface AgentRuntimeRequestBody {
  datum: LearningDatum;
  welfareSnapshot: WelfareSnapshot;
  milestoneContext?: MilestoneReviewContext;
}

export async function agentRuntimeHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const body = await parseJson<AgentRuntimeRequestBody>(request);
  const learning = filterLearningDatum(body.datum);
  const welfare = evaluateWelfare(body.welfareSnapshot);

  const steps = [
    {
      key: 'learning_intake',
      status: learning.outcome === 'accepted' ? 'completed' : 'blocked',
      rationale: learning.reasons.join(', '),
    },
    {
      key: 'welfare_gate',
      status: welfare.shouldInterrupt ? 'blocked' : 'completed',
      rationale: welfare.summary,
    },
  ];

  if (learning.outcome !== 'accepted') {
    return jsonResponse({
      status: 'blocked',
      rationale: 'Learning intake was not accepted.',
      reviewRequired: learning.outcome === 'quarantined',
      steps,
      learning,
      welfare,
    });
  }

  if (welfare.shouldInterrupt) {
    return jsonResponse({
      status: 'blocked',
      rationale: 'Welfare gate interrupted the runtime.',
      reviewRequired: true,
      steps,
      learning,
      welfare,
    });
  }

  if (body.milestoneContext) {
    const milestone = evaluateMilestoneReadiness(body.milestoneContext);
    steps.push({
      key: 'milestone_review',
      status: milestone.canAdvance ? 'completed' : 'blocked',
      rationale: milestone.reasons.join(', '),
    });

    if (milestone.requiresParentApproval && !milestone.canAdvance) {
      return jsonResponse({
        status: 'approval_required',
        rationale: 'Milestone progression requires explicit parent review.',
        reviewRequired: true,
        steps,
        learning,
        welfare,
      });
    }
  }

  steps.push({
    key: 'runtime_complete',
    status: 'completed',
    rationale: 'All bounded gates passed for this slice.',
  });

  return jsonResponse({
    status: 'completed',
    rationale: 'Learning and welfare gates passed.',
    reviewRequired: false,
    steps,
    learning,
    welfare,
  });
}

Deno.serve(agentRuntimeHandler);
