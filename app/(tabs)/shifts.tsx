import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import ShiftForm from '../../components/shifts/ShiftForm';
import ShiftCard from '../../components/shifts/ShiftCard';

const formatShiftDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${month} ${d}`;
};

export default function ShiftsScreen() {
  const { data, addShift } = useData();
  const { colors, accent } = useTheme();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const shifts = useMemo(
    () => [...data.shifts].sort((a, b) => b.date.localeCompare(a.date)),
    [data.shifts]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {'\uD83D\uDC37'} TipTally
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: accent.primary }]}
            onPress={() => setShowForm(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Shifts</Text>

        {/* Shift Cards */}
        {shifts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.textSoft }]}>No shifts logged yet</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Tap "+" to record your first shift
            </Text>
          </View>
        ) : (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onPress={() => router.push(`/shift/${shift.id}`)}
            />
          ))
        )}
      </ScrollView>

      <ShiftForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSave={(date, hours, tips, tipOut, extras) => addShift(date, hours, tips, tipOut, extras)}
        roles={data.settings.roles}
        defaultRole={data.settings.lastRole}
        initialHours={String(data.settings.defaultShiftHours)}
        hourlyWage={data.settings.hourlyWage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});
