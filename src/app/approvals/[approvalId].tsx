import React, { useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase/supabaseClient.js';

interface ApprovalRecord {
  id: string;
  approval_type: string;
  target_ref: string;
  status: string;
  rationale: string | null;
  requested_payload: Record<string, unknown> | null;
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

      const [approvalResult, auditResult, milestoneResult] = await Promise.all([
        supabase
          .from('parent_approvals')
          .select('id, approval_type, target_ref, status, rationale, requested_payload, created_at, decided_at')
          .eq('id', approvalId)
          .single(),
        supabase
          .from('audit_events')
          .select('id, event_type, details, created_at')
          .eq('target_table', 'parent_approvals')
          .eq('target_id', approvalId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('milestone_evaluations')
          .select('id, from_stage_key, proposed_stage_key, readiness_score, outcome, created_at')
          .eq('approval_id', approvalId)
          .limit(1)
          .maybeSingle(),
      ]);

      if (!active) return;

      if (approvalResult.error) {
        setStatusText(approvalResult.error.message);
        return;
      }

      setApproval(approvalResult.data);
      setMilestone(milestoneResult.data ?? null);
      setAuditItems(auditResult.data ?? []);
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
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>
          Detailed approval status, rationale history, and linked milestone evaluation.
        </Text>

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
          <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Rationale history</Text>
          {auditItems.length === 0 ? <Text style={{ color: '#475569' }}>No audit history found.</Text> : null}
          {auditItems.map((item) => (
            <View key={item.id} style={{ borderTopColor: '#e2e8f0', borderTopWidth: 1, paddingTop: 10, marginTop: 10 }}>
              <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>{item.event_type}</Text>
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
