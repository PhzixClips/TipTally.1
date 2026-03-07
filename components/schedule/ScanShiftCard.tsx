import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { C } from '../../lib/constants';
import { ParsedShift } from '../../lib/types';

interface Props {
  shift: ParsedShift;
  selected: boolean;
  onToggle: () => void;
  onCycleRole: () => void;
  roles: string[];
}

export default function ScanShiftCard({ shift, selected, onToggle, onCycleRole }: Props) {
  // Derive day of week from date
  const dayName = (() => {
    try {
      const d = new Date(shift.date + 'T12:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return '???';
    }
  })();

  const displayDate = (() => {
    try {
      const d = new Date(shift.date + 'T12:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return shift.date;
    }
  })();

  const confidenceColor =
    shift.confidence === 'high'
      ? C.green
      : shift.confidence === 'medium'
      ? C.gold
      : C.coral;

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[styles.card, !selected && styles.cardDeselected]}
    >
      <View style={styles.row}>
        {/* Checkbox */}
        <View style={[styles.checkbox, selected && styles.checkboxActive]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {/* Date column */}
        <View style={styles.dateCol}>
          <Text style={[styles.dayName, !selected && styles.dimmed]}>{dayName}</Text>
          <Text style={[styles.dayDate, !selected && styles.dimmed]}>{displayDate}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.time, !selected && styles.dimmed]}>{shift.startTime}</Text>
          <TouchableOpacity onPress={onCycleRole} style={styles.roleChip}>
            <Text style={styles.roleText}>{shift.role}</Text>
          </TouchableOpacity>
        </View>

        {/* Right side */}
        <View style={styles.right}>
          <Text style={[styles.hours, !selected && styles.dimmed]}>
            {shift.estimatedHours}hrs
          </Text>
          <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardDeselected: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  checkmark: {
    color: C.bg,
    fontSize: 13,
    fontWeight: '800',
  },
  dateCol: {
    minWidth: 50,
    marginRight: 12,
  },
  dayName: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: mono,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dayDate: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  time: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: mono,
  },
  roleChip: {
    alignSelf: 'flex-start',
    backgroundColor: C.purpleBg,
    borderWidth: 1,
    borderColor: C.purple + '30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    color: C.purple,
    fontSize: 10,
    fontFamily: mono,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  hours: {
    color: C.textSoft,
    fontSize: 12,
    fontFamily: mono,
  },
  confidenceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dimmed: {
    color: C.textFaint,
  },
});
