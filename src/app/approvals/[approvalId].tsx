import React, { useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase/supabaseClient';

interface ApprovalRecord {
  id: string;
  approval_type: string;
  target_ref: string;
  status: string;
  rationale: string | null;
  created_at: string;
  decided_at: string | null;
}

interface MilestoneRecord {
  id: string;
  from_stage_key: string;
  proposed_stage_key: string;
  readiness_score: number;
  outcome: string;
  created_at: string;
}

interface AuditRecord {
  id: string;
  actor_display: string;
  event_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not set';
}

export default function ApprovalDetailRoute() {
  const { approvalId } = useLocalSearchParams<{ approvalId: string }>();
  const [approval, setApproval] = useState<ApprovalRecord | null>(null);
  const [milestone, setMilestone] = useState<MilestoneRecord | null>(null);
  const [auditItems, setAuditItems] = useState<AuditRecord[]>([]);
  const [statusText, setStatusText] = useState('Loading approval details...');

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!approvalId) {
        if (active) setStatusText('Approval id is missing.');
        return;
      }

      const result = await supabase.functions.invoke('approval-detail', { body: { approvalId } });
      if (!active) return;

      if (result.error) {
        setStatusText(result.error.message);
        return;
      }

      setApproval(result.data?.approval ?? null);
      setMilestone(result.data?.milestone ?? null);
      setAuditItems(result.data?.auditItems ?? []);
      setStatusText('');
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [approvalId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Approval Detail</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>Detailed status, history, and linked records.</Text>

        {statusText ? <Text style={{ color: '#334155', marginBottom: 16 }}>{statusText}</Text> : null}

        {approval ? (
          <View style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 16 }}>
            <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '600', marginBottom: 6 }}>{approval.approval_type}</Text>
            <Text style={{ color: '#475569', marginBottom: 4 }}>Target: {approval.target_ref}</Text>
            <Text style={{ color: '#475569', marginBottom: 4 }}>Status: {approval.status}</Text>
            <Text style={{ color: '#475569', marginBottom: 4 }}>Created: {formatDate(approval.created_at)}</Text>
            <Text style={{ color: '#475569', marginBottom: 4 }}>Decided: {formatDate(approval.decided_at)}</Text>
            {approval.rationale ? <Text style={{ color: '#334155', marginTop: 8 }}>{approval.rationale}</Text> : null}
          </View>
        ) : null}

        <View style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 16 }}>
          <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Linked milestone evaluation</Text>
          {milestone ? (
            <>
              <Text style={{ color: '#475569', marginBottom: 4 }}>From: {milestone.from_stage_key}</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>To: {milestone.proposed_stage_key}</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>Readiness score: {String(milestone.readiness_score)}</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>Outcome: {milestone.outcome}</Text>
              <Text style={{ color: '#64748b' }}>Created: {formatDate(milestone.created_at)}</Text>
            </>
          ) : (
            <Text style={{ color: '#475569' }}>No linked milestone evaluation found.</Text>
          )}
        </View>

        <View style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 16 }}>
          <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>History</Text>
          {auditItems.length === 0 ? <Text style={{ color: '#475569' }}>No audit history found.</Text> : null}
          {auditItems.map((item) => (
            <View key={item.id} style={{ borderTopColor: '#e2e8f0', borderTopWidth: 1, paddingTop: 10, marginTop: 10 }}>
              <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>{item.event_type}</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>Actor: {item.actor_display}</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>{formatDate(item.created_at)}</Text>
              <Text style={{ color: '#334155' }}>{JSON.stringify(item.details ?? {}, null, 2)}</Text>
            </View>
          ))}
        </View>

        <Link asChild href="/approvals">
          <Pressable style={{ backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Back to approvals</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
