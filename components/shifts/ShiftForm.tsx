import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Platform, TouchableOpacity, Modal as RNModal, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { C, DEFAULT_TAGS } from '../../lib/constants';
import { toISODate } from '../../lib/helpers';
import { ShiftExtras } from '../../lib/types';
import { useTheme } from '../../context/ThemeContext';

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
  title = 'Log Shift', buttonLabel = 'Log Shift',
  hourlyWage,
}: Props) {
  const { colors, accent } = useTheme();
  const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

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
      <View style={{ flex: 1, backgroundColor: '#000000dd', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, maxHeight: '90%' }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header: back arrow + title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: '600' }}>{'\u2039'}</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.text, fontWeight: '700', fontFamily: mono, fontSize: 16 }}>{title}</Text>
            </View>

            <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>DATE</Text>
            <TouchableOpacity style={{ backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16 }} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: colors.text, fontFamily: mono, fontSize: 14 }}>
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} themeVariant="dark"
                onChange={(_, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setDate(d); }} />
            )}

            {roles.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>ROLE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {roles.map(r => (
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
              <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' }}>TIP OUT</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
                <TouchableOpacity style={[
                  { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: colors.surface },
                  tipOutMode === 'percent' && { borderColor: C.purple, backgroundColor: C.purpleBg },
                ]} onPress={() => { setTipOutMode('percent'); setTipOutValue(''); setTotalSales(''); }}>
                  <Text style={[
                    { color: colors.textMuted, fontSize: 12, fontFamily: mono, fontWeight: '700' },
                    tipOutMode === 'percent' && { color: C.purple },
                  ]}>% Tips</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[
                  { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: colors.surface },
                  tipOutMode === 'sales' && { borderColor: C.purple, backgroundColor: C.purpleBg },
                ]} onPress={() => { setTipOutMode('sales'); setTipOutValue(''); }}>
                  <Text style={[
                    { color: colors.textMuted, fontSize: 12, fontFamily: mono, fontWeight: '700' },
                    tipOutMode === 'sales' && { color: C.purple },
                  ]}>% Sales</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[
                  { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: colors.surface },
                  tipOutMode === 'cash' && { borderColor: C.purple, backgroundColor: C.purpleBg },
                ]} onPress={() => { setTipOutMode('cash'); setTipOutValue(''); setTotalSales(''); }}>
                  <Text style={[
                    { color: colors.textMuted, fontSize: 12, fontFamily: mono, fontWeight: '700' },
                    tipOutMode === 'cash' && { color: C.purple },
                  ]}>$</Text>
                </TouchableOpacity>
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
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: mono }}>Wage ({hours}hr x ${hourlyWage})</Text>
                  <Text style={{ color: colors.textSoft, fontSize: 12, fontFamily: mono }}>${wageAmount.toFixed(2)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: C.gold, fontSize: 12, fontFamily: mono }}>Tips</Text>
                  <Text style={{ color: C.gold, fontSize: 12, fontFamily: mono }}>${tipsNum.toFixed(2)}</Text>
                </View>
                {(cashTips || creditTips) ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: C.mint, fontSize: 12, fontFamily: mono }}>cash: ${cashTips || '0'} / credit: ${creditTips || '0'}</Text>
                  </View>
                ) : null}
                {tipOutAmount > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: C.coral, fontSize: 12, fontFamily: mono }}>
                      Tip Out {tipOutMode === 'percent' && tipOutValue ? `(${tipOutValue}% tips)` : tipOutMode === 'sales' && tipOutValue ? `(${tipOutValue}% sales)` : ''}
                    </Text>
                    <Text style={{ color: C.coral, fontSize: 12, fontFamily: mono }}>-${tipOutAmount.toFixed(2)}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4, marginBottom: 0 }}>
                  <Text style={{ color: accent.primary, fontSize: 12, fontFamily: mono, fontWeight: '700' }}>Total Take-Home</Text>
                  <Text style={{ color: accent.primary, fontSize: 12, fontFamily: mono, fontWeight: '700' }}>${totalTakeHome.toFixed(2)}</Text>
                </View>
              </View>
            ) : null}

            {error ? (
              <View style={{ backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '30', borderRadius: 10, padding: 10, marginBottom: 12, alignItems: 'center' }}>
                <Text style={{ color: C.danger, fontSize: 12, fontFamily: mono }}>{error}</Text>
              </View>
            ) : null}

            <Button onPress={handleSave} color={accent.primary} filled disabled={!hours} size="lg" style={{ marginTop: 8, marginBottom: 20 }}>{buttonLabel}</Button>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}
