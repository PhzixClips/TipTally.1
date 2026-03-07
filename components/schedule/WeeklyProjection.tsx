import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import ProgressBar from '../ui/ProgressBar';
import { C } from '../../lib/constants';
import { ScheduledShift } from '../../lib/types';
import { getWeekStart, formatWeekLabel } from '../../lib/helpers';

interface Props {
  upcoming: ScheduledShift[];
  avgEarned: number;
}

export default function WeeklyProjection({ upcoming, avgEarned }: Props) {
  if (upcoming.length === 0) return null;

  const weekMap = new Map<string, ScheduledShift[]>();
  upcoming.forEach(s => {
    const ws = getWeekStart(s.date);
    const existing = weekMap.get(ws) || [];
    existing.push(s);
    weekMap.set(ws, existing);
  });

  const weeks = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  const maxShiftsPerWeek = 4;
  const weekColors = [C.purple, C.blue, C.mint, C.gold, C.peach];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        WEEKLY PROJECTION  |  avg ${Math.round(avgEarned)}/shift
      </Text>
      {weeks.map(([weekStart, shifts], i) => {
        const proj = shifts.length * avgEarned;
        const pct = Math.min(100, (shifts.length / maxShiftsPerWeek) * 100);
        const color = weekColors[i % weekColors.length];
        return (
          <View key={weekStart} style={styles.week}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekLabel}>{formatWeekLabel(weekStart)}</Text>
              <Text style={[styles.weekValue, { color }]}>
                ${Math.round(proj)}  |  {shifts.length} shifts
              </Text>
            </View>
            <ProgressBar percent={pct} color={color} />
          </View>
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
