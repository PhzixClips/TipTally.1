import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toISODate } from '../../lib/helpers';

export default function AddScheduleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, addScheduledShift, updateScheduledShift } = useData();
  const router = useRouter();

  const existing = id ? data.schedule.find(s => s.id === id) : null;

  const [date, setDate] = useState<Date>(
    existing ? new Date(existing.date + 'T12:00:00') : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(existing?.startTime || '3:00 PM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [role, setRole] = useState(existing?.role || data.settings.roles[0] || 'Server');
  const [hours, setHours] = useState(String(existing?.estimatedHours || data.settings.defaultShiftHours));

  const handleSave = () => {
    const isoDate = toISODate(date);
    if (existing) {
      updateScheduledShift(existing.id, {
        date: isoDate,
        startTime: time,
        role,
        estimatedHours: +hours || data.settings.defaultShiftHours,
      });
    } else {
      addScheduledShift(isoDate, time, role, +hours || data.settings.defaultShiftHours);
    }
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{existing ? 'EDIT SCHEDULED SHIFT' : 'ADD SCHEDULED SHIFT'}</Text>

      <Text style={styles.label}>DATE</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerText}>
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant="dark"
          onChange={(_, d) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (d) setDate(d);
          }}
        />
      )}

      <Text style={styles.label}>START TIME</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.pickerText}>{time}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={(() => {
            const [t, period] = time.split(' ');
            const [h, m] = t.split(':').map(Number);
            const d = new Date();
            d.setHours(period === 'PM' && h !== 12 ? h + 12 : h === 12 && period === 'AM' ? 0 : h, m);
            return d;
          })()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant="dark"
          onChange={(_, d) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (d) {
              setTime(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
            }
          }}
        />
      )}

      <Text style={styles.label}>ROLE</Text>
      <View style={styles.roleRow}>
        {data.settings.roles.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.roleBtn, role === r && styles.roleBtnActive]}
            onPress={() => setRole(r)}
          >
            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Estimated Hours"
        value={hours}
        onChangeText={setHours}
        placeholder="6"
        keyboardType="decimal-pad"
      />

      <Button onPress={handleSave} color={C.blue} filled size="lg" style={{ marginTop: 12 }}>
        {existing ? 'SAVE CHANGES' : 'ADD TO SCHEDULE'}
      </Button>
    </ScrollView>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24 },
  sectionTitle: {
    color: C.blue,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: mono,
    marginBottom: 24,
    fontWeight: '700',
  },
  label: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '600',
  },
  pickerBtn: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pickerText: {
    color: C.text,
    fontFamily: mono,
    fontSize: 14,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleBtn: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  roleBtnActive: {
    borderColor: C.blue,
    backgroundColor: C.blueBg,
  },
  roleText: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '600',
  },
  roleTextActive: {
    color: C.blue,
  },
});
