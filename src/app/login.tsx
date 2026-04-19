import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider.js';

function buildButtonStyle(isPrimary: boolean) {
  return {
    backgroundColor: isPrimary ? '#111827' : '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
  };
}

export default function LoginRoute() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [statusMessage, setStatusMessage] = useState('Use parent credentials to continue.');

  const ctaLabel = useMemo(() => (mode === 'sign-in' ? 'Sign in' : 'Create account'), [mode]);

  async function handleSubmit() {
    const action = mode === 'sign-in' ? signIn : signUp;
    const { error } = await action({ email, password });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage(mode === 'sign-in' ? 'Signed in. Redirecting to parent console.' : 'Account created. Check your email if confirmation is required.');
    router.replace('/dashboard');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>NeuraGenesis</Text>
        <Text style={{ fontSize: 16, color: '#334155', marginBottom: 24 }}>
          Parent authentication gateway for welfare review, milestone approvals, and supervised growth.
        </Text>

        <Text style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="parent@example.com"
          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, borderWidth: 1, marginBottom: 16, padding: 14 }}
          value={email}
        />

        <Text style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}>Password</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, borderWidth: 1, marginBottom: 8, padding: 14 }}
          value={password}
        />

        <Text style={{ color: '#475569', marginTop: 12 }}>{statusMessage}</Text>

        <Pressable onPress={handleSubmit} style={buildButtonStyle(true)}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{ctaLabel}</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
          style={buildButtonStyle(false)}
        >
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            {mode === 'sign-in' ? 'Need an account?' : 'Already have an account?'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
