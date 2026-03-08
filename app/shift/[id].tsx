import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal as RNModal, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C, DEFAULT_TAGS } from '../../lib/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ShiftExtras } from '../../lib/types';

export default function EditShiftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateShift, deleteShift } = useData();
  const router = useRouter();

  const shift = data.shifts.find(s => s.id === id);
  if (!shift) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Shift not found</Text>
      </View>
    );
  }

  const [hours, setHours] = useState(String(shift.hours));
  const [tips, setTips] = useState(String(shift.tips));
  const [tipOutMode, setTipOutMode] = useState<'percent' | 'sales' | 'cash'>(shift.tipOutMode || 'cash');
  const [tipOutValue, setTipOutValue] = useState(String(shift.tipOut ?? 0));
  const [totalSales, setTotalSales] = useState(shift.totalSales ? String(shift.totalSales) : '');
  const [role, setRole] = useState(shift.role || '');
  const [cashTips, setCashTips] = useState(shift.cashTips != null ? String(shift.cashTips) : '');
  const [creditTips, setCreditTips] = useState(shift.creditTips != null ? String(shift.creditTips) : '');
  const [notes, setNotes] = useState(shift.notes || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(shift.tags || []);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const wageAmount = hours ? +hours * shift.hourlyWage : 0;
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
    if (!hours || +hours <= 0) { setError('Enter valid hours'); return; }
    if (tips && +tips < 0) { setError('Tips cannot be negative'); return; }
    const extras: ShiftExtras = {
      role: role || undefined,
      cashTips: cashTips ? +cashTips : undefined,
      creditTips: creditTips ? +creditTips : undefined,
      notes: notes.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      totalSales: totalSales ? +totalSales : undefined,
      tipOutMode, tipOutPercent: tipOutValue ? +tipOutValue : undefined,
    };
    updateShift(shift.id, shift.date, +hours, tipsNum, tipOutAmount, extras);
    router.back();
  };

  const handleDelete = () => {
    deleteShift(shift.id);
    setShowDeleteModal(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.dateBox}>
        <Text style={styles.label}>DATE</Text>
        <Text style={styles.dateText}>{shift.displayDate}</Text>
      </View>

      {/* Role Selector */}
      {data.settings.roles.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>ROLE</Text>
          <View style={styles.chipRow}>
            {data.settings.roles.map(r => (
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
          <TouchableOpacity style={[styles.toggleBtn, tipOutMode === 'cash' && styles.toggleBtnActive]} onPress={() => { setTipOutMode('cash'); setTipOutValue(String(shift.tipOut ?? 0)); setTotalSales(''); }}>
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
            <Text style={styles.bLabel}>Wage ({hours}hr x ${shift.hourlyWage})</Text>
            <Text style={styles.bValue}>${wageAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.bLabel, { color: C.gold }]}>Tips</Text>
            <Text style={[styles.bValue, { color: C.gold }]}>${tipsNum.toFixed(2)}</Text>
          </View>
          {tipOutAmount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.bLabel, { color: C.coral }]}>
                Tip Out {tipOutMode === 'percent' && tipOutValue ? `(${tipOutValue}% tips)` : tipOutMode === 'sales' && tipOutValue ? `(${tipOutValue}% sales)` : ''}
              </Text>
              <Text style={[styles.bValue, { color: C.coral }]}>-${tipOutAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={[styles.bLabel, { color: C.green, fontWeight: '700' }]}>Total Take-Home</Text>
            <Text style={[styles.bValue, { color: C.green, fontWeight: '700' }]}>${totalTakeHome.toFixed(2)}</Text>
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button onPress={handleSave} color={C.green} filled size="lg" style={{ marginBottom: 12 }}>SAVE CHANGES</Button>
      <Button onPress={() => setShowDeleteModal(true)} color={C.danger} size="lg">DELETE SHIFT</Button>

      <RNModal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Shift</Text>
            <Text style={styles.modalMsg}>Remove {shift.displayDate} shift?</Text>
            <View style={styles.modalButtons}>
              <Button onPress={() => setShowDeleteModal(false)} color={C.textMuted}>CANCEL</Button>
              <Button onPress={handleDelete} color={C.danger} filled>DELETE</Button>
            </View>
          </View>
        </View>
      </RNModal>
    </ScrollView>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24 },
  notFound: { color: C.textMuted, fontSize: 14, textAlign: 'center', marginTop: 60 },
  dateBox: { marginBottom: 16 },
  label: { color: C.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' },
  dateText: { color: C.text, fontSize: 18, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { borderWidth: 1, borderColor: C.borderLight, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: C.surface },
  roleChipActive: { borderColor: C.blue, backgroundColor: C.blueBg },
  roleChipText: { color: C.textMuted, fontFamily: mono, fontSize: 12, fontWeight: '600' },
  roleChipTextActive: { color: C.blue },
  splitRow: { flexDirection: 'row', gap: 10 },
  tipOutSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  bLabel: { color: C.textMuted, fontSize: 12, fontFamily: mono },
  bValue: { color: C.textSoft, fontSize: 12, fontFamily: mono },
  error: { color: C.danger, fontSize: 12, fontFamily: mono, textAlign: 'center', marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 320, alignItems: 'center' },
  modalTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  modalMsg: { color: C.textMuted, fontSize: 13, fontFamily: mono, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
});
