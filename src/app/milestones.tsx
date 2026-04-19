import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase/supabaseClient.js';
import { useAuth } from '../providers/AuthProvider.js';

interface MilestoneItem {
  id: string;
  from_stage_key: string;
  proposed_stage_key: string;
  readiness_score: number;
  outcome: string;
  approval_id: string | null;
  created_at: string;
}

const STAGE_LABELS: Record<string, string> = {
  newborn: 'Newborn',
  curious: 'Curious',
  apprentice: 'Apprentice',
  savant_candidate: 'Savant Candidate',
};

function stageLabel(value: string) {
  return STAGE_LABELS[value] ?? value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function MilestonesRoute() {
  const { user } = useAuth();
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [items, setItems] = useState<MilestoneItem[]>([]);
  const [statusText, setStatusText] = useState('Loading milestone evaluations...');

  const loadItems = useCallback(async () => {
    if (!user) {
      setStatusText('Sign in to view milestone evaluations.');
      return;
    }

    const membership = await supabase
      .from('parent_memberships')
      .select('instance_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    const nextInstanceId = membership.data?.instance_id ?? null;
    setInstanceId(nextInstanceId);

    if (!nextInstanceId) {
      setStatusText('No NeuraGenesis instance found.');
      return;
    }

    const result = await supabase
      .from('milestone_evaluations')
      .select('id, from_stage_key, proposed_stage_key, readiness_score, outcome, approval_id, created_at')
      .eq('instance_id', nextInstanceId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (result.error) {
      setStatusText(result.error.message);
      return;
    }

    setItems(result.data ?? []);
    setStatusText((result.data ?? []).length === 0 ? 'No milestone evaluations found yet.' : '');
  }, [user]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!instanceId) {
      return;
    }

    const channel = supabase
      .channel(`milestones-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'milestone_evaluations', filter: `instance_id=eq.${instanceId}` },
        () => void loadItems(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [instanceId, loadItems]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Milestone Evaluations</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>
          Recent stage transition evaluations and readiness scores.
        </Text>

        {statusText ? <Text style={{ color: '#334155', marginBottom: 16 }}>{statusText}</Text> : null}

        {items.map((item) => (
          <View key={item.id} style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 }}>
            <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.outcome}</Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>
              Path: {stageLabel(item.from_stage_key)} → {stageLabel(item.proposed_stage_key)}
            </Text>
            <Text style={{ color: '#334155', fontSize: 14, marginBottom: 4 }}>Readiness score: {String(item.readiness_score)}</Text>
            <Text style={{ color: '#475569', fontSize: 13, marginBottom: 4 }}>Approval link: {item.approval_id ?? 'None'}</Text>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Evaluated: {formatDate(item.created_at)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
