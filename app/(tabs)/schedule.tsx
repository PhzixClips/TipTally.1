import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';
import ShiftForm from '../../components/shifts/ShiftForm';
import Button from '../../components/ui/Button';
import {
  getDayOfWeek, getDayAverage, getWeekStart, formatWeekLabel,
  getMonthWeeks, getCurrentMonthRange, isToday, formatDisplayDate,
} from '../../lib/helpers';
import { ScheduledShift } from '../../lib/types';

export default function ScheduleScreen() {
  const { data, logScheduledShift, deleteScheduledShift, addScheduledShift } = useData();
  const router = useRouter();
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [logTarget, setLogTarget] = useState<string | null>(null);

  const allShifts = data.shifts;
  const schedule = data.schedule;

  // Filter upcoming (unlogged) for summary stats
  const upcoming = useMemo(() =>
    schedule.filter(s => !s.logged).sort((a, b) => a.date.localeCompare(b.date)),
    [schedule]
  );

  // Current month range
  const monthRange = useMemo(() => getCurrentMonthRange(), []);

  // All schedule entries for current month (both logged and unlogged)
  const monthSchedule = useMemo(() =>
    schedule
      .filter(s => s.date >= monthRange.start && s.date <= monthRange.end)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [schedule, monthRange]
  );

  // Weeks of current month
  const monthWeeks = useMemo(() => getMonthWeeks(), []);

  // Group month schedule by week
  const weekGroups = useMemo(() => {
    return monthWeeks.map(ws => {
      // Week end is 6 days after week start
      const wsDate = new Date(ws + 'T12:00:00');
      const weDate = new Date(wsDate);
      weDate.setDate(weDate.getDate() + 6);
      const weISO = `${weDate.getFullYear()}-${String(weDate.getMonth() + 1).padStart(2, '0')}-${String(weDate.getDate()).padStart(2, '0')}`;

      const weekShifts = monthSchedule.filter(s => {
        const sWeek = getWeekStart(s.date);
        return sWeek === ws;
      });

      // Calculate earned (from logged shifts) and projected (from unlogged)
      const logged = weekShifts.filter(s => s.logged);
      const unlogged = weekShifts.filter(s => !s.logged);

      // For logged shifts, find the actual shift earnings
      const earnedAmount = logged.reduce((sum, s) => {
        if (s.loggedShiftId) {
          const actualShift = allShifts.find(sh => sh.id === s.loggedShiftId);
          if (actualShift) return sum + actualShift.totalEarned;
        }
        // Fallback: use day average
        return sum + getDayAverage(allShifts, s.dayOfWeek);
      }, 0);

      // For unlogged, project using day-of-week averages
      const projectedAmount = unlogged.reduce((sum, s) => {
        return sum + getDayAverage(allShifts, s.dayOfWeek);
      }, 0);

      return {
        weekStart: ws,
        label: formatWeekLabel(ws),
        shifts: weekShifts,
        loggedCount: logged.length,
        unloggedCount: unlogged.length,
        earnedAmount,
        projectedAmount,
        totalAmount: earnedAmount + projectedAmount,
      };
    }).filter(w => w.shifts.length > 0);
  }, [monthWeeks, monthSchedule, allShifts]);

  // Summary calculations
  const totalHours = upcoming.reduce((s, sh) => s + sh.estimatedHours, 0);

  // This week projection (day-of-week based)
  const now = new Date();
  const currentWeekStart = getWeekStart(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  const thisWeekShifts = upcoming.filter(s => getWeekStart(s.date) === currentWeekStart);
  const projectedWeek = thisWeekShifts.reduce((sum, s) => sum + getDayAverage(allShifts, s.dayOfWeek), 0);

  // Month projection
  const projectedMonth = upcoming.reduce((sum, s) => sum + getDayAverage(allShifts, s.dayOfWeek), 0);

  // Max weekly amount for progress bar scaling
  const maxWeekAmount = weekGroups.length ? Math.max(...weekGroups.map(w => w.totalAmount)) : 1;

  const logTargetEntry = logTarget ? schedule.find(s => s.id === logTarget) : null;

  // Get actual earnings for a logged scheduled shift
  const getLoggedEarnings = (s: ScheduledShift): number | null => {
    if (!s.logged || !s.loggedShiftId) return null;
    const actual = allShifts.find(sh => sh.id === s.loggedShiftId);
    return actual ? actual.totalEarned : null;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Schedule</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/schedule/scan')}>
              <Text style={styles.scanBtnText}>Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/schedule/add')}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.statsGrid}>
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
        </View>
        <View style={styles.statsGridSingle}>
          <StatCard
            label="Proj. Month"
            value={`$${Math.round(projectedMonth).toLocaleString()}`}
            sub={`${upcoming.length} shifts remaining`}
            accent={C.green}
          />
        </View>

        {/* Weekly Projection */}
        {weekGroups.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Projection · day-of-week avg</Text>
            {weekGroups.map((week) => (
              <View key={week.weekStart} style={styles.weekSection}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedWeek(expandedWeek === week.weekStart ? null : week.weekStart)}
                >
                  <View style={styles.weekRow}>
                    <Text style={styles.weekLabel}>
                      <Text style={{ color: C.textSoft }}>
                        {expandedWeek === week.weekStart ? '▼' : '►'}
                      </Text>{' '}
                      {week.label}
                    </Text>
                    <View style={styles.weekAmounts}>
                      {week.earnedAmount > 0 && (
                        <Text style={styles.weekEarned}>${Math.round(week.earnedAmount)} earned</Text>
                      )}
                      {week.projectedAmount > 0 && (
                        <Text style={styles.weekProjected}>
                          {week.earnedAmount > 0 ? '  +  ' : ''}${Math.round(week.projectedAmount)} proj
                        </Text>
                      )}
                      <Text style={styles.weekShiftCount}> · {week.shifts.length} shift{week.shifts.length !== 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                  {/* Dual progress bar */}
                  <View style={styles.dualBar}>
                    <View style={[styles.dualBarTrack, { backgroundColor: C.purple + '18' }]}>
                      <View style={[
                        styles.dualBarEarned,
                        { width: `${(week.earnedAmount / maxWeekAmount) * 100}%` }
                      ]} />
                      <View style={[
                        styles.dualBarProjected,
                        { width: `${(week.projectedAmount / maxWeekAmount) * 100}%` }
                      ]} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded week shifts */}
                {expandedWeek === week.weekStart && (
                  <View style={styles.weekExpanded}>
                    {week.shifts.map((s) => {
                      const loggedEarnings = getLoggedEarnings(s);
                      const dayNum = s.date.split('-')[2];
                      const today = isToday(s.date);
                      const dayAvg = getDayAverage(allShifts, s.dayOfWeek);

                      return (
                        <View key={s.id} style={[styles.schedCard, today && styles.schedCardToday]}>
                          <View style={styles.schedRow}>
                            <View style={styles.schedDateCol}>
                              <Text style={styles.schedDayName}>{s.dayOfWeek}</Text>
                              <Text style={[styles.schedDayNum, today && { color: C.green }]}>
                                {parseInt(dayNum)}
                              </Text>
                            </View>
                            <View style={styles.schedInfo}>
                              <View style={styles.schedTitleRow}>
                                <Text style={[styles.schedDate, today && { color: C.green }]}>
                                  {s.displayDate}
                                </Text>
                                {s.logged && (
                                  <View style={styles.loggedBadge}>
                                    <Text style={styles.loggedBadgeText}>Logged</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.schedDetail}>
                                {s.startTime} · {s.role}
                              </Text>
                            </View>
                            <View style={styles.schedRight}>
                              {s.logged && loggedEarnings !== null ? (
                                <Text style={styles.schedEarnedAmount}>${Math.round(loggedEarnings)}</Text>
                              ) : (
                                <>
                                  <Text style={styles.schedEstAmount}>~${Math.round(dayAvg)}</Text>
                                  <Text style={styles.schedEstSub}>{s.dayOfWeek} avg</Text>
                                </>
                              )}
                              {!s.logged && (
                                <TouchableOpacity
                                  style={styles.logShiftBtn}
                                  onPress={() => setLogTarget(s.id)}
                                >
                                  <Text style={styles.logShiftBtnText}>Log ✓</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    {/* Week footer */}
                    <View style={styles.weekFooter}>
                      <Text style={styles.weekFooterLeft}>
                        {week.loggedCount} logged · {week.unloggedCount} remaining
                      </Text>
                      <Text style={styles.weekFooterRight}>
                        Total: ${Math.round(week.totalAmount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Upcoming individual cards (unlogged, for quick access) */}
        {upcoming.slice(0, 5).map(s => {
          const dayNum = s.date.split('-')[2];
          const today = isToday(s.date);
          const dayAvg = getDayAverage(allShifts, s.dayOfWeek);

          return (
            <View key={s.id} style={[styles.schedCard, today && styles.schedCardToday, { marginBottom: 10 }]}>
              <View style={styles.schedRow}>
                <View style={styles.schedDateCol}>
                  <Text style={styles.schedDayName}>{s.dayOfWeek}</Text>
                  <Text style={[styles.schedDayNum, today && { color: C.green }]}>{parseInt(dayNum)}</Text>
                </View>
                <View style={styles.schedInfo}>
                  <Text style={[styles.schedDate, today && { color: C.green }]}>{s.displayDate}</Text>
                  <Text style={styles.schedDetail}>{s.startTime} · {s.role}</Text>
                </View>
                <View style={styles.schedRight}>
                  <Text style={styles.schedEstAmount}>~${Math.round(dayAvg)}</Text>
                  <Text style={styles.schedEstSub}>{s.dayOfWeek} avg</Text>
                  <TouchableOpacity style={styles.logShiftBtn} onPress={() => setLogTarget(s.id)}>
                    <Text style={styles.logShiftBtnText}>Log ✓</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Empty state */}
        {schedule.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No shifts scheduled</Text>
            <Text style={styles.emptyText}>Tap "+ Add" or "Scan" to add shifts</Text>
          </View>
        )}
      </ScrollView>

      {/* Log shift modal */}
      {logTargetEntry && (
        <ShiftForm
          visible={true}
          onClose={() => setLogTarget(null)}
          onSave={(date, hours, totalEarned) => {
            logScheduledShift(logTargetEntry.id, hours, totalEarned);
            setLogTarget(null);
          }}
          initialDate={logTargetEntry.date}
          initialHours={String(logTargetEntry.estimatedHours)}
          title="LOG SCHEDULED SHIFT"
          buttonLabel="LOG SHIFT"
          hourlyWage={data.settings.hourlyWage}
        />
      )}
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: C.blue,
    fontSize: 18,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scanBtn: {
    borderWidth: 1,
    borderColor: C.purple + '40',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: C.purpleBg,
  },
  scanBtnText: {
    color: C.purple,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '600',
  },
  addBtn: {
    borderWidth: 1,
    borderColor: C.blue + '40',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: C.blue,
  },
  addBtnText: {
    color: C.bg,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statsGridSingle: {
    marginBottom: 16,
    maxWidth: '48%',
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
  weekSection: {
    marginBottom: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weekLabel: {
    color: C.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  weekAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  weekEarned: {
    color: C.green,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '600',
  },
  weekProjected: {
    color: C.purple,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '600',
  },
  weekShiftCount: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: mono,
  },
  dualBar: {
    marginBottom: 4,
  },
  dualBarTrack: {
    height: 8,
    borderRadius: 99,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  dualBarEarned: {
    height: 8,
    backgroundColor: C.green,
    borderRadius: 99,
  },
  dualBarProjected: {
    height: 8,
    backgroundColor: C.purple,
    borderRadius: 99,
  },
  weekExpanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  schedCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  schedCardToday: {
    backgroundColor: C.greenBg,
    borderColor: C.greenBorder,
  },
  schedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schedDateCol: {
    alignItems: 'center',
    minWidth: 36,
    marginRight: 12,
  },
  schedDayName: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: mono,
    fontWeight: '600',
    letterSpacing: 1,
  },
  schedDayNum: {
    color: C.text,
    fontWeight: '800',
    fontSize: 18,
  },
  schedInfo: {
    flex: 1,
  },
  schedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  schedDate: {
    color: C.text,
    fontWeight: '600',
    fontSize: 13,
  },
  schedDetail: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: mono,
    marginTop: 3,
  },
  loggedBadge: {
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.green,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  loggedBadgeText: {
    color: C.green,
    fontSize: 8,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  schedRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  schedEarnedAmount: {
    color: C.green,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: mono,
  },
  schedEstAmount: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 12,
  },
  schedEstSub: {
    color: C.textFaint,
    fontFamily: mono,
    fontSize: 9,
  },
  logShiftBtn: {
    backgroundColor: C.purpleBg,
    borderWidth: 1,
    borderColor: C.purple + '40',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  logShiftBtnText: {
    color: C.purple,
    fontSize: 10,
    fontFamily: mono,
    fontWeight: '700',
  },
  weekFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  weekFooterLeft: {
    color: C.green,
    fontSize: 10,
    fontFamily: mono,
  },
  weekFooterRight: {
    color: C.text,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '700',
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
