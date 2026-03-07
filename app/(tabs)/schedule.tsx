import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import ScheduleSummary from '../../components/schedule/ScheduleSummary';
import WeeklyProjection from '../../components/schedule/WeeklyProjection';
import ScheduleCard from '../../components/schedule/ScheduleCard';
import ShiftForm from '../../components/shifts/ShiftForm';
import Button from '../../components/ui/Button';

export default function ScheduleScreen() {
  const { data, logScheduledShift, deleteScheduledShift } = useData();
  const router = useRouter();
  const [logTarget, setLogTarget] = useState<string | null>(null);

  const upcoming = data.schedule
    .filter(s => !s.logged)
    .sort((a, b) => a.date.localeCompare(b.date));

  const avgEarned = data.shifts.length
    ? data.shifts.reduce((s, sh) => s + sh.totalEarned, 0) / data.shifts.length
    : 275;

  const logTargetEntry = logTarget ? data.schedule.find(s => s.id === logTarget) : null;

  return (
    <View style={styles.container}>
      <FlatList
        data={upcoming}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>UPCOMING SCHEDULE</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button onPress={() => router.push('/schedule/scan')} color={C.purple} size="sm">SCAN</Button>
                <Button onPress={() => router.push('/schedule/add')} color={C.blue} filled size="sm">+ ADD</Button>
              </View>
            </View>
            <ScheduleSummary upcoming={upcoming} avgEarned={avgEarned} />
            <WeeklyProjection upcoming={upcoming} avgEarned={avgEarned} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No shifts scheduled</Text>
            <Text style={styles.emptyText}>Tap "+ ADD" to schedule upcoming shifts</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ScheduleCard
            shift={item}
            avgEarned={avgEarned}
            onLog={() => setLogTarget(item.id)}
            onEdit={() => router.push(`/schedule/add?id=${item.id}`)}
            onDelete={() => deleteScheduledShift(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {logTargetEntry && (
        <ShiftForm
          visible={true}
          onClose={() => setLogTarget(null)}
          onSave={(date, hours, totalEarned) => {
            logScheduledShift(logTargetEntry.id, hours, totalEarned);
            setLogTarget(null);
          }}
          initialDate={logTargetEntry.date}
          initialHours={String(logTargetEntry.estimatedHours)}
          title="LOG SCHEDULED SHIFT"
          buttonLabel="LOG SHIFT"
          hourlyWage={data.settings.hourlyWage}
        />
      )}
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
    color: C.blue,
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
