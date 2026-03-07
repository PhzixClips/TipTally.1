import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { C } from '../../lib/constants';
import { Shift } from '../../lib/types';

interface Props {
  shift: Shift;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ShiftCard({ shift, onEdit, onDelete }: Props) {
  const total = shift.totalEarned;
  const hourly = total / shift.hours;

  const confirmDelete = () => {
    Alert.alert(
      'Delete Shift',
      `Remove ${shift.displayDate} shift ($${Math.round(total)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{shift.displayDate}</Text>
          <Text style={styles.detail}>
            {shift.hours}hrs  |  ${shift.hourlyWage}/hr wage  |  ${hourly.toFixed(2)}/hr eff.
          </Text>
          <Text style={styles.tips}>tips: ${shift.tips.toFixed(2)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.total}>${Math.round(total)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
              <Text style={styles.editText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} style={styles.delBtn}>
              <Text style={styles.delText}>X</Text>
            </TouchableOpacity>
          </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: C.text,
    fontWeight: '600',
    fontSize: 14,
  },
  detail: {
    color: C.textMuted,
    fontSize: 10,
    marginTop: 4,
    fontFamily: mono,
  },
  tips: {
    color: C.gold,
    fontSize: 10,
    marginTop: 2,
    fontFamily: mono,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  total: {
    color: C.purple,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: mono,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  editText: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: mono,
    letterSpacing: 1,
    fontWeight: '600',
  },
  delBtn: {
    borderWidth: 1,
    borderColor: C.danger + '40',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: C.dangerBg,
  },
  delText: {
    color: C.danger,
    fontSize: 11,
    fontFamily: mono,
    fontWeight: '700',
  },
});
