import { useEffect, useMemo, useState } from 'react';
import { getChildProfiles, getPendingApprovals, resolveApproval, subscribeToDashboard } from '../lib/supabase/dashboardRepository.js';
import { useAuth } from '../providers/AuthProvider.js';

export function useParentDashboard() {
  const { user } = useAuth();
  const [childProfiles, setChildProfiles] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setChildProfiles([]);
      setPendingApprovals([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function refresh() {
      try {
        setLoading(true);
        const [children, approvals] = await Promise.all([
          getChildProfiles(user.id),
          getPendingApprovals(user.id),
        ]);
        if (!cancelled) {
          setChildProfiles(children);
          setPendingApprovals(approvals);
          setError(null);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refresh();
    const unsubscribe = subscribeToDashboard(user.id, refresh);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  const actions = useMemo(() => ({
    approve: async (approvalId, rationale = 'Approved by parent') => {
      await resolveApproval({ approvalId, decision: 'approved', rationale });
    },
    deny: async (approvalId, rationale = 'Denied by parent') => {
      await resolveApproval({ approvalId, decision: 'denied', rationale });
    },
  }), []);

  return { childProfiles, pendingApprovals, loading, error, ...actions };
}
