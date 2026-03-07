import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import StatCard from '../../components/ui/StatCard';
import EarningsChart from '../../components/shifts/EarningsChart';
import { isToday } from '../../lib/helpers';

export default function DashboardScreen() {
  const { data } = useData();
  const router = useRouter();

  const shifts = data.shifts;
  const count = shifts.length;
  const totalEarned = shifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const avgPerShift = count ? totalEarned / count : 0;
  const bestShift = count ? Math.max(...shifts.map(s => s.totalEarned)) : 0;
  const avgHourly = count
    ? shifts.reduce((s, sh) => s + sh.totalEarned / sh.hours, 0) / count
    : 0;
  const totalTips = shifts.reduce((s, sh) => s + sh.tips, 0);

  const upcoming = data.schedule
    .filter(s => !s.logged)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextShift = upcoming[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>TIPTALLY</Text>
        <Text style={styles.subtitle}>TIP & SHIFT TRACKER</Text>
      </View>

      {/* Next Shift Card */}
      {nextShift && (
        <View style={[styles.nextShift, isToday(nextShift.date) && styles.nextShiftToday]}>
          <View style={styles.nextShiftTop}>
            <View style={styles.nextLabelWrap}>
              <Text style={styles.nextLabel}>
                {isToday(nextShift.date) ? "TODAY'S SHIFT" : 'NEXT SHIFT'}
              </Text>
            </View>
            <Text style={styles.nextEst}>~${Math.round(avgPerShift || 275)}</Text>
          </View>
          <Text style={styles.nextDate}>{nextShift.displayDate} - {nextShift.dayOfWeek}</Text>
          <Text style={styles.nextDetail}>
            {nextShift.startTime}  |  {nextShift.role}  |  ~{nextShift.estimatedHours}hrs
          </Text>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard label="TOTAL EARNED" value={`$${Math.round(totalEarned).toLocaleString()}`} accent={C.purple} />
        <StatCard label="TOTAL TIPS" value={`$${Math.round(totalTips).toLocaleString()}`} accent={C.gold} />
        <StatCard label="AVG / SHIFT" value={`$${Math.round(avgPerShift)}`} accent={C.green} />
        <StatCard label="AVG $/HR" value={`$${avgHourly.toFixed(2)}`} accent={C.blue} />
        <StatCard label="BEST SHIFT" value={`$${Math.round(bestShift)}`} accent={C.peach} />
        <StatCard label="SHIFTS LOGGED" value={`${count}`} accent={C.mint} />
      </View>

      {/* Earnings Chart */}
      <EarningsChart shifts={shifts} />

      {/* Schedule Preview */}
      {upcoming.length > 0 && (
        <View style={styles.schedulePreview}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>UPCOMING SHIFTS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
              <Text style={styles.seeAll}>SEE ALL</Text>
            </TouchableOpacity>
          </View>
          {upcoming.slice(0, 3).map(s => (
            <View key={s.id} style={styles.scheduleRow}>
              <View>
                <Text style={styles.schedDate}>{s.displayDate} - {s.dayOfWeek}</Text>
                <Text style={styles.schedDetail}>{s.startTime} | {s.role}</Text>
              </View>
              <Text style={styles.schedEst}>~${Math.round(avgPerShift || 275)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  appName: {
    color: C.green,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: mono,
  },
  subtitle: {
    color: C.textFaint,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
    fontFamily: mono,
    fontWeight: '600',
  },
  nextShift: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.purple + '30',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  nextShiftToday: {
    borderColor: C.greenBorder,
    backgroundColor: C.greenBg,
  },
  nextShiftTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextLabelWrap: {},
  nextLabel: {
    color: C.textMuted,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: mono,
    fontWeight: '600',
  },
  nextEst: {
    color: C.purple,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: mono,
  },
  nextDate: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
  },
  nextDetail: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 6,
    fontFamily: mono,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  schedulePreview: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 18,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scheduleTitle: {
    color: C.blue,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: mono,
    fontWeight: '600',
  },
  seeAll: {
    color: C.blue,
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  schedDate: {
    color: C.text,
    fontSize: 13,
    fontWeight: '600',
  },
  schedDetail: {
    color: C.textMuted,
    fontSize: 10,
    marginTop: 3,
    fontFamily: mono,
  },
  schedEst: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 12,
  },
});
