import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { C } from '../../lib/constants';
import { ScheduledShift } from '../../lib/types';
import { isToday } from '../../lib/helpers';

interface Props {
  shift: ScheduledShift;
  avgEarned: number;
  onLog: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ScheduleCard({ shift, avgEarned, onLog, onEdit, onDelete }: Props) {
  const today = isToday(shift.date);
  const dayNum = shift.date.split('-')[2];

  return (
    <View style={[styles.card, today && styles.cardToday]}>
      <View style={styles.row}>
        <View style={styles.dateCol}>
          <Text style={styles.dayName}>{shift.dayOfWeek}</Text>
          <Text style={[styles.dayNum, today && styles.dayNumToday]}>{parseInt(dayNum)}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.dateText, today && { color: C.green }]}>
              {shift.displayDate}
            </Text>
            {today && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={styles.detail}>{shift.startTime}  |  {shift.role}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.est}>~${Math.round(avgEarned)}</Text>
          {!shift.logged ? (
            <TouchableOpacity onPress={onLog} style={styles.logBtn}>
              <Text style={styles.logText}>LOG</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.loggedBadge}>
              <Text style={styles.loggedText}>DONE</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardToday: {
    backgroundColor: C.greenBg,
    borderColor: C.greenBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCol: {
    alignItems: 'center',
    minWidth: 40,
    marginRight: 14,
  },
  dayName: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: mono,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dayNum: {
    color: C.text,
    fontWeight: '800',
    fontSize: 18,
  },
  dayNumToday: {
    color: C.green,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: C.text,
    fontWeight: '600',
    fontSize: 13,
  },
  todayBadge: {
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.green,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayText: {
    color: C.green,
    fontSize: 8,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detail: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 3,
    fontFamily: mono,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  est: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 12,
  },
  logBtn: {
    backgroundColor: C.purpleBg,
    borderWidth: 1,
    borderColor: C.purple + '40',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  logText: {
    color: C.purple,
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1,
    fontWeight: '700',
  },
  loggedBadge: {
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  loggedText: {
    color: C.green,
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1,
    fontWeight: '700',
  },
});
