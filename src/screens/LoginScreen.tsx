import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider.js';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await signIn({ email, password });
    setLoading(false);
    if (error) Alert.alert('Sign in failed', error.message);
  }

  async function handleSignUp() {
    setLoading(true);
    const { error } = await signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }
    Alert.alert('Check your inbox', 'Confirm your email before signing in.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NeuraGenesis</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" autoCapitalize="none" secureTextEntry />
      <View style={styles.row}>
        <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
        <View style={styles.spacer} />
        <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  spacer: { width: 12 },
});
