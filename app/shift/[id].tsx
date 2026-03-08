import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, Modal as RNModal, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { C, DEFAULT_TAGS } from '../../lib/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ShiftExtras } from '../../lib/types';

export default function EditShiftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, updateShift, deleteShift } = useData();
  const { colors, accent } = useTheme();
  const router = useRouter();
  const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  const shift = data.shifts.find(s => s.id === id);
  if (!shift) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 60 }}>Shift not found</Text>
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>DATE</Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{shift.displayDate}</Text>
      </View>

      {data.settings.roles.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>ROLE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {data.settings.roles.map(r => (
              <TouchableOpacity key={r} style={[
                { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.surface },
                role === r && { borderColor: C.blue, backgroundColor: C.blueBg },
              ]} onPress={() => setRole(role === r ? '' : r)}>
                <Text style={[
                  { color: colors.textMuted, fontFamily: mono, fontSize: 12, fontWeight: '600' },
                  role === r && { color: C.blue },
                ]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Input label="Hours Worked" value={hours} onChangeText={setHours} placeholder="6" keyboardType="decimal-pad" />
      <Input label="Tips Made ($)" value={tips} onChangeText={setTips} placeholder="120.00" keyboardType="decimal-pad" />

      <View style={{ flexDirection: 'row', gap: 10 }}>
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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>TIP OUT</Text>
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
          {(['percent', 'sales', 'cash'] as const).map(mode => (
            <TouchableOpacity key={mode} style={[
              { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: colors.surface },
              tipOutMode === mode && { borderColor: C.purple, backgroundColor: C.purpleBg },
            ]} onPress={() => {
              setTipOutMode(mode);
              if (mode === 'cash') { setTipOutValue(String(shift.tipOut ?? 0)); setTotalSales(''); }
              else if (mode === 'percent') { setTipOutValue(''); setTotalSales(''); }
              else { setTipOutValue(''); }
            }}>
              <Text style={[
                { color: colors.textMuted, fontSize: 12, fontFamily: mono, fontWeight: '700' },
                tipOutMode === mode && { color: C.purple },
              ]}>{mode === 'percent' ? '% Tips' : mode === 'sales' ? '% Sales' : '$'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {tipOutMode === 'sales' && <Input label="Total Sales ($)" value={totalSales} onChangeText={setTotalSales} placeholder="1500.00" keyboardType="decimal-pad" />}
      <Input label={tipOutMode === 'cash' ? 'Tip Out ($)' : 'Tip Out (%)'} value={tipOutValue} onChangeText={setTipOutValue} placeholder={tipOutMode === 'cash' ? '65.00' : '4.5'} keyboardType="decimal-pad" />

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>NOTES</Text>
        <TextInput value={notes} onChangeText={setNotes} placeholder="Weather, section, events..." placeholderTextColor={colors.textFaint} multiline maxLength={200} style={{ backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, color: colors.text, fontFamily: mono, fontSize: 14, minHeight: 60, textAlignVertical: 'top' }} />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>TAGS</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DEFAULT_TAGS.map(tag => (
            <TouchableOpacity key={tag} style={[
              { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.surface },
              selectedTags.includes(tag) && { borderColor: C.gold, backgroundColor: C.goldBg },
            ]} onPress={() => toggleTag(tag)}>
              <Text style={[
                { color: colors.textMuted, fontFamily: mono, fontSize: 10, fontWeight: '600' },
                selectedTags.includes(tag) && { color: C.gold },
              ]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {hours ? (
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: mono }}>Wage ({hours}hr x ${shift.hourlyWage})</Text>
            <Text style={{ color: colors.textSoft, fontSize: 12, fontFamily: mono }}>${wageAmount.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: C.gold, fontSize: 12, fontFamily: mono }}>Tips</Text>
            <Text style={{ color: C.gold, fontSize: 12, fontFamily: mono }}>${tipsNum.toFixed(2)}</Text>
          </View>
          {tipOutAmount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: C.coral, fontSize: 12, fontFamily: mono }}>
                Tip Out {tipOutMode === 'percent' && tipOutValue ? `(${tipOutValue}% tips)` : tipOutMode === 'sales' && tipOutValue ? `(${tipOutValue}% sales)` : ''}
              </Text>
              <Text style={{ color: C.coral, fontSize: 12, fontFamily: mono }}>-${tipOutAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }}>
            <Text style={{ color: accent.primary, fontSize: 12, fontFamily: mono, fontWeight: '700' }}>Total Take-Home</Text>
            <Text style={{ color: accent.primary, fontSize: 12, fontFamily: mono, fontWeight: '700' }}>${totalTakeHome.toFixed(2)}</Text>
          </View>
        </View>
      ) : null}

      {error ? <Text style={{ color: C.danger, fontSize: 12, fontFamily: mono, textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}

      <Button onPress={handleSave} color={accent.primary} filled size="lg" style={{ marginBottom: 12 }}>SAVE CHANGES</Button>
      <Button onPress={() => setShowDeleteModal(true)} color={C.danger} size="lg">DELETE SHIFT</Button>

      <RNModal visible={showDeleteModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 320, alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Delete Shift</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: mono, textAlign: 'center', marginBottom: 20 }}>Remove {shift.displayDate} shift?</Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Button onPress={() => setShowDeleteModal(false)} color={colors.textMuted}>CANCEL</Button>
              <Button onPress={handleDelete} color={C.danger} filled>DELETE</Button>
            </View>
          </View>
        </View>
      </RNModal>
    </ScrollView>
  );
}
