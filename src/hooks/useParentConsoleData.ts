import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/supabaseClient.js';
import { useAuth } from '../providers/AuthProvider.js';

const STAGE_LABELS: Record<string, string> = {
  newborn: 'Newborn',
  curious: 'Curious',
  apprentice: 'Apprentice',
  savant_candidate: 'Savant Candidate',
};

export function useParentConsoleData() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    instanceId: null as string | null,
    instanceName: 'No instance found',
    currentStageLabel: 'Unavailable',
    welfareStatus: 'Unknown',
    pendingApprovals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!user) {
        if (active) setIsLoading(false);
        return;
      }

      const membership = await supabase.from('parent_memberships').select('instance_id').eq('user_id', user.id).limit(1).maybeSingle();
      if (membership.error || !membership.data?.instance_id) {
        if (active) {
          setErrorMessage(membership.error?.message ?? null);
          setIsLoading(false);
        }
        return;
      }

      const instanceId = membership.data.instance_id;
      const instance = await supabase.from('neura_instances').select('display_name,current_stage_key').eq('id', instanceId).single();
      const approvals = await supabase.from('parent_approvals').select('id', { count: 'exact', head: true }).eq('instance_id', instanceId).eq('status', 'pending');
      const welfare = await supabase.from('welfare_logs').select('status').eq('instance_id', instanceId).order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (active) {
        setSummary({
          instanceId,
          instanceName: instance.data?.display_name ?? 'NeuraGenesis',
          currentStageLabel: STAGE_LABELS[instance.data?.current_stage_key ?? 'newborn'] ?? 'Newborn',
          welfareStatus: welfare.data?.status ?? 'No logs yet',
          pendingApprovals: approvals.count ?? 0,
        });
        setErrorMessage(instance.error?.message ?? approvals.error?.message ?? welfare.error?.message ?? null);
        setIsLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [user]);

  return { summary, isLoading, errorMessage };
}
