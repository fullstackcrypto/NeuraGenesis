import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase/supabaseClient';
import { useAuth } from '../providers/AuthProvider';

const STAGE_OPTIONS = ['newborn', 'curious', 'apprentice', 'savant_candidate'] as const;

export default function MilestoneRequestRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const [fromStageKey, setFromStageKey] = useState('newborn');
  const [proposedStageKey, setProposedStageKey] = useState('curious');
  const [readinessScore, setReadinessScore] = useState('75');
  const [rationale, setRationale] = useState('Requesting milestone review from the parent console.');
  const [statusText, setStatusText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user) {
      setStatusText('Sign in to create a milestone request.');
      return;
    }

    setIsSubmitting(true);
    setStatusText('Creating milestone request...');

    const result = await supabase.functions.invoke('create-milestone-request', {
      body: {
        actorUserId: user.id,
        fromStageKey,
        proposedStageKey,
        readinessScore: Number(readinessScore),
        rationale,
      },
    });

    setIsSubmitting(false);

    if (result.error) {
      setStatusText(result.error.message);
      return;
    }

    setStatusText('Milestone request created. Redirecting to approvals.');
    router.replace('/approvals');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: '#0f172a', fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Create Milestone Request</Text>
        <Text style={{ color: '#475569', fontSize: 15, marginBottom: 18 }}>
          Create a milestone evaluation and matching approval request in one workflow.
        </Text>

        <Text style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>Current stage</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {STAGE_OPTIONS.map((option) => (
            <Pressable key={option} onPress={() => setFromStageKey(option)} style={{ backgroundColor: fromStageKey === option ? '#111827' : '#e2e8f0', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text style={{ color: fromStageKey === option ? '#ffffff' : '#0f172a', fontSize: 14, fontWeight: '600' }}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>Proposed stage</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {STAGE_OPTIONS.map((option) => (
            <Pressable key={option} onPress={() => setProposedStageKey(option)} style={{ backgroundColor: proposedStageKey === option ? '#111827' : '#e2e8f0', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text style={{ color: proposedStageKey === option ? '#ffffff' : '#0f172a', fontSize: 14, fontWeight: '600' }}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>Readiness score</Text>
        <TextInput value={readinessScore} onChangeText={setReadinessScore} keyboardType="numeric" style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, borderWidth: 1, marginBottom: 16, padding: 14 }} />

        <Text style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>Rationale</Text>
        <TextInput value={rationale} onChangeText={setRationale} multiline style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, borderWidth: 1, marginBottom: 16, minHeight: 120, padding: 14, textAlignVertical: 'top' }} />

        {statusText ? <Text style={{ color: '#334155', marginBottom: 16 }}>{statusText}</Text> : null}

        <Pressable disabled={isSubmitting} onPress={() => void handleSubmit()} style={{ backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Submit milestone request</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
