import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface MilestoneRequestBody {
  actorUserId: string;
  fromStageKey: string;
  proposedStageKey: string;
  readinessScore: number;
  rationale?: string;
}

const STAGE_ORDER: Record<string, number> = {
  newborn: 10,
  curious: 20,
  apprentice: 30,
  savant_candidate: 40,
};

export async function createMilestoneRequestHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const body = await parseJson<MilestoneRequestBody>(request);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const client = createClient(url, key);

  if (!Number.isFinite(body.readinessScore) || body.readinessScore < 0 || body.readinessScore > 100) {
    return jsonResponse({ error: 'Readiness score must be between 0 and 100.' }, 400);
  }

  const fromOrder = STAGE_ORDER[body.fromStageKey];
  const proposedOrder = STAGE_ORDER[body.proposedStageKey];
  if (!fromOrder || !proposedOrder) {
    return jsonResponse({ error: 'Unknown stage key in milestone request.' }, 400);
  }

  if (proposedOrder !== fromOrder + 10) {
    return jsonResponse({ error: 'Milestone requests must advance exactly one stage at a time.' }, 400);
  }

  const membership = await client
    .from('parent_memberships')
    .select('instance_id')
    .eq('user_id', body.actorUserId)
    .limit(1)
    .maybeSingle();

  const instanceId = membership.data?.instance_id ?? null;
  if (!instanceId) {
    return jsonResponse({ error: 'No NeuraGenesis instance found for this actor.' }, 404);
  }

  const instance = await client
    .from('neura_instances')
    .select('current_stage_key')
    .eq('id', instanceId)
    .single();

  if (instance.error || !instance.data) {
    return jsonResponse({ error: instance.error?.message ?? 'Unable to load current instance stage.' }, 400);
  }

  if (instance.data.current_stage_key !== body.fromStageKey) {
    return jsonResponse({ error: 'The requested from-stage does not match the current instance stage.' }, 409);
  }

  const existingPending = await client
    .from('parent_approvals')
    .select('id')
    .eq('instance_id', instanceId)
    .eq('approval_type', 'milestone')
    .eq('status', 'pending')
    .eq('target_ref', body.proposedStageKey)
    .limit(1)
    .maybeSingle();

  if (existingPending.data?.id) {
    return jsonResponse({ error: 'A pending milestone request already exists for this target stage.' }, 409);
  }

  const milestoneInsert = await client
    .from('milestone_evaluations')
    .insert({
      instance_id: instanceId,
      from_stage_key: body.fromStageKey,
      proposed_stage_key: body.proposedStageKey,
      readiness_score: body.readinessScore,
      required_approval: true,
      outcome: 'pending',
    })
    .select('id')
    .single();

  if (milestoneInsert.error || !milestoneInsert.data) {
    return jsonResponse({ error: milestoneInsert.error?.message ?? 'Unable to create milestone evaluation.' }, 400);
  }

  const approvalInsert = await client
    .from('parent_approvals')
    .insert({
      instance_id: instanceId,
      approval_type: 'milestone',
      target_ref: body.proposedStageKey,
      requested_by_user_id: body.actorUserId,
      status: 'pending',
      rationale: body.rationale ?? 'Milestone request created from parent console.',
      requested_payload: {
        milestone_evaluation_id: milestoneInsert.data.id,
        from_stage_key: body.fromStageKey,
        proposed_stage_key: body.proposedStageKey,
        readiness_score: body.readinessScore,
      },
    })
    .select('id')
    .single();

  if (approvalInsert.error || !approvalInsert.data) {
    return jsonResponse({ error: approvalInsert.error?.message ?? 'Unable to create linked approval request.' }, 400);
  }

  await client
    .from('milestone_evaluations')
    .update({ approval_id: approvalInsert.data.id })
    .eq('id', milestoneInsert.data.id)
    .eq('instance_id', instanceId);

  await client.from('audit_events').insert([
    {
      instance_id: instanceId,
      actor_user_id: body.actorUserId,
      actor_kind: 'edge_function',
      event_type: 'milestone_request_created',
      target_table: 'milestone_evaluations',
      target_id: milestoneInsert.data.id,
      details: {
        from_stage_key: body.fromStageKey,
        proposed_stage_key: body.proposedStageKey,
        readiness_score: body.readinessScore,
      },
    },
    {
      instance_id: instanceId,
      actor_user_id: body.actorUserId,
      actor_kind: 'edge_function',
      event_type: 'approval_request_created',
      target_table: 'parent_approvals',
      target_id: approvalInsert.data.id,
      details: {
        approval_type: 'milestone',
        milestone_evaluation_id: milestoneInsert.data.id,
        proposed_stage_key: body.proposedStageKey,
      },
    },
  ]);

  return jsonResponse({
    ok: true,
    milestoneEvaluationId: milestoneInsert.data.id,
    approvalId: approvalInsert.data.id,
  });
}

Deno.serve(createMilestoneRequestHandler);
