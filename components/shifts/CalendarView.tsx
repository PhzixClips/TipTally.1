import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { C } from '../../lib/constants';
import { Shift } from '../../lib/types';
import { toISODate } from '../../lib/helpers';

interface Props {
  shifts: Shift[];
  onDayPress: (date: string, shifts: Shift[]) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarView({ shifts, onDayPress }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Map shifts by date for O(1) lookup
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    shifts.forEach(s => {
      const existing = map.get(s.date) || [];
      existing.push(s);
      map.set(s.date, existing);
    });
    return map;
  }, [shifts]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    const days: Array<{ date: string; day: number; inMonth: boolean; isToday: boolean }> = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const iso = toISODate(new Date(prevYear, prevMonth, d));
      days.push({ date: iso, day: d, inMonth: false, isToday: false });
    }

    // Current month days
    const todayISO = toISODate(today);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISODate(new Date(year, month, d));
      days.push({ date: iso, day: d, inMonth: true, isToday: iso === todayISO });
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const iso = toISODate(new Date(nextYear, nextMonth, d));
      days.push({ date: iso, day: d, inMonth: false, isToday: false });
    }

    return days;
  }, [year, month]);

  // Month totals
  const monthShifts = useMemo(() => {
    return shifts.filter(s => {
      const [sy, sm] = s.date.split('-').map(Number);
      return sy === year && sm === month + 1;
    });
  }, [shifts, year, month]);

  const monthTotal = monthShifts.reduce((s, sh) => s + sh.totalEarned, 0);
  const monthTips = monthShifts.reduce((s, sh) => s + sh.tips, 0);
  const monthHours = monthShifts.reduce((s, sh) => s + sh.hours, 0);

  // Get earnings intensity for heat coloring
  const maxDayEarnings = useMemo(() => {
    let max = 0;
    shiftsByDate.forEach(dayShifts => {
      const total = dayShifts.reduce((s, sh) => s + sh.totalEarned, 0);
      if (total > max) max = total;
    });
    return max || 1;
  }, [shiftsByDate]);

  const navigateMonth = (dir: number) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(null);
  };

  const handleDayPress = (date: string, inMonth: boolean) => {
    if (!inMonth) return;
    const dayShifts = shiftsByDate.get(date) || [];
    setSelectedDate(selectedDate === date ? null : date);
    onDayPress(date, dayShifts);
  };

  // Selected day info
  const selectedShifts = selectedDate ? (shiftsByDate.get(selectedDate) || []) : [];
  const selectedTotal = selectedShifts.reduce((s, sh) => s + sh.totalEarned, 0);

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday} activeOpacity={0.7}>
          <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Month Summary Bar */}
      <View style={styles.monthSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>${Math.round(monthTotal).toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>earned</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: C.gold }]}>${Math.round(monthTips)}</Text>
          <Text style={styles.summaryLabel}>tips</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: C.blue }]}>{monthHours.toFixed(1)}h</Text>
          <Text style={styles.summaryLabel}>hours</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: C.purple }]}>{monthShifts.length}</Text>
          <Text style={styles.summaryLabel}>shifts</Text>
        </View>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map(d => (
          <View key={d} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, (d === 'Sun' || d === 'Sat') && { color: C.textFaint }]}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarDays.map((cd, i) => {
          const dayShifts = shiftsByDate.get(cd.date) || [];
          const hasShifts = dayShifts.length > 0 && cd.inMonth;
          const dayTotal = dayShifts.reduce((s, sh) => s + sh.totalEarned, 0);
          const intensity = hasShifts ? Math.max(0.3, dayTotal / maxDayEarnings) : 0;
          const isSelected = selectedDate === cd.date;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                !cd.inMonth && styles.dayCellOutside,
                cd.isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => handleDayPress(cd.date, cd.inMonth)}
              activeOpacity={cd.inMonth ? 0.6 : 1}
            >
              <Text style={[
                styles.dayNumber,
                !cd.inMonth && styles.dayNumberOutside,
                cd.isToday && styles.dayNumberToday,
                isSelected && styles.dayNumberSelected,
              ]}>
                {cd.day}
              </Text>
              {hasShifts && (
                <View style={styles.shiftIndicator}>
                  <View style={[
                    styles.earningsDot,
                    { backgroundColor: C.green, opacity: intensity },
                  ]} />
                  <Text style={styles.dayEarnings}>${Math.round(dayTotal)}</Text>
                </View>
              )}
              {!hasShifts && cd.inMonth && (
                <View style={styles.shiftIndicator}>
                  <Text style={styles.dayEarningsEmpty}> </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Detail */}
      {selectedDate && selectedShifts.length > 0 && (
        <View style={styles.selectedDetail}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedDate}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric',
              })}
            </Text>
            <Text style={styles.selectedTotal}>${Math.round(selectedTotal)}</Text>
          </View>
          {selectedShifts.map(sh => (
            <View key={sh.id} style={styles.selectedShift}>
              <View>
                <Text style={styles.selectedShiftHours}>{sh.hours}hrs @ ${sh.hourlyWage}/hr</Text>
                <Text style={styles.selectedShiftTips}>
                  tips: ${sh.tips.toFixed(2)}
                  {sh.tipOut > 0 ? `  ·  tip out: -$${sh.tipOut.toFixed(2)}` : ''}
                </Text>
              </View>
              <Text style={styles.selectedShiftTotal}>${Math.round(sh.totalEarned)}</Text>
            </View>
          ))}
        </View>
      )}

      {selectedDate && selectedShifts.length === 0 && (
        <View style={styles.selectedDetail}>
          <Text style={styles.noShiftsText}>
            No shifts on{' '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric',
            })}
          </Text>
        </View>
      )}
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // Month navigation
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    color: C.text,
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
  monthTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Month summary
  monthSummary: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: C.green,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: mono,
  },
  summaryLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: mono,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  // Day headers
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Calendar grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    borderRadius: 10,
  },
  dayCellOutside: {
    opacity: 0.25,
  },
  dayCellToday: {
    backgroundColor: C.green + '15',
    borderWidth: 1,
    borderColor: C.green + '40',
  },
  dayCellSelected: {
    backgroundColor: C.purple + '20',
    borderWidth: 1,
    borderColor: C.purple + '60',
  },
  dayNumber: {
    color: C.textSoft,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: mono,
  },
  dayNumberOutside: {
    color: C.textFaint,
  },
  dayNumberToday: {
    color: C.green,
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: C.purple,
    fontWeight: '800',
  },
  shiftIndicator: {
    alignItems: 'center',
    marginTop: 3,
  },
  earningsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  dayEarnings: {
    color: C.green,
    fontSize: 8,
    fontFamily: mono,
    fontWeight: '700',
  },
  dayEarningsEmpty: {
    fontSize: 8,
  },
  // Selected day detail
  selectedDetail: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.purple + '40',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  selectedDate: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedTotal: {
    color: C.green,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: mono,
  },
  selectedShift: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border + '60',
  },
  selectedShiftHours: {
    color: C.textSoft,
    fontSize: 12,
    fontFamily: mono,
  },
  selectedShiftTips: {
    color: C.gold,
    fontSize: 10,
    fontFamily: mono,
    marginTop: 2,
  },
  selectedShiftTotal: {
    color: C.purple,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: mono,
  },
  noShiftsText: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: mono,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
