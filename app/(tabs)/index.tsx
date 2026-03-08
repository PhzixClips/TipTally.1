import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { getWeekStart, toISODate, getDayOfWeek } from '../../lib/helpers';

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export default function HomeScreen() {
  const { data } = useData();
  const { colors, accent } = useTheme();

  // Most recent shift
  const recentShift = useMemo(() => {
    const sorted = [...data.shifts].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] || null;
  }, [data.shifts]);

  // Current week data
  const currentWeekStart = getWeekStart(toISODate(new Date()));
  const weekShifts = useMemo(
    () => data.shifts.filter((s) => getWeekStart(s.date) === currentWeekStart),
    [data.shifts, currentWeekStart],
  );

  const weekTotal = weekShifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const weekSales = weekShifts.reduce((s, sh) => s + (sh.totalSales || 0), 0);
  const weekTipout = weekShifts.reduce((s, sh) => s + sh.tipOut, 0);

  // Group by day for bar chart
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayTotals = useMemo(() => {
    const map: Record<string, number> = {};
    dayOrder.forEach((d) => (map[d] = 0));
    weekShifts.forEach((s) => {
      const day = getDayOfWeek(s.date);
      map[day] = (map[day] || 0) + s.totalEarned;
    });
    return map;
  }, [weekShifts]);
  const maxDay = Math.max(1, ...Object.values(dayTotals));

  // Recent shift breakdown values
  const recentTips = recentShift ? recentShift.tips : 0;
  const recentTipout = recentShift ? recentShift.tipOut : 0;
  const recentHourly = recentShift && recentShift.hours > 0
    ? recentShift.totalEarned / recentShift.hours
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            🐷 TipTally
          </Text>
          <Text style={[styles.bellIcon, { color: colors.textFaint }]}>🔔</Text>
        </View>

        {/* Tonight's Earnings Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroAmount, { color: accent.primary }]}>
            ${recentShift ? Math.round(recentShift.totalEarned) : 0}
          </Text>
          <Text style={[styles.heroLabel, { color: colors.textMuted }]}>
            {recentShift ? recentShift.displayDate : 'Tonight'}
          </Text>
        </View>

        {/* Breakdown Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSoft }]}>Tips:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ${Math.round(recentTips)}
            </Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSoft }]}>Tipout:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              -${Math.round(recentTipout)}
            </Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSoft }]}>Hourly:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ${recentHourly.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* This Week Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Week header row */}
          <View style={styles.weekHeaderRow}>
            <Text style={[styles.weekLabel, { color: colors.text }]}>This Week</Text>
            <Text style={[styles.weekTotal, { color: accent.primary }]}>
              ${weekTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
          </View>

          {/* Bar chart */}
          <View style={styles.barChart}>
            {dayOrder.map((day) => {
              const dayTotal = dayTotals[day] || 0;
              return (
                <View key={day} style={styles.barColumn}>
                  {dayTotal > 0 && (
                    <Text style={[styles.barValue, { color: colors.textMuted }]}>
                      ${Math.round(dayTotal)}
                    </Text>
                  )}
                  <View
                    style={{
                      width: 28,
                      height: Math.max(4, (dayTotal / maxDay) * 120),
                      backgroundColor: accent.primary,
                      borderRadius: 4,
                      marginVertical: 4,
                    }}
                  />
                  <Text style={[styles.barDayLabel, { color: colors.textMuted }]}>{day}</Text>
                </View>
              );
            })}
          </View>

          {/* Week summary row */}
          <View style={[styles.weekSummaryRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.weekSummaryText, { color: colors.textMuted }]}>
              Sales: ${weekSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.weekSummaryText, { color: colors.textMuted }]}>
              Tipout: ${Math.round(weekTipout)}
            </Text>
          </View>
        </View>

        {/* Empty state */}
        {data.shifts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textSoft }]}>No shifts yet</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Log your first shift from the Shifts tab
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bellIcon: {
    fontSize: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroAmount: {
    fontSize: 56,
    fontWeight: '800',
    fontFamily: mono,
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: mono,
  },
  breakdownDivider: {
    height: 1,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekTotal: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: mono,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 140,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: mono,
  },
  barDayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  weekSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  weekSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: mono,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: mono,
  },
});
