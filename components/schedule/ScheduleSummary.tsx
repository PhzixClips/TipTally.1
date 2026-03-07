import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatCard from '../ui/StatCard';
import { C } from '../../lib/constants';
import { ScheduledShift, Shift } from '../../lib/types';
import { getDayAverage, getWeekStart } from '../../lib/helpers';

interface Props {
  upcoming: ScheduledShift[];
  allShifts: Shift[];
}

export default function ScheduleSummary({ upcoming, allShifts }: Props) {
  const totalHours = upcoming.reduce((s, sh) => s + sh.estimatedHours, 0);

  // Day-of-week based projection for this week
  const now = new Date();
  const currentWeekStart = getWeekStart(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );
  const thisWeek = upcoming.filter(s => getWeekStart(s.date) === currentWeekStart);
  const projectedWeek = thisWeek.reduce((sum, s) => sum + getDayAverage(allShifts, s.dayOfWeek), 0);
  const projectedMonth = upcoming.reduce((sum, s) => sum + getDayAverage(allShifts, s.dayOfWeek), 0);

  return (
    <View style={styles.grid}>
      <StatCard
        label="Shifts Left"
        value={`${upcoming.length}`}
        sub={`${totalHours} hrs total`}
        accent={C.blue}
      />
      <StatCard
        label="Proj. This Week"
        value={`$${Math.round(projectedWeek).toLocaleString()}`}
        sub="day-of-week estimate"
        accent={C.purple}
      />
      <StatCard
        label="Proj. Month"
        value={`$${Math.round(projectedMonth).toLocaleString()}`}
        sub={`${upcoming.length} shifts remaining`}
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
