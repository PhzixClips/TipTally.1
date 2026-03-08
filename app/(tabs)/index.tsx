import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import { getDayOfWeekAverages, groupShiftsByWeek, DayAverage, WeekGroup } from '../../lib/helpers';
import ShiftCard from '../../components/shifts/ShiftCard';
import ShiftForm from '../../components/shifts/ShiftForm';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';

export default function ShiftsScreen() {
  const { data, addShift, deleteShift } = useData();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const shifts = data.shifts;
  const dayAverages = useMemo(() => getDayOfWeekAverages(shifts), [shifts]);
  const weekGroups = useMemo(() => groupShiftsByWeek(shifts), [shifts]);

  // Only show last 3 weeks
  const recentWeeks = weekGroups.slice(0, 3);

  const maxDayAvg = dayAverages.length ? dayAverages[0].avgEarned : 1;
  const bestDay = dayAverages.length ? dayAverages[0] : null;

  // Calculate "vs prior N" for best day
  const bestDayVsPrior = useMemo(() => {
    if (!bestDay || dayAverages.length < 2) return null;
    const othersAvg = dayAverages.slice(1).reduce((s, d) => s + d.avgEarned, 0) / (dayAverages.length - 1);
    const diff = bestDay.avgEarned - othersAvg;
    return { diff: Math.round(Math.abs(diff)), count: dayAverages.length - 1, positive: diff >= 0 };
  }, [dayAverages, bestDay]);

  // Overall stats
  const count = shifts.length;
  const totalEarned = shifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const avgPerShift = count ? totalEarned / count : 0;
  const bestShift = count ? Math.max(...shifts.map(s => s.totalEarned)) : 0;
  const avgHourly = count ? shifts.reduce((s, sh) => s + sh.totalEarned / sh.hours, 0) / count : 0;

  // Selected day data
  const selectedDayData = selectedDay ? dayAverages.find(d => d.day === selectedDay) : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Serving Shifts</Text>
          <TouchableOpacity style={styles.logBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.logBtnText}>+ Log Shift</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings by Day */}
        {dayAverages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Earnings by Day · tap a day to filter</Text>
            {dayAverages.map((da) => (
              <TouchableOpacity
                key={da.day}
                onPress={() => setSelectedDay(selectedDay === da.day ? null : da.day)}
                activeOpacity={0.7}
                style={styles.dayRow}
              >
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayName, selectedDay === da.day && { color: C.green }]}>
                    {da.day}
                  </Text>
                  <Text style={styles.dayStats}>
                    ${Math.round(da.avgEarned)} avg · {da.shiftCount} shift{da.shiftCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <ProgressBar
                  percent={(da.avgEarned / maxDayAvg) * 100}
                  color={selectedDay === da.day ? C.green : C.purple}
                  height={6}
                />
              </TouchableOpacity>
            ))}
            {bestDay && bestDayVsPrior && (
              <Text style={styles.bestDayText}>
                Best day: <Text style={{ color: C.green }}>{bestDay.day}</Text> averaging ${Math.round(bestDay.avgEarned)}/shift{'  '}
                <Text style={{ color: bestDayVsPrior.positive ? C.coral : C.green }}>
                  {bestDayVsPrior.positive ? '▼' : '▲'} ${bestDayVsPrior.diff} vs prior {bestDayVsPrior.count}
                </Text>
              </Text>
            )}
          </View>
        )}

        {/* Selected Day Detail */}
        {selectedDayData && (
          <View style={styles.dayDetailSection}>
            <Text style={styles.dayDetailTitle}>{selectedDayData.dayFull}</Text>
            <Text style={styles.dayDetailSub}>
              {selectedDayData.shiftCount} shift{selectedDayData.shiftCount !== 1 ? 's' : ''} logged
            </Text>
            <View style={styles.divider} />
            {selectedDayData.shifts.map(shift => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onEdit={() => router.push(`/shift/${shift.id}`)}
                onDelete={() => deleteShift(shift.id)}
              />
            ))}
            {/* Day stats */}
            <View style={styles.statsGrid}>
              <StatCard label="TOTAL EARNED" value={`$${Math.round(selectedDayData.totalEarned).toLocaleString()}`} accent={C.purple} />
              <StatCard label="AVG / SHIFT" value={`$${Math.round(selectedDayData.avgEarned)}`} accent={C.gold} />
              <StatCard label="BEST SHIFT" value={`$${Math.round(Math.max(...selectedDayData.shifts.map(s => s.totalEarned)))}`} accent={C.green} />
              <StatCard label="AVG $/HR" value={`$${selectedDayData.avgHourly.toFixed(2)}`} accent={C.blue} />
              <StatCard label="SHIFTS LOGGED" value={`${selectedDayData.shiftCount}`} accent={C.mint} />
            </View>
          </View>
        )}

        {/* Weekly Shift Groups */}
        {recentWeeks.map((week) => (
          <TouchableOpacity
            key={week.weekStart}
            activeOpacity={0.8}
            onPress={() => setExpandedWeek(expandedWeek === week.weekStart ? null : week.weekStart)}
          >
            <View style={styles.card}>
              <View style={styles.weekHeader}>
                <View>
                  <Text style={styles.weekToggle}>
                    <Text style={{ color: C.coral }}>
                      {expandedWeek === week.weekStart ? '▼' : '►'}
                    </Text>{' '}
                    <Text style={{ color: C.blue }}>{week.label}</Text>
                  </Text>
                  <Text style={styles.weekSub}>
                    {week.shifts.length} shift{week.shifts.length !== 1 ? 's' : ''} · {week.totalHours.toFixed(1)}hrs · ${Math.round(week.totalTips)} tips
                  </Text>
                </View>
                <View style={styles.weekRight}>
                  <Text style={styles.weekTotal}>${Math.round(week.totalEarned).toLocaleString()}</Text>
                  <Text style={styles.weekAvg}>${Math.round(week.avgPerShift)}/shift avg</Text>
                </View>
              </View>

              {expandedWeek === week.weekStart && (
                <View style={styles.weekExpanded}>
                  {week.shifts.map(shift => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      onEdit={() => router.push(`/shift/${shift.id}`)}
                      onDelete={() => deleteShift(shift.id)}
                    />
                  ))}
                  {/* Week summary stats */}
                  <View style={styles.weekStatsRow}>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatLabel}>WEEK TOTAL</Text>
                      <Text style={[styles.weekStatVal, { color: C.green }]}>
                        ${Math.round(week.totalEarned).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatLabel}>AVG/SHIFT</Text>
                      <Text style={[styles.weekStatVal, { color: C.purple }]}>
                        ${Math.round(week.avgPerShift)}
                      </Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatLabel}>HOURS</Text>
                      <Text style={[styles.weekStatVal, { color: C.gold }]}>
                        {week.totalHours.toFixed(1)}h
                      </Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatLabel}>TIPS</Text>
                      <Text style={[styles.weekStatVal, { color: C.blue }]}>
                        ${Math.round(week.totalTips)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Overall Stats */}
        {count > 0 && (
          <View style={styles.statsGrid}>
            <StatCard label="TOTAL EARNED" value={`$${Math.round(totalEarned).toLocaleString()}`} accent={C.purple} />
            <StatCard label="AVG / SHIFT" value={`$${Math.round(avgPerShift)}`} accent={C.gold} />
            <StatCard label="BEST SHIFT" value={`$${Math.round(bestShift)}`} accent={C.green} />
            <StatCard label="AVG $/HR" value={`$${avgHourly.toFixed(2)}`} accent={C.blue} />
            <StatCard label="SHIFTS LOGGED" value={`${count}`} accent={C.mint} />
          </View>
        )}

        {/* Empty state */}
        {count === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No shifts logged yet</Text>
            <Text style={styles.emptyText}>Tap "+ Log Shift" to record your first shift</Text>
          </View>
        )}
      </ScrollView>

      <ShiftForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSave={(date, hours, tips, tipOut) => addShift(date, hours, tips, tipOut)}
        hourlyWage={data.settings.hourlyWage}
      />
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  title: {
    color: C.purple,
    fontSize: 18,
    fontWeight: '700',
  },
  logBtn: {
    borderWidth: 1,
    borderColor: C.purple + '40',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logBtnText: {
    color: C.purple,
    fontSize: 12,
    fontFamily: mono,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: mono,
    marginBottom: 16,
  },
  dayRow: {
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayName: {
    color: C.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  dayStats: {
    color: C.textSoft,
    fontSize: 11,
    fontFamily: mono,
  },
  bestDayText: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: mono,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  dayDetailSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dayDetailTitle: {
    color: C.green,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dayDetailSub: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: mono,
    marginTop: 4,
    marginBottom: 12,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: C.border,
    marginBottom: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weekToggle: {
    fontSize: 13,
    fontWeight: '600',
  },
  weekSub: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: mono,
    marginTop: 4,
  },
  weekRight: {
    alignItems: 'flex-end',
  },
  weekTotal: {
    color: C.green,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: mono,
  },
  weekAvg: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: mono,
    marginTop: 2,
  },
  weekExpanded: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
  },
  weekStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  weekStat: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: 70,
  },
  weekStatLabel: {
    color: C.textMuted,
    fontSize: 8,
    fontFamily: mono,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 4,
  },
  weekStatVal: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: mono,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
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
