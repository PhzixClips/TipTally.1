import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal as RNModal, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { C, DEFAULT_TAGS } from '../../lib/constants';
import { toISODate } from '../../lib/helpers';
import { ShiftExtras } from '../../lib/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (date: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => void;
  roles?: string[];
  defaultRole?: string;
  initialDate?: string;
  initialHours?: string;
  initialTips?: string;
  initialTipOut?: string;
  initialTipOutMode?: 'percent' | 'sales' | 'cash';
  initialCashTips?: string;
  initialCreditTips?: string;
  initialNotes?: string;
  initialTags?: string[];
  initialRole?: string;
  title?: string;
  buttonLabel?: string;
  hourlyWage: number;
}

export default function ShiftForm({
  visible, onClose, onSave,
  roles = [], defaultRole = '',
  initialDate, initialHours = '', initialTips = '',
  initialTipOut = '', initialTipOutMode = 'percent',
  initialCashTips = '', initialCreditTips = '',
  initialNotes = '', initialTags = [],
  initialRole,
  title = 'LOG SHIFT', buttonLabel = 'LOG SHIFT',
  hourlyWage,
}: Props) {
  const [date, setDate] = useState<Date>(initialDate ? new Date(initialDate + 'T12:00:00') : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hours, setHours] = useState(initialHours);
  const [tips, setTips] = useState(initialTips);
  const [tipOutMode, setTipOutMode] = useState<'percent' | 'sales' | 'cash'>(initialTipOutMode);
  const [tipOutValue, setTipOutValue] = useState(initialTipOut);
  const [totalSales, setTotalSales] = useState('');
  const [role, setRole] = useState(initialRole || defaultRole);
  const [cashTips, setCashTips] = useState(initialCashTips);
  const [creditTips, setCreditTips] = useState(initialCreditTips);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [error, setError] = useState('');
  const tipsRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && initialHours) {
      setTimeout(() => tipsRef.current?.focus(), 400);
    }
  }, [visible, initialHours]);

  const wageAmount = hours ? +hours * hourlyWage : 0;
  const tipsNum = tips ? +tips : 0;
  const tipOutAmount = tipOutValue
    ? tipOutMode === 'percent'
      ? +(tipsNum * (+tipOutValue / 100)).toFixed(2)
      : tipOutMode === 'sales'
        ? +(totalSales ? +totalSales * (+tipOutValue / 100) : 0).toFixed(2)
        : +tipOutValue
    : 0;
  const netTips = Math.max(0, tipsNum - tipOutAmount);
  const totalTakeHome = wageAmount + netTips;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = () => {
    if (!hours) { setError('Enter hours worked'); return; }
    if (+hours <= 0) { setError('Hours must be positive'); return; }
    if (tips && +tips < 0) { setError('Tips cannot be negative'); return; }
    if (cashTips && creditTips && tips) {
      const sum = +cashTips + +creditTips;
      if (Math.abs(sum - +tips) > 0.01) { setError(`Cash + Credit ($${sum.toFixed(2)}) must equal Tips ($${(+tips).toFixed(2)})`); return; }
    }
    setError('');
    const extras: ShiftExtras = {
      role: role || undefined,
      cashTips: cashTips ? +cashTips : undefined,
      creditTips: creditTips ? +creditTips : undefined,
      notes: notes.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      totalSales: totalSales ? +totalSales : undefined,
      tipOutMode, tipOutPercent: tipOutValue ? +tipOutValue : undefined,
    };
    onSave(toISODate(date), +hours, tipsNum, tipOutAmount, extras);
    setHours(''); setTips(''); setTipOutValue(''); setTotalSales('');
    setCashTips(''); setCreditTips(''); setNotes(''); setSelectedTags([]);
    onClose();
  };

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.close}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>DATE</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} themeVariant="dark"
                onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }} />
            )}

            {roles.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.label}>ROLE</Text>
                <View style={styles.chipRow}>
                  {roles.map(r => (
                    <TouchableOpacity key={r} style={[styles.roleChip, role === r && styles.roleChipActive]} onPress={() => setRole(role === r ? '' : r)}>
                      <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Input label="Hours Worked" value={hours} onChangeText={setHours} placeholder="6" keyboardType="decimal-pad" />
            <Input label="Tips Made ($)" value={tips} onChangeText={setTips} placeholder="120.00" keyboardType="decimal-pad" />

            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Input label="Cash Tips ($)" value={cashTips} onChangeText={(v) => {
                  setCashTips(v); if (v && tips) setCreditTips(Math.max(0, +tips - +v).toFixed(2));
                }} placeholder="0" keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Credit Tips ($)" value={creditTips} onChangeText={(v) => {
                  setCreditTips(v); if (v && tips) setCashTips(Math.max(0, +tips - +v).toFixed(2));
                }} placeholder="0" keyboardType="decimal-pad" />
              </View>
            </View>

            <View style={styles.tipOutSection}>
              <Text style={styles.label}>TIP OUT</Text>
              <View style={styles.tipOutToggle}>
                <TouchableOpacity style={[styles.toggleBtn, tipOutMode === 'percent' && styles.toggleBtnActive]} onPress={() => { setTipOutMode('percent'); setTipOutValue(''); setTotalSales(''); }}>
                  <Text style={[styles.toggleText, tipOutMode === 'percent' && styles.toggleTextActive]}>% Tips</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, tipOutMode === 'sales' && styles.toggleBtnActive]} onPress={() => { setTipOutMode('sales'); setTipOutValue(''); }}>
                  <Text style={[styles.toggleText, tipOutMode === 'sales' && styles.toggleTextActive]}>% Sales</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, tipOutMode === 'cash' && styles.toggleBtnActive]} onPress={() => { setTipOutMode('cash'); setTipOutValue(''); setTotalSales(''); }}>
                  <Text style={[styles.toggleText, tipOutMode === 'cash' && styles.toggleTextActive]}>$</Text>
                </TouchableOpacity>
              </View>
            </View>
            {tipOutMode === 'sales' && <Input label="Total Sales ($)" value={totalSales} onChangeText={setTotalSales} placeholder="1500.00" keyboardType="decimal-pad" />}
            <Input label={tipOutMode === 'cash' ? 'Tip Out ($)' : 'Tip Out (%)'} value={tipOutValue} onChangeText={setTipOutValue} placeholder={tipOutMode === 'cash' ? '65.00' : '4.5'} keyboardType="decimal-pad" />

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>NOTES</Text>
              <TextInput value={notes} onChangeText={setNotes} placeholder="Weather, section, events..." placeholderTextColor={C.textFaint} multiline maxLength={200} style={styles.notesInput} />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>TAGS</Text>
              <View style={styles.chipRow}>
                {DEFAULT_TAGS.map(tag => (
                  <TouchableOpacity key={tag} style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]} onPress={() => toggleTag(tag)}>
                    <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {hours ? (
              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Wage ({hours}hr x ${hourlyWage})</Text>
                  <Text style={styles.breakdownValue}>${wageAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: C.gold }]}>Tips</Text>
                  <Text style={[styles.breakdownValue, { color: C.gold }]}>${tipsNum.toFixed(2)}</Text>
                </View>
                {(cashTips || creditTips) ? (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: C.mint }]}>cash: ${cashTips || '0'} / credit: ${creditTips || '0'}</Text>
                  </View>
                ) : null}
                {tipOutAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: C.coral }]}>
                      Tip Out {tipOutMode === 'percent' && tipOutValue ? `(${tipOutValue}% tips)` : tipOutMode === 'sales' && tipOutValue ? `(${tipOutValue}% sales)` : ''}
                    </Text>
                    <Text style={[styles.breakdownValue, { color: C.coral }]}>-${tipOutAmount.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                  <Text style={[styles.breakdownLabel, { color: C.green, fontWeight: '700' }]}>Total Take-Home</Text>
                  <Text style={[styles.breakdownValue, { color: C.green, fontWeight: '700' }]}>${totalTakeHome.toFixed(2)}</Text>
                </View>
              </View>
            ) : null}

            {error ? (<View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>) : null}

            <Button onPress={handleSave} color={C.green} filled disabled={!hours} size="lg" style={{ marginTop: 8, marginBottom: 20 }}>{buttonLabel}</Button>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000dd', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: C.card, borderWidth: 1, borderColor: C.borderLight, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: C.text, fontWeight: '700', fontFamily: mono, fontSize: 15, letterSpacing: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  close: { color: C.textMuted, fontSize: 14, fontWeight: '700' },
  label: { color: C.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' },
  dateBtn: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16 },
  dateText: { color: C.text, fontFamily: mono, fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { borderWidth: 1, borderColor: C.borderLight, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: C.surface },
  roleChipActive: { borderColor: C.blue, backgroundColor: C.blueBg },
  roleChipText: { color: C.textMuted, fontFamily: mono, fontSize: 12, fontWeight: '600' },
  roleChipTextActive: { color: C.blue },
  splitRow: { flexDirection: 'row', gap: 10 },
  tipOutSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
  tipOutToggle: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  toggleBtn: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: C.surface },
  toggleBtnActive: { borderColor: C.purple, backgroundColor: C.purpleBg },
  toggleText: { color: C.textMuted, fontSize: 12, fontFamily: mono, fontWeight: '700' },
  toggleTextActive: { color: C.purple },
  notesInput: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, color: C.text, fontFamily: mono, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  tagChip: { borderWidth: 1, borderColor: C.borderLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: C.surface },
  tagChipActive: { borderColor: C.gold, backgroundColor: C.goldBg },
  tagChipText: { color: C.textMuted, fontFamily: mono, fontSize: 10, fontWeight: '600' },
  tagChipTextActive: { color: C.gold },
  breakdown: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownTotal: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 4, marginBottom: 0 },
  breakdownLabel: { color: C.textMuted, fontSize: 12, fontFamily: mono },
  breakdownValue: { color: C.textSoft, fontSize: 12, fontFamily: mono },
  errorBox: { backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '30', borderRadius: 10, padding: 10, marginBottom: 12, alignItems: 'center' },
  errorText: { color: C.danger, fontSize: 12, fontFamily: mono },
});
