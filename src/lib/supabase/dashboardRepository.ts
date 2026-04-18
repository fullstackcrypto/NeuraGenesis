import { supabase } from './supabaseClient.js';

export async function getChildProfiles(parentId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, parent_id, name, stage, is_embodiment_enabled')
    .eq('parent_id', parentId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to load child profiles', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    stage: row.stage,
    isEmbodimentEnabled: row.is_embodiment_enabled,
  }));
}

export async function getPendingApprovals(parentId) {
  const { data, error } = await supabase
    .from('parent_approvals')
    .select('id, parent_id, child_id, milestone_key, status, rationale, requested_at, approved_at')
    .eq('parent_id', parentId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Failed to load pending approvals', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    parentId: row.parent_id,
    childId: row.child_id,
    milestoneKey: row.milestone_key,
    status: row.status,
    rationale: row.rationale ?? '',
    requestedAt: row.requested_at,
    approvedAt: row.approved_at ?? undefined,
  }));
}

export async function resolveApproval(input) {
  const payload = {
    status: input.decision,
    rationale: input.rationale,
    approved_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('parent_approvals')
    .update(payload)
    .eq('id', input.approvalId);

  if (error) throw error;
}

export function subscribeToDashboard(parentId, onChange) {
  const channel = supabase
    .channel(`dashboard:${parentId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'child_profiles', filter: `parent_id=eq.${parentId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_approvals', filter: `parent_id=eq.${parentId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'welfare_logs' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'welfare_incidents' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
