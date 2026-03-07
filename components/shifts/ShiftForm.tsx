import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal as RNModal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { C } from '../../lib/constants';
import { toISODate } from '../../lib/helpers';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (date: string, hours: number, totalEarned: number) => void;
  initialDate?: string;
  initialHours?: string;
  initialTotal?: string;
  title?: string;
  buttonLabel?: string;
  hourlyWage: number;
}

export default function ShiftForm({
  visible, onClose, onSave,
  initialDate, initialHours = '', initialTotal = '',
  title = 'LOG SHIFT', buttonLabel = 'LOG SHIFT',
  hourlyWage,
}: Props) {
  const [date, setDate] = useState<Date>(initialDate ? new Date(initialDate + 'T12:00:00') : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hours, setHours] = useState(initialHours);
  const [total, setTotal] = useState(initialTotal);
  const [error, setError] = useState('');

  const tips = hours && total ? Math.max(0, +total - +hours * hourlyWage) : null;

  const handleSave = () => {
    if (!hours || !total) {
      setError(!hours ? 'Enter hours worked' : 'Enter total made');
      return;
    }
    if (+hours <= 0 || +total < 0) {
      setError('Values must be positive');
      return;
    }
    setError('');
    onSave(toISODate(date), +hours, +total);
    setHours('');
    setTotal('');
    onClose();
  };

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.close}>X</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>DATE</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="dark"
              onChange={(_, d) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (d) setDate(d);
              }}
            />
          )}

          <Input
            label="Hours Worked"
            value={hours}
            onChangeText={setHours}
            placeholder="6"
            keyboardType="decimal-pad"
          />
          <Input
            label="Total Made Today ($)"
            value={total}
            onChangeText={setTotal}
            placeholder="396.00"
            keyboardType="decimal-pad"
          />

          {hours && total ? (
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Wage ({hours}hr x ${hourlyWage})</Text>
                <Text style={styles.breakdownValue}>${(+hours * hourlyWage).toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: C.gold }]}>Tips (calculated)</Text>
                <Text style={[styles.breakdownValue, { color: C.gold, fontWeight: '700' }]}>
                  ${tips?.toFixed(2)}
                </Text>
              </View>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            onPress={handleSave}
            color={C.green}
            filled
            disabled={!hours || !total}
            size="lg"
            style={{ marginTop: 8 }}
          >
            {buttonLabel}
          </Button>
        </View>
      </View>
    </RNModal>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000dd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: C.text,
    fontWeight: '700',
    fontFamily: mono,
    fontSize: 15,
    letterSpacing: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '600',
  },
  dateBtn: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateText: {
    color: C.text,
    fontFamily: mono,
    fontSize: 14,
  },
  breakdown: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: mono,
  },
  breakdownValue: {
    color: C.textSoft,
    fontSize: 12,
    fontFamily: mono,
  },
  errorBox: {
    backgroundColor: C.dangerBg,
    borderWidth: 1,
    borderColor: C.danger + '30',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  errorText: {
    color: C.danger,
    fontSize: 12,
    fontFamily: mono,
  },
});
