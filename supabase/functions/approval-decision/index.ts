import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface ApprovalDecisionBody {
  approvalId: string;
  decision: 'approved' | 'rejected';
  actorUserId: string;
}

export async function approvalDecisionHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const body = await parseJson<ApprovalDecisionBody>(request);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const client = createClient(url, key);

  const approval = await client
    .from('parent_approvals')
    .select('id, instance_id, approval_type, target_ref, requested_payload, status')
    .eq('id', body.approvalId)
    .single();

  if (approval.error || !approval.data) {
    return jsonResponse({ error: approval.error?.message ?? 'Approval not found.' }, 404);
  }

  if (approval.data.status !== 'pending') {
    return jsonResponse({ error: 'Approval is no longer pending.' }, 409);
  }

  const payload = approval.data.requested_payload ?? {};
  const nextRationale = body.decision === 'approved' ? 'Approved from parent console.' : 'Rejected from parent console.';

  const updateResult = await client
    .from('parent_approvals')
    .update({
      status: body.decision,
      rationale: nextRationale,
      decided_by_user_id: body.actorUserId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', body.approvalId)
    .eq('status', 'pending');

  if (updateResult.error) {
    return jsonResponse({ error: updateResult.error.message }, 400);
  }

  if (approval.data.approval_type === 'milestone') {
    const milestoneEvaluationId = typeof payload.milestone_evaluation_id === 'string' ? payload.milestone_evaluation_id : null;
    const fromStageKey = typeof payload.from_stage_key === 'string' ? payload.from_stage_key : 'newborn';
    const proposedStageKey = typeof payload.proposed_stage_key === 'string' ? payload.proposed_stage_key : 'curious';
    const readinessScore = typeof payload.readiness_score === 'number' ? payload.readiness_score : 0;

    if (milestoneEvaluationId) {
      await client
        .from('milestone_evaluations')
        .update({ approval_id: body.approvalId, outcome: body.decision })
        .eq('id', milestoneEvaluationId)
        .eq('instance_id', approval.data.instance_id);
    } else {
      await client.from('milestone_evaluations').insert({
        instance_id: approval.data.instance_id,
        from_stage_key: fromStageKey,
        proposed_stage_key: proposedStageKey,
        readiness_score: readinessScore,
        required_approval: true,
        approval_id: body.approvalId,
        outcome: body.decision,
      });
    }

    if (body.decision === 'approved') {
      await client
        .from('neura_instances')
        .update({ current_stage_key: proposedStageKey })
        .eq('id', approval.data.instance_id);
    }
  }

  await client.from('audit_events').insert({
    instance_id: approval.data.instance_id,
    actor_user_id: body.actorUserId,
    actor_kind: 'edge_function',
    event_type: 'approval_decision',
    target_table: 'parent_approvals',
    target_id: approval.data.id,
    details: { decision: body.decision, approval_type: approval.data.approval_type, target_ref: approval.data.target_ref },
  });

  return jsonResponse({ ok: true, approvalId: body.approvalId, decision: body.decision });
}

Deno.serve(approvalDecisionHandler);
