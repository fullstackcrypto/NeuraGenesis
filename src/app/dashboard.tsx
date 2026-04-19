import React from 'react';
import { Link } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useParentConsoleData } from '../hooks/useParentConsoleData.js';
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

function NavButton(props: { href: '/approvals' | '/learning'; label: string }) {
  return (
    <Link asChild href={props.href}>
      <Pressable style={{ backgroundColor: '#e2e8f0', borderRadius: 12, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{props.label}</Text>
      </Pressable>
    </Link>
  );
}

export default function DashboardRoute() {
  const { user, signOut } = useAuth();
  const { summary, isLoading, errorMessage } = useParentConsoleData();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 30, fontWeight: '700', marginBottom: 6 }}>Parent Console</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 6 }}>
          Signed in as {user?.email ?? 'parent'}
        </Text>
        <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          {isLoading ? 'Loading live summary...' : errorMessage ?? summary.instanceName}
        </Text>

        <Card title="Current stage" value={summary.currentStageLabel} detail="Stage value is loaded from the current instance record." />
        <Card title="Welfare state" value={summary.welfareStatus} detail="Latest status is loaded from the most recent log entry." />
        <Card title="Pending approvals" value={String(summary.pendingApprovals)} detail="Pending request count is loaded from approval records." />

        <NavButton href="/approvals" label="Open approvals" />
        <NavButton href="/learning" label="Open learning activity" />

        <Pressable onPress={() => signOut()} style={{ backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
