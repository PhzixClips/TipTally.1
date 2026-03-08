import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { C } from '../../lib/constants';
import { Goal, Shift } from '../../lib/types';
import { toISODate, getWeekStart } from '../../lib/helpers';
import ProgressBar from '../ui/ProgressBar';

interface Props {
  goals: Goal[];
  shifts: Shift[];
}

export default function GoalTracker({ goals, shifts }: Props) {
  const activeGoal = goals.find(g => g.isActive);
  if (!activeGoal) return null;

  const now = new Date();
  const today = toISODate(now);
  const weekStart = getWeekStart(today);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const yearStart = `${now.getFullYear()}-01-01`;

  let relevantShifts: Shift[];
  let periodLabel: string;

  switch (activeGoal.type) {
    case 'daily':
      relevantShifts = shifts.filter(s => s.date === today);
      periodLabel = 'Today';
      break;
    case 'weekly':
      relevantShifts = shifts.filter(s => s.date >= weekStart && s.date <= today);
      periodLabel = 'This Week';
      break;
    case 'monthly':
      relevantShifts = shifts.filter(s => s.date >= monthStart && s.date <= today);
      periodLabel = 'This Month';
      break;
    case 'yearly':
      relevantShifts = shifts.filter(s => s.date >= yearStart && s.date <= today);
      periodLabel = 'This Year';
      break;
  }

  if (activeGoal.jobId) {
    relevantShifts = relevantShifts.filter(s => s.jobId === activeGoal.jobId);
  }

  const earned = relevantShifts.reduce((sum, s) => sum + s.totalEarned, 0);
  const pct = Math.min(100, (earned / activeGoal.target) * 100);
  const remaining = Math.max(0, activeGoal.target - earned);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{periodLabel} Goal</Text>
        <Text style={styles.amount}>${Math.round(earned)} / ${activeGoal.target.toLocaleString()}</Text>
      </View>
      <ProgressBar percent={pct} color={pct >= 100 ? C.green : C.gold} height={8} />
      <Text style={styles.remaining}>
        {pct >= 100 ? `Goal reached! +$${Math.round(earned - activeGoal.target)} over` : `$${Math.round(remaining)} to go`}
      </Text>
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: C.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1, fontWeight: '600' },
  amount: { color: C.gold, fontSize: 12, fontFamily: mono, fontWeight: '700' },
  remaining: { color: C.textFaint, fontSize: 10, fontFamily: mono, marginTop: 6 },
});
