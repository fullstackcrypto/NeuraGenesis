import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase/supabaseClient.js';
import { useAuth } from '../providers/AuthProvider.js';

interface ApprovalItem {
  id: string;
  approval_type: string;
  target_ref: string;
  status: string;
  rationale: string | null;
  created_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function ApprovalsRoute() {
  const { user } = useAuth();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [statusText, setStatusText] = useState('Loading approvals...');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      if (!user) {
        if (active) setStatusText('Sign in to view approvals.');
        return;
      }

      const membership = await supabase.from('parent_memberships').select('instance_id').eq('user_id', user.id).limit(1).maybeSingle();
      const instanceId = membership.data?.instance_id;

      if (!instanceId) {
        if (active) setStatusText('No NeuraGenesis instance found.');
        return;
      }

      const approvals = await supabase
        .from('parent_approvals')
        .select('id, approval_type, target_ref, status, rationale, created_at')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!active) return;

      if (approvals.error) {
        setStatusText(approvals.error.message);
        return;
      }

      setItems(approvals.data ?? []);
      setStatusText((approvals.data ?? []).length === 0 ? 'No approvals found yet.' : '');
    }

    loadItems();
    return () => {
      active = false;
    };
  }, [user, busyId]);

  async function updateApprovalStatus(item: ApprovalItem, nextStatus: 'approved' | 'rejected') {
    setBusyId(item.id);
    setStatusText('Saving approval decision...');

    const result = await supabase
      .from('parent_approvals')
      .update({
        status: nextStatus,
        rationale: nextStatus === 'approved' ? 'Approved from parent console.' : 'Rejected from parent console.',
      })
      .eq('id', item.id)
      .eq('status', 'pending');

    setBusyId(null);
    setStatusText(result.error?.message ?? '');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Approvals</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>
          Review pending and historical approval requests for milestone and permission changes.
        </Text>

        {statusText ? <Text style={{ color: '#334155', marginBottom: 16 }}>{statusText}</Text> : null}

        {items.map((item) => (
          <View key={item.id} style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 }}>
            <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.approval_type}</Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>Target: {item.target_ref}</Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>Status: {item.status}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Requested: {formatDate(item.created_at)}</Text>
            {item.rationale ? <Text style={{ color: '#334155', fontSize: 14, marginBottom: 8 }}>{item.rationale}</Text> : null}

            {item.status === 'pending' ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable disabled={busyId === item.id} onPress={() => updateApprovalStatus(item, 'approved')} style={{ backgroundColor: '#111827', borderRadius: 12, flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>Approve</Text>
                </Pressable>
                <Pressable disabled={busyId === item.id} onPress={() => updateApprovalStatus(item, 'rejected')} style={{ backgroundColor: '#e2e8f0', borderRadius: 12, flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>Reject</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
