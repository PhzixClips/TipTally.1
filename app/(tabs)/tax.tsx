import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useData } from '../../context/DataContext';
import { usePremium } from '../../context/PremiumContext';
import PremiumGate from '../../components/premium/PremiumGate';
import { C } from '../../lib/constants';
import { calculateTaxSummary, TAX_CONSTANTS } from '../../lib/tax';
import Svg, { Circle } from 'react-native-svg';

function DeductionRing({ used, cap }: { used: number; cap: number }) {
  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, used / cap);
  const offset = circumference * (1 - pct);
  const color = pct < 0.5 ? C.green : pct < 0.8 ? C.gold : C.coral;

  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={C.border} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${circumference}`} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[styles.ringAmount, { color }]}>${Math.round(cap - used).toLocaleString()}</Text>
        <Text style={styles.ringLabel}>remaining</Text>
      </View>
    </View>
  );
}

function TaxDashboardContent() {
  const { data } = useData();
  const taxSummary = useMemo(
    () => calculateTaxSummary(data.shifts, data.settings),
    [data.shifts, data.settings]
  );

  const dueDate = taxSummary.quarterDueDate;
  const daysUntilDue = dueDate ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Tax Dashboard</Text>
      <Text style={styles.subtitle}>2026 No Tax on Tips Act</Text>

      {/* $25K Deduction Tracker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>$25,000 TIP DEDUCTION</Text>
        <DeductionRing used={taxSummary.tipsDeductionUsed} cap={TAX_CONSTANTS.NO_TAX_ON_TIPS_CAP} />
        <View style={styles.deductionRow}>
          <View style={styles.deductionCol}>
            <Text style={styles.deductionValue}>${Math.round(taxSummary.tipsDeductionUsed).toLocaleString()}</Text>
            <Text style={styles.deductionLabel}>Used</Text>
          </View>
          <View style={styles.deductionCol}>
            <Text style={[styles.deductionValue, { color: C.green }]}>${Math.round(taxSummary.tipsDeductionRemaining).toLocaleString()}</Text>
            <Text style={styles.deductionLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* YTD Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>YEAR-TO-DATE EARNINGS</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: C.green }]}>${Math.round(taxSummary.ytdTotalEarned).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: C.gold }]}>${Math.round(taxSummary.ytdTips).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Tips</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: C.blue }]}>${Math.round(taxSummary.ytdWages).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Wages</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: C.coral }]}>-${Math.round(taxSummary.ytdTipOut).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Tip Outs</Text>
          </View>
        </View>
        {/* Cash vs Credit */}
        {(taxSummary.ytdCashTips > 0 || taxSummary.ytdCreditTips > 0) && (
          <View style={styles.cashCreditSection}>
            <Text style={styles.miniLabel}>TIP BREAKDOWN</Text>
            <View style={styles.barRow}>
              <View style={[styles.bar, { flex: taxSummary.ytdCashTips || 1, backgroundColor: C.mint }]} />
              <View style={[styles.bar, { flex: taxSummary.ytdCreditTips || 1, backgroundColor: C.purple }]} />
            </View>
            <View style={styles.barLabels}>
              <Text style={[styles.barLabel, { color: C.mint }]}>Cash ${Math.round(taxSummary.ytdCashTips)}</Text>
              <Text style={[styles.barLabel, { color: C.purple }]}>Credit ${Math.round(taxSummary.ytdCreditTips)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Quarterly Estimate */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Q{taxSummary.currentQuarter} ESTIMATED TAX</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: C.peach }]}>${Math.round(taxSummary.estimatedQuarterlyPayment).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Est. Payment</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: daysUntilDue <= 14 ? C.coral : C.textSoft }]}>{daysUntilDue}d</Text>
            <Text style={styles.statLabel}>Until Due</Text>
          </View>
        </View>
        <View style={styles.taxBreakdown}>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Federal</Text>
            <Text style={styles.taxValue}>${Math.round(taxSummary.estimatedFederalTax)}</Text>
          </View>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>FICA (7.65%)</Text>
            <Text style={styles.taxValue}>${Math.round(taxSummary.estimatedFICA)}</Text>
          </View>
          {taxSummary.estimatedStateTax > 0 && (
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>State</Text>
              <Text style={styles.taxValue}>${Math.round(taxSummary.estimatedStateTax)}</Text>
            </View>
          )}
        </View>
        {dueDate && <Text style={styles.dueDate}>Due: {dueDate}</Text>}
      </View>

      {/* Monthly Breakdown */}
      {taxSummary.monthlyBreakdown.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>MONTHLY BREAKDOWN</Text>
          {taxSummary.monthlyBreakdown.map(m => (
            <View key={m.month} style={styles.monthRow}>
              <Text style={styles.monthName}>{m.month}</Text>
              <View style={styles.monthBars}>
                <Text style={styles.monthTips}>${Math.round(m.tips)} tips</Text>
                <Text style={styles.monthTotal}>${Math.round(m.total)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.disclaimer}>
        This is not tax advice. Consult a qualified tax professional for your specific situation.
      </Text>
    </ScrollView>
  );
}

export default function TaxScreen() {
  return (
    <PremiumGate feature="Tax Dashboard">
      <TaxDashboardContent />
    </PremiumGate>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: { color: C.gold, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: C.textMuted, fontSize: 11, fontFamily: mono, marginBottom: 20 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 18, marginBottom: 16 },
  cardTitle: { color: C.textMuted, fontSize: 9, fontFamily: mono, letterSpacing: 2, fontWeight: '600', marginBottom: 12 },
  ringAmount: { fontSize: 24, fontWeight: '800', fontFamily: mono },
  ringLabel: { color: C.textMuted, fontSize: 10, fontFamily: mono },
  deductionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  deductionCol: { alignItems: 'center' },
  deductionValue: { color: C.textSoft, fontSize: 16, fontWeight: '700', fontFamily: mono },
  deductionLabel: { color: C.textMuted, fontSize: 9, fontFamily: mono, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stat: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14 },
  statValue: { fontSize: 18, fontWeight: '800', fontFamily: mono },
  statLabel: { color: C.textMuted, fontSize: 9, fontFamily: mono, marginTop: 4 },
  cashCreditSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  miniLabel: { color: C.textFaint, fontSize: 8, fontFamily: mono, letterSpacing: 1, marginBottom: 8 },
  barRow: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  bar: { borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  barLabel: { fontSize: 10, fontFamily: mono, fontWeight: '600' },
  taxBreakdown: { backgroundColor: C.surface, borderRadius: 10, padding: 12, marginTop: 12 },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  taxLabel: { color: C.textMuted, fontSize: 11, fontFamily: mono },
  taxValue: { color: C.textSoft, fontSize: 11, fontFamily: mono, fontWeight: '600' },
  dueDate: { color: C.textFaint, fontSize: 10, fontFamily: mono, textAlign: 'center', marginTop: 8 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  monthName: { color: C.textSoft, fontSize: 12, fontFamily: mono, fontWeight: '600', width: 40 },
  monthBars: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  monthTips: { color: C.gold, fontSize: 11, fontFamily: mono },
  monthTotal: { color: C.green, fontSize: 11, fontFamily: mono, fontWeight: '700' },
  disclaimer: { color: C.textFaint, fontSize: 9, fontFamily: mono, textAlign: 'center', marginTop: 16, lineHeight: 14, fontStyle: 'italic' },
});
