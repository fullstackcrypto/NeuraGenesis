import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase/supabaseClient.js';
import { useAuth } from '../providers/AuthProvider.js';

interface ApprovalItem {
  id: string;
  approval_type: string;
  target_ref: string;
  status: string;
  created_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function ApprovalsRoute() {
  const { user } = useAuth();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [statusText, setStatusText] = useState('Loading approvals...');

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
        .select('id, approval_type, target_ref, status, created_at')
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
  }, [user]);

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
            <Text style={{ color: '#64748b', fontSize: 13 }}>Requested: {formatDate(item.created_at)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
