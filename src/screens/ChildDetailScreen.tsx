import { StyleSheet, Text, View } from 'react-native';

export default function ChildDetailScreen({ childId }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Child Detail</Text>
      <Text style={styles.meta}>Child ID: {childId}</Text>
      <Text style={styles.meta}>This screen is reserved for parent review of milestones, welfare, incidents, and embodiment readiness.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 10 },
  meta: { color: '#4b5563', marginBottom: 8 },
});
