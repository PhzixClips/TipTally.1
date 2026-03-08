import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal as RNModal } from 'react-native';
import { C } from '../../lib/constants';
import { Shift } from '../../lib/types';
import Button from '../ui/Button';

interface Props {
  shift: Shift;
  onEdit: () => void;
  onDelete: () => void;
  startTime?: string;
}

export default function ShiftCard({ shift, onEdit, onDelete, startTime }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const total = shift.totalEarned;
  const hourly = total / shift.hours;
  const tipOut = shift.tipOut ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.date}>{shift.displayDate}</Text>
            {shift.role ? (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{shift.role}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.detail}>
            {shift.hours}hrs · ${shift.hourlyWage}/hr · ${hourly.toFixed(2)}/hr eff.
          </Text>
          <Text style={styles.tips}>tips: ${shift.tips.toFixed(2)}</Text>
          {(shift.cashTips != null || shift.creditTips != null) && (
            <Text style={styles.cashCredit}>
              cash: ${(shift.cashTips || 0).toFixed(2)} / credit: ${(shift.creditTips || 0).toFixed(2)}
            </Text>
          )}
          {tipOut > 0 && <Text style={styles.tipOut}>tip out: -${tipOut.toFixed(2)}</Text>}
          {startTime && <Text style={styles.shiftTime}>shift: {startTime}</Text>}
          {shift.notes ? <Text style={styles.notes} numberOfLines={1}>{shift.notes}</Text> : null}
          {shift.tags && shift.tags.length > 0 && (
            <View style={styles.tagRow}>
              {shift.tags.map(t => (
                <View key={t} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.right}>
          <Text style={styles.total}>${Math.round(total)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.delBtn}>
              <Text style={styles.delText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <RNModal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Shift</Text>
            <Text style={styles.modalMsg}>Remove {shift.displayDate} shift (${Math.round(total)})?</Text>
            <View style={styles.modalButtons}>
              <Button onPress={() => setShowDeleteModal(false)} color={C.textMuted}>CANCEL</Button>
              <Button onPress={() => { setShowDeleteModal(false); onDelete(); }} color={C.danger} filled>DELETE</Button>
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: C.text, fontWeight: '700', fontSize: 15 },
  roleBadge: { backgroundColor: C.blueBg, borderWidth: 1, borderColor: C.blue + '40', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 },
  roleBadgeText: { color: C.blue, fontFamily: mono, fontSize: 9, fontWeight: '700' },
  detail: { color: C.textMuted, fontSize: 10, marginTop: 4, fontFamily: mono },
  tips: { color: C.gold, fontSize: 10, marginTop: 2, fontFamily: mono, fontWeight: '600' },
  cashCredit: { color: C.mint, fontSize: 9, marginTop: 2, fontFamily: mono },
  tipOut: { color: C.coral, fontSize: 10, marginTop: 2, fontFamily: mono, fontWeight: '600' },
  shiftTime: { color: C.green, fontSize: 10, marginTop: 2, fontFamily: mono, fontWeight: '600' },
  notes: { color: C.textFaint, fontSize: 9, marginTop: 4, fontFamily: mono, fontStyle: 'italic' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tagPill: { backgroundColor: C.goldBg, borderRadius: 4, paddingVertical: 1, paddingHorizontal: 6 },
  tagPillText: { color: C.gold, fontSize: 8, fontFamily: mono, fontWeight: '600' },
  right: { alignItems: 'flex-end' },
  total: { color: C.purple, fontSize: 24, fontWeight: '800', fontFamily: mono },
  actions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  editBtn: { borderWidth: 1, borderColor: C.borderLight, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  editText: { color: C.textMuted, fontSize: 10, fontFamily: mono, fontWeight: '600' },
  delBtn: { borderWidth: 1, borderColor: C.danger + '40', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: C.dangerBg },
  delText: { color: C.danger, fontSize: 14, fontFamily: mono, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 320, alignItems: 'center' },
  modalTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  modalMsg: { color: C.textMuted, fontSize: 13, fontFamily: mono, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
});
