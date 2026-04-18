import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useParentDashboard } from '../hooks/useParentDashboard.js';

export default function ParentDashboardScreen() {
  const router = useRouter();
  const { childProfiles, pendingApprovals, loading, error } = useParentDashboard();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Dashboard</Text>
      {loading ? <Text style={styles.meta}>Loading</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.section}>Children</Text>
      <FlatList
        data={childProfiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/child/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.meta}>Stage: {item.stage}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.meta}>No child profiles found.</Text>}
      />

      <Text style={styles.section}>Pending approvals</Text>
      <FlatList
        data={pendingApprovals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.milestoneKey}</Text>
            <Text style={styles.meta}>{item.rationale}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.meta}>No pending approvals.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  section: { fontSize: 20, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  meta: { color: '#4b5563', marginBottom: 4 },
  error: { color: '#b91c1c', marginBottom: 8 },
});
