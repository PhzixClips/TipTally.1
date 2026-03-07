import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import ShiftCard from '../../components/shifts/ShiftCard';
import ShiftForm from '../../components/shifts/ShiftForm';
import StatsGrid from '../../components/shifts/StatsGrid';
import Button from '../../components/ui/Button';

export default function ShiftsScreen() {
  const { data, addShift, deleteShift } = useData();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const sorted = [...data.shifts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>SHIFT HISTORY</Text>
            <Button onPress={() => setShowForm(true)} color={C.green} filled size="sm">+ LOG SHIFT</Button>
          </View>
        }
        ListFooterComponent={<StatsGrid shifts={data.shifts} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No shifts logged yet</Text>
            <Text style={styles.emptyText}>Tap "+ LOG SHIFT" to record your first shift</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            onEdit={() => router.push(`/shift/${item.id}`)}
            onDelete={() => deleteShift(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <ShiftForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSave={addShift}
        hourlyWage={data.settings.hourlyWage}
      />
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: C.purple,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: mono,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: C.textSoft,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: mono,
  },
});
