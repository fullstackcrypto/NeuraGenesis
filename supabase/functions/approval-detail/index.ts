import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Deno, handleOptions, jsonResponse, parseJson } from '../_shared/http';

interface ApprovalDetailBody {
  approvalId: string;
}

export async function approvalDetailHandler(request: Request): Promise<Response> {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const body = await parseJson<ApprovalDetailBody>(request);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const client = createClient(url, key);

  const [approvalResult, auditResult, milestoneResult] = await Promise.all([
    client
      .from('parent_approvals')
      .select('id, approval_type, target_ref, status, rationale, requested_payload, created_at, decided_at, decided_by_user_id')
      .eq('id', body.approvalId)
      .single(),
    client
      .from('audit_events')
      .select('id, actor_kind, actor_user_id, event_type, details, created_at')
      .eq('target_table', 'parent_approvals')
      .eq('target_id', body.approvalId)
      .order('created_at', { ascending: false })
      .limit(20),
    client
      .from('milestone_evaluations')
      .select('id, from_stage_key, proposed_stage_key, readiness_score, outcome, created_at, approval_id')
      .eq('approval_id', body.approvalId)
      .limit(1)
      .maybeSingle(),
  ]);

  if (approvalResult.error || !approvalResult.data) {
    return jsonResponse({ error: approvalResult.error?.message ?? 'Approval not found.' }, 404);
  }

  const actorIds = Array.from(new Set((auditResult.data ?? []).map((item) => item.actor_user_id).filter(Boolean)));
  const actorMap: Record<string, string> = {};

  for (const actorId of actorIds) {
    if (typeof actorId !== 'string') continue;
    const actorResult = await client.auth.admin.getUserById(actorId);
    actorMap[actorId] = actorResult.data?.user?.email ?? actorId;
  }

  const auditItems = (auditResult.data ?? []).map((item) => ({
    ...item,
    actor_display: item.actor_user_id ? actorMap[item.actor_user_id] ?? item.actor_user_id : item.actor_kind,
  }));

  return jsonResponse({
    ok: true,
    approval: approvalResult.data,
    milestone: milestoneResult.data ?? null,
    auditItems,
  });
}

Deno.serve(approvalDetailHandler);
