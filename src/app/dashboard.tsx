import React from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider.js';

function Card(props: { title: string; value: string; detail: string }) {
  return (
    <View style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 16, borderWidth: 1, marginBottom: 14, padding: 16 }}>
      <Text style={{ color: '#475569', fontSize: 13, marginBottom: 4 }}>{props.title}</Text>
      <Text style={{ color: '#0f172a', fontSize: 24, fontWeight: '700', marginBottom: 6 }}>{props.value}</Text>
      <Text style={{ color: '#334155', fontSize: 14 }}>{props.detail}</Text>
    </View>
  );
}

export default function DashboardRoute() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 30, fontWeight: '700', marginBottom: 6 }}>Parent Console</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 20 }}>
          Signed in as {user?.email ?? 'parent'}
        </Text>

        <Card title="Current stage" value="Newborn" detail="Bounded curiosity and supervised learning only." />
        <Card title="Welfare state" value="Stable" detail="No alert level signals are shown in this scaffold." />
        <Card title="Pending approvals" value="0" detail="Stage changes remain approval gated." />

        <Pressable onPress={() => signOut()} style={{ backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
