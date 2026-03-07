import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatCard from '../ui/StatCard';
import { C } from '../../lib/constants';
import { Shift } from '../../lib/types';

interface Props {
  shifts: Shift[];
}

export default function StatsGrid({ shifts }: Props) {
  const count = shifts.length;
  const totalEarned = shifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const avgPerShift = count ? totalEarned / count : 0;
  const bestShift = count ? Math.max(...shifts.map(s => s.totalEarned)) : 0;
  const avgHourly = count
    ? shifts.reduce((s, sh) => s + sh.totalEarned / sh.hours, 0) / count
    : 0;

  return (
    <View style={styles.grid}>
      <StatCard label="TOTAL EARNED" value={`$${Math.round(totalEarned).toLocaleString()}`} accent={C.purple} />
      <StatCard label="AVG / SHIFT" value={`$${Math.round(avgPerShift)}`} accent={C.gold} />
      <StatCard label="BEST SHIFT" value={`$${Math.round(bestShift)}`} accent={C.green} />
      <StatCard label="AVG $/HR" value={`$${avgHourly.toFixed(2)}`} accent={C.blue} />
      <StatCard label="SHIFTS LOGGED" value={`${count}`} accent={C.mint} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
});
