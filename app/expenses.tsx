import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, TextInput } from 'react-native';
import { useData } from '../context/DataContext';
import { usePremium } from '../context/PremiumContext';
import PremiumGate from '../components/premium/PremiumGate';
import { C } from '../lib/constants';
import { toISODate } from '../lib/helpers';
import Button from '../components/ui/Button';

const CATEGORIES = [
  { key: 'mileage', label: 'Mileage', color: C.blue },
  { key: 'supplies', label: 'Supplies', color: C.gold },
  { key: 'uniform', label: 'Uniform', color: C.purple },
  { key: 'booth_rent', label: 'Booth Rent', color: C.coral },
  { key: 'equipment', label: 'Equipment', color: C.mint },
  { key: 'other', label: 'Other', color: C.peach },
] as const;

function ExpensesContent() {
  const { data, addExpense, deleteExpense } = useData();
  const [category, setCategory] = useState<string>('mileage');
  const [amount, setAmount] = useState('');
  const [miles, setMiles] = useState('');
  const [description, setDescription] = useState('');

  const mileageRate = data.settings.mileageRate || 0.70;
  const sortedExpenses = useMemo(
    () => [...data.expenses].sort((a, b) => b.date.localeCompare(a.date)),
    [data.expenses]
  );
  const totalExpenses = sortedExpenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    let finalAmount = 0;
    if (category === 'mileage' && miles) {
      finalAmount = +miles * mileageRate;
    } else if (amount) {
      finalAmount = +amount;
    }
    if (finalAmount <= 0) return;

    addExpense({
      date: toISODate(new Date()),
      category: category as any,
      amount: +finalAmount.toFixed(2),
      description: description.trim() || (category === 'mileage' ? `${miles} miles` : undefined),
    });
    setAmount(''); setMiles(''); setDescription('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Expenses</Text>
      <Text style={styles.subtitle}>Track work-related deductions</Text>

      {/* Quick Add */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ADD EXPENSE</Text>
        <View style={styles.catRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.key} style={[styles.catChip, category === c.key && { borderColor: c.color, backgroundColor: c.color + '15' }]} onPress={() => setCategory(c.key)}>
              <Text style={[styles.catChipText, category === c.key && { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {category === 'mileage' ? (
          <View>
            <Text style={styles.label}>MILES DRIVEN</Text>
            <TextInput value={miles} onChangeText={setMiles} placeholder="25" placeholderTextColor={C.textFaint} keyboardType="decimal-pad" style={styles.input} />
            {miles ? <Text style={styles.mileCalc}>{miles} mi × ${mileageRate}/mi = ${(+miles * mileageRate).toFixed(2)}</Text> : null}
          </View>
        ) : (
          <View>
            <Text style={styles.label}>AMOUNT ($)</Text>
            <TextInput value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={C.textFaint} keyboardType="decimal-pad" style={styles.input} />
          </View>
        )}

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Optional note..." placeholderTextColor={C.textFaint} style={styles.input} />

        <Button onPress={handleAdd} color={C.green} filled size="md" style={{ marginTop: 12 }}>ADD EXPENSE</Button>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>YTD Expenses</Text>
        <Text style={styles.summaryValue}>${totalExpenses.toFixed(2)}</Text>
      </View>

      {/* List */}
      {sortedExpenses.map(e => {
        const cat = CATEGORIES.find(c => c.key === e.category);
        return (
          <View key={e.id} style={styles.expenseRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.catDot, { backgroundColor: cat?.color || C.textMuted }]} />
                <Text style={styles.expenseDate}>{e.date}</Text>
                <Text style={[styles.expenseCat, { color: cat?.color }]}>{cat?.label}</Text>
              </View>
              {e.description && <Text style={styles.expenseDesc}>{e.description}</Text>}
            </View>
            <Text style={styles.expenseAmount}>${e.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => deleteExpense(e.id)} style={styles.expenseDelBtn}>
              <Text style={styles.expenseDel}>×</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {sortedExpenses.length === 0 && (
        <Text style={styles.empty}>No expenses logged yet</Text>
      )}
    </ScrollView>
  );
}

export default function ExpensesScreen() {
  return (
    <PremiumGate feature="Expense Tracking">
      <ExpensesContent />
    </PremiumGate>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: C.peach, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: C.textMuted, fontSize: 11, fontFamily: mono, marginBottom: 20 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 18, marginBottom: 16 },
  cardTitle: { color: C.textMuted, fontSize: 9, fontFamily: mono, letterSpacing: 2, fontWeight: '600', marginBottom: 12 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { borderWidth: 1, borderColor: C.borderLight, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  catChipText: { color: C.textMuted, fontFamily: mono, fontSize: 10, fontWeight: '600' },
  label: { color: C.textMuted, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, marginBottom: 6, fontWeight: '600', marginTop: 12 },
  input: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, color: C.text, fontFamily: mono, fontSize: 14 },
  mileCalc: { color: C.blue, fontSize: 11, fontFamily: mono, marginTop: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { color: C.textMuted, fontSize: 12, fontFamily: mono },
  summaryValue: { color: C.peach, fontSize: 20, fontWeight: '800', fontFamily: mono },
  expenseRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 8, gap: 10 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  expenseDate: { color: C.textSoft, fontSize: 11, fontFamily: mono },
  expenseCat: { fontSize: 10, fontFamily: mono, fontWeight: '600' },
  expenseDesc: { color: C.textFaint, fontSize: 9, fontFamily: mono, marginTop: 2, marginLeft: 16 },
  expenseAmount: { color: C.text, fontSize: 14, fontWeight: '700', fontFamily: mono },
  expenseDelBtn: { paddingLeft: 8 },
  expenseDel: { color: C.danger, fontSize: 16, fontWeight: '700' },
  empty: { color: C.textFaint, fontSize: 12, fontFamily: mono, textAlign: 'center', marginTop: 40 },
});
