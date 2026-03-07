import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatCard from '../ui/StatCard';
import { C } from '../../lib/constants';
import { ScheduledShift } from '../../lib/types';

interface Props {
  upcoming: ScheduledShift[];
  avgEarned: number;
}

export default function ScheduleSummary({ upcoming, avgEarned }: Props) {
  const totalHours = upcoming.reduce((s, sh) => s + sh.estimatedHours, 0);
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndISO = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
  const nowISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const thisWeek = upcoming.filter(s => s.date >= nowISO && s.date <= weekEndISO);
  const projectedWeek = thisWeek.length * avgEarned;
  const projectedMonth = upcoming.length * avgEarned;

  return (
    <View style={styles.grid}>
      <StatCard
        label="SHIFTS LEFT"
        value={`${upcoming.length}`}
        sub={`${totalHours} hrs total`}
        accent={C.blue}
      />
      <StatCard
        label="PROJ. WEEK"
        value={`$${Math.round(projectedWeek).toLocaleString()}`}
        sub={`~$${Math.round(avgEarned)}/shift`}
        accent={C.purple}
      />
      <StatCard
        label="PROJ. MONTH"
        value={`$${Math.round(projectedMonth).toLocaleString()}`}
        sub={`${upcoming.length} shifts`}
        accent={C.green}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
});
