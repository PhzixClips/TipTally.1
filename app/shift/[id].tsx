import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function EditShiftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateShift, deleteShift } = useData();
  const router = useRouter();

  const shift = data.shifts.find(s => s.id === id);
  if (!shift) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Shift not found</Text>
      </View>
    );
  }

  const [hours, setHours] = useState(String(shift.hours));
  const [total, setTotal] = useState(String(shift.totalEarned));
  const [error, setError] = useState('');

  const tips = hours && total ? Math.max(0, +total - +hours * shift.hourlyWage) : null;

  const handleSave = () => {
    if (!hours || !total || +hours <= 0 || +total < 0) {
      setError('Enter valid hours and total');
      return;
    }
    updateShift(shift.id, shift.date, +hours, +total);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Shift',
      `Remove ${shift.displayDate} shift?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => { deleteShift(shift.id); router.back(); },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.dateBox}>
        <Text style={styles.label}>DATE</Text>
        <Text style={styles.dateText}>{shift.displayDate}</Text>
      </View>

      <Input
        label="Hours Worked"
        value={hours}
        onChangeText={setHours}
        placeholder="6"
        keyboardType="decimal-pad"
      />
      <Input
        label="Total Made ($)"
        value={total}
        onChangeText={setTotal}
        placeholder="396.00"
        keyboardType="decimal-pad"
      />

      {hours && total ? (
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.bLabel}>Wage ({hours}hr x ${shift.hourlyWage})</Text>
            <Text style={styles.bValue}>${(+hours * shift.hourlyWage).toFixed(2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.bLabel, { color: C.gold }]}>Tips</Text>
            <Text style={[styles.bValue, { color: C.gold, fontWeight: '700' }]}>${tips?.toFixed(2)}</Text>
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button onPress={handleSave} color={C.green} filled size="lg" style={{ marginBottom: 12 }}>SAVE CHANGES</Button>
      <Button onPress={handleDelete} color={C.danger} size="lg">DELETE SHIFT</Button>
    </ScrollView>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24 },
  notFound: { color: C.textMuted, fontSize: 14, textAlign: 'center', marginTop: 60 },
  dateBox: { marginBottom: 16 },
  label: {
    color: C.textMuted, fontSize: 10, fontFamily: mono,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600',
  },
  dateText: { color: C.text, fontSize: 18, fontWeight: '700' },
  breakdown: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  bLabel: { color: C.textMuted, fontSize: 12, fontFamily: mono },
  bValue: { color: C.textSoft, fontSize: 12, fontFamily: mono },
  error: {
    color: C.danger, fontSize: 12, fontFamily: mono,
    textAlign: 'center', marginBottom: 12,
  },
});
