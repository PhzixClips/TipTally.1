import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { C } from '../../lib/constants';
import { Shift } from '../../lib/types';

interface Props {
  shifts: Shift[];
}

export default function EarningsChart({ shifts }: Props) {
  if (shifts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>CUMULATIVE EARNINGS</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Log shifts to see your earnings chart</Text>
        </View>
      </View>
    );
  }

  const sorted = [...shifts].sort((a, b) => a.date.localeCompare(b.date));
  const last30: { label: string; value: number }[] = [];
  let running = 0;

  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayShifts = sorted.filter(s => s.date === iso);
    dayShifts.forEach(s => { running += s.totalEarned; });
    last30.push({ label, value: running });
  }

  const totalEarned = shifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const labels = last30.filter((_, i) => i % 7 === 0).map(d => d.label);
  const dataPoints = last30.map(d => d.value);

  const hasData = dataPoints.some(v => v > 0);
  if (!hasData) {
    dataPoints[dataPoints.length - 1] = 1;
  }

  const screenWidth = Dimensions.get('window').width - 48;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>CUMULATIVE SHIFT INCOME</Text>
          <Text style={styles.value}>${Math.round(totalEarned).toLocaleString()}</Text>
        </View>
        <View style={styles.periodBadge}>
          <Text style={styles.period}>30d</Text>
        </View>
      </View>
      <LineChart
        data={{
          labels,
          datasets: [{ data: dataPoints }],
        }}
        width={screenWidth}
        height={180}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        chartConfig={{
          backgroundColor: C.card,
          backgroundGradientFrom: C.card,
          backgroundGradientTo: C.card,
          color: () => C.green,
          labelColor: () => C.textFaint,
          propsForLabels: {
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 9,
          },
          propsForBackgroundLines: {
            stroke: C.border,
          },
          decimalPlaces: 0,
        }}
        bezier
        style={{ borderRadius: 12, marginLeft: -10 }}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  subtitle: {
    color: C.textMuted,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: mono,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    color: C.green,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: mono,
  },
  periodBadge: {
    backgroundColor: C.greenBg,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  period: {
    color: C.green,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '700',
  },
  title: {
    color: C.textMuted,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: mono,
    marginBottom: 14,
    fontWeight: '600',
  },
  empty: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: C.textFaint,
    fontSize: 13,
    fontFamily: mono,
  },
});
