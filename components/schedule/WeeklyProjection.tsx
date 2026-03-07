import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import ProgressBar from '../ui/ProgressBar';
import { C } from '../../lib/constants';
import { ScheduledShift, Shift } from '../../lib/types';
import { getWeekStart, formatWeekLabel, getDayAverage } from '../../lib/helpers';

interface Props {
  schedule: ScheduledShift[];
  allShifts: Shift[];
}

export default function WeeklyProjection({ schedule, allShifts }: Props) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  if (schedule.length === 0) return null;

  const weekMap = new Map<string, ScheduledShift[]>();
  schedule.forEach(s => {
    const ws = getWeekStart(s.date);
    const existing = weekMap.get(ws) || [];
    existing.push(s);
    weekMap.set(ws, existing);
  });

  const weeks = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  const maxProj = Math.max(...weeks.map(([, shifts]) =>
    shifts.reduce((sum, s) => sum + getDayAverage(allShifts, s.dayOfWeek), 0)
  ));

  const weekColors = [C.purple, C.blue, C.mint, C.gold, C.peach];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Projection · day-of-week avg</Text>
      {weeks.map(([weekStart, shifts], i) => {
        const logged = shifts.filter(s => s.logged);
        const unlogged = shifts.filter(s => !s.logged);

        const earnedAmount = logged.reduce((sum, s) => {
          if (s.loggedShiftId) {
            const actual = allShifts.find(sh => sh.id === s.loggedShiftId);
            if (actual) return sum + actual.totalEarned;
          }
          return sum + getDayAverage(allShifts, s.dayOfWeek);
        }, 0);

        const projectedAmount = unlogged.reduce((sum, s) =>
          sum + getDayAverage(allShifts, s.dayOfWeek), 0
        );

        const totalProj = earnedAmount + projectedAmount;
        const pct = maxProj > 0 ? Math.min(100, (totalProj / maxProj) * 100) : 0;
        const color = weekColors[i % weekColors.length];
        const isExpanded = expandedWeek === weekStart;

        return (
          <TouchableOpacity
            key={weekStart}
            onPress={() => setExpandedWeek(isExpanded ? null : weekStart)}
            activeOpacity={0.7}
            style={styles.week}
          >
            <View style={styles.weekHeader}>
              <Text style={styles.weekLabel}>
                {isExpanded ? '▼' : '►'} {formatWeekLabel(weekStart)}
              </Text>
              <Text style={[styles.weekValue, { color }]}>
                ${Math.round(totalProj)} proj · {shifts.length} shifts
              </Text>
            </View>
            <ProgressBar percent={pct} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  title: {
    color: C.textMuted,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: mono,
    marginBottom: 16,
    fontWeight: '600',
  },
  week: { marginBottom: 14 },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekLabel: {
    color: C.textSoft,
    fontSize: 11,
    fontFamily: mono,
  },
  weekValue: {
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '600',
  },
});
