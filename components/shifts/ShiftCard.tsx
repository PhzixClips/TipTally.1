import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Shift } from '../../lib/types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  shift: Shift;
  onPress: () => void;
}

const formatShiftDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${month} ${d}`;
};

export default function ShiftCard({ shift, onPress }: Props) {
  const { colors, accent } = useTheme();
  const hourlyRate = shift.hours > 0 ? Math.round(shift.totalEarned / shift.hours) : 0;
  const tipOut = shift.tipOut ?? 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top row: date + time badge */}
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: accent.primary }]}>
          {formatShiftDate(shift.date)}
        </Text>
        {shift.shiftTime ? (
          <View style={[styles.timeBadge, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>{'<'}</Text>
            <Text style={[styles.timeText, { color: colors.textSoft }]}>{shift.shiftTime}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>{'>'}</Text>
          </View>
        ) : null}
      </View>

      {/* Take-home amount */}
      <Text style={[styles.totalEarned, { color: accent.primary }]}>
        ${Math.round(shift.totalEarned)}
      </Text>

      {/* Hours and hourly rate */}
      <Text style={[styles.detail, { color: colors.textMuted }]}>
        {shift.hours} hrs {'\u00B7'} ${hourlyRate}/hr
      </Text>

      {/* Bottom row: Sales and Tipout */}
      {(shift.totalSales != null || tipOut > 0) ? (
        <View style={styles.bottomRow}>
          {shift.totalSales != null ? (
            <Text style={[styles.bottomText, { color: colors.textMuted }]}>
              Sales: ${shift.totalSales.toLocaleString()}
            </Text>
          ) : null}
          {tipOut > 0 ? (
            <Text style={[styles.bottomText, { color: colors.textMuted }]}>
              Tipout: ${Math.round(tipOut)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    gap: 4,
  },
  chevron: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalEarned: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  detail: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
  },
  bottomText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
