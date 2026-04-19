import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase/supabaseClient.js';
import { useAuth } from '../providers/AuthProvider.js';

interface LearningItem {
  id: string;
  source_kind: string;
  content_summary: string;
  safety_outcome: string;
  created_at: string;
}

export default function LearningRoute() {
  const { user } = useAuth();
  const [items, setItems] = useState<LearningItem[]>([]);
  const [statusText, setStatusText] = useState('Loading learning activity...');

  useEffect(() => {
    let active = true;

    async function loadItems() {
      if (!user) {
        if (active) setStatusText('Sign in to view learning activity.');
        return;
      }

      const membership = await supabase.from('parent_memberships').select('instance_id').eq('user_id', user.id).limit(1).maybeSingle();
      const instanceId = membership.data?.instance_id;

      if (!instanceId) {
        if (active) setStatusText('No NeuraGenesis instance found.');
        return;
      }

      const result = await supabase
        .from('learning_history')
        .select('id, source_kind, content_summary, safety_outcome, created_at')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!active) return;

      if (result.error) {
        setStatusText(result.error.message);
        return;
      }

      setItems(result.data ?? []);
      setStatusText((result.data ?? []).length === 0 ? 'No learning activity found yet.' : '');
    }

    loadItems();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Learning Activity</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>
          Recent learning events with source and safety outcome summaries.
        </Text>

        {statusText ? <Text style={{ color: '#334155', marginBottom: 16 }}>{statusText}</Text> : null}

        {items.map((item) => (
          <View key={item.id} style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 }}>
            <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.safety_outcome}</Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>Source: {item.source_kind}</Text>
            <Text style={{ color: '#334155', fontSize: 14, marginBottom: 4 }}>{item.content_summary}</Text>
            <Text style={{ color: '#64748b', fontSize: 13 }}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
