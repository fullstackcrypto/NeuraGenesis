import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase/supabaseClient.js';
import { useAuth } from '../providers/AuthProvider.js';

interface ApprovalItem {
  id: string;
  approval_type: string;
  target_ref: string;
  status: string;
  rationale: string | null;
  requested_payload: Record<string, unknown> | null;
  created_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function ApprovalsRoute() {
  const { user } = useAuth();
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [statusText, setStatusText] = useState('Loading approvals...');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchValue, setSearchValue] = useState('');

  const loadItems = useCallback(async () => {
    if (!user) {
      setStatusText('Sign in to view approvals.');
      return;
    }

    const membership = await supabase.from('parent_memberships').select('instance_id').eq('user_id', user.id).limit(1).maybeSingle();
    const nextInstanceId = membership.data?.instance_id ?? null;
    setInstanceId(nextInstanceId);

    if (!nextInstanceId) {
      setStatusText('No NeuraGenesis instance found.');
      return;
    }

    const approvals = await supabase
      .from('parent_approvals')
      .select('id, approval_type, target_ref, status, rationale, requested_payload, created_at')
      .eq('instance_id', nextInstanceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (approvals.error) {
      setStatusText(approvals.error.message);
      return;
    }

    setItems(approvals.data ?? []);
    setStatusText((approvals.data ?? []).length === 0 ? 'No approvals found yet.' : '');
  }, [user]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!instanceId) return;

    const channel = supabase
      .channel(`approvals-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_approvals', filter: `instance_id=eq.${instanceId}` }, () => void loadItems())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestone_evaluations', filter: `instance_id=eq.${instanceId}` }, () => void loadItems())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [instanceId, loadItems]);

  async function updateApprovalStatus(item: ApprovalItem, nextStatus: 'approved' | 'rejected') {
    if (!user) return;

    setBusyId(item.id);
    setStatusText('Saving approval decision...');

    const previousItems = items;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus, rationale: nextStatus === 'approved' ? 'Approved from parent console.' : 'Rejected from parent console.' } : entry));

    const result = await supabase.functions.invoke('approval-decision', {
      body: { approvalId: item.id, decision: nextStatus, actorUserId: user.id },
    });

    setBusyId(null);

    if (result.error) {
      setItems(previousItems);
      setStatusText(result.error.message);
      return;
    }

    setStatusText('');
    await loadItems();
  }

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
      const haystack = `${item.approval_type} ${item.target_ref} ${item.rationale ?? ''}`.toLowerCase();
      const matchesSearch = query.length === 0 ? true : haystack.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [items, searchValue, statusFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Approvals</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>Review pending and historical approval requests.</Text>

        <Link asChild href="/milestone-request">
          <Pressable style={{ backgroundColor: '#e2e8f0', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Create milestone request</Text>
          </Pressable>
        </Link>

        <TextInput value={searchValue} onChangeText={setSearchValue} placeholder="Search approvals" style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, borderWidth: 1, marginBottom: 12, padding: 14 }} />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((option) => (
            <Pressable key={option} onPress={() => setStatusFilter(option)} style={{ backgroundColor: statusFilter === option ? '#111827' : '#e2e8f0', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text style={{ color: statusFilter === option ? '#ffffff' : '#0f172a', fontSize: 14, fontWeight: '600' }}>{option}</Text>
            </Pressable>
          ))}
        </View>

        {statusText ? <Text style={{ color: '#334155', marginBottom: 16 }}>{statusText}</Text> : null}

        {filteredItems.map((item) => (
          <View key={item.id} style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 }}>
            <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.approval_type}</Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>Target: {item.target_ref}</Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>Status: {item.status}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Requested: {formatDate(item.created_at)}</Text>
            {item.rationale ? <Text style={{ color: '#334155', fontSize: 14, marginBottom: 8 }}>{item.rationale}</Text> : null}

            <Link asChild href={`/approvals/${item.id}`}>
              <Pressable style={{ backgroundColor: '#e2e8f0', borderRadius: 12, marginBottom: item.status === 'pending' ? 10 : 0, paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>Open detail</Text>
              </Pressable>
            </Link>

            {item.status === 'pending' ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable disabled={busyId === item.id} onPress={() => void updateApprovalStatus(item, 'approved')} style={{ backgroundColor: '#111827', borderRadius: 12, flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>Approve</Text>
                </Pressable>
                <Pressable disabled={busyId === item.id} onPress={() => void updateApprovalStatus(item, 'rejected')} style={{ backgroundColor: '#e2e8f0', borderRadius: 12, flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
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
