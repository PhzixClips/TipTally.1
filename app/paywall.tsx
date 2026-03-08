import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePremium } from '../context/PremiumContext';
import { C, PREMIUM_PRICE } from '../lib/constants';

const FREE_FEATURES = [
  'Unlimited shift logging',
  '1 job, 3 roles',
  'Basic analytics',
  'CSV export',
  '2 AI schedule scans/week',
  'Cash/credit tip tracking',
];

const PREMIUM_FEATURES = [
  'Tax dashboard + $25K tracker',
  'Quarterly tax estimates',
  'Unlimited AI schedule scans',
  'Goal tracking & streaks',
  'Expense tracking + mileage',
  'Unlimited jobs & roles',
  'Multi-recipient tip-out',
  'Cloud sync & backup',
  'Advanced analytics (YoY, seasonal)',
  'Priority support',
];

export default function PaywallScreen() {
  const { purchase, isLoading, isPremium } = usePremium();
  const router = useRouter();
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  if (isPremium) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.checkmark}>&#10003;</Text>
          <Text style={styles.premiumTitle}>You're Premium!</Text>
          <Text style={styles.premiumSub}>All features are unlocked.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>TipTally Premium</Text>
      <Text style={styles.subtitle}>Track smarter. Earn more. Keep more.</Text>

      {/* Plan Toggle */}
      <View style={styles.planToggle}>
        <TouchableOpacity style={[styles.planBtn, plan === 'monthly' && styles.planBtnActive]} onPress={() => setPlan('monthly')}>
          <Text style={[styles.planBtnText, plan === 'monthly' && styles.planBtnTextActive]}>Monthly</Text>
          <Text style={[styles.planPrice, plan === 'monthly' && styles.planPriceActive]}>${PREMIUM_PRICE.monthly}/mo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.planBtn, plan === 'annual' && styles.planBtnActive]} onPress={() => setPlan('annual')}>
          <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>Save 50%</Text></View>
          <Text style={[styles.planBtnText, plan === 'annual' && styles.planBtnTextActive]}>Annual</Text>
          <Text style={[styles.planPrice, plan === 'annual' && styles.planPriceActive]}>${PREMIUM_PRICE.annual}/yr</Text>
          <Text style={styles.planPriceMonth}>${(PREMIUM_PRICE.annual / 12).toFixed(2)}/mo</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Comparison */}
      <View style={styles.compCard}>
        <Text style={styles.compTitle}>FREE</Text>
        {FREE_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCheck}>&#10003;</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.compCard, { borderColor: C.gold + '60' }]}>
        <Text style={[styles.compTitle, { color: C.gold }]}>PREMIUM</Text>
        <Text style={styles.compSub}>Everything in Free, plus:</Text>
        {PREMIUM_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={[styles.featureCheck, { color: C.gold }]}>&#10003;</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.ctaBtn} onPress={() => purchase(plan)} disabled={isLoading}>
        <Text style={styles.ctaBtnText}>{isLoading ? 'Processing...' : 'Start 7-Day Free Trial'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreBtn} onPress={() => router.back()}>
        <Text style={styles.restoreBtnText}>Restore Purchases</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        Cancel anytime. Payment charged after 7-day trial.{'\n'}
        Subscription auto-renews unless cancelled.
      </Text>
    </ScrollView>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 60 },
  title: { color: C.gold, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 20 },
  subtitle: { color: C.textMuted, fontSize: 13, fontFamily: mono, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  planToggle: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  planBtn: { flex: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 16, padding: 18, alignItems: 'center' },
  planBtnActive: { borderColor: C.gold, backgroundColor: C.goldBg },
  planBtnText: { color: C.textMuted, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  planBtnTextActive: { color: C.text },
  planPrice: { color: C.textFaint, fontSize: 18, fontWeight: '800', fontFamily: mono },
  planPriceActive: { color: C.gold },
  planPriceMonth: { color: C.textMuted, fontSize: 10, fontFamily: mono, marginTop: 2 },
  saveBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: C.green, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8 },
  saveBadgeText: { color: C.bg, fontSize: 9, fontWeight: '700', fontFamily: mono },
  compCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 18, marginBottom: 16 },
  compTitle: { color: C.textSoft, fontSize: 11, fontFamily: mono, letterSpacing: 2, fontWeight: '700', marginBottom: 12 },
  compSub: { color: C.textMuted, fontSize: 10, fontFamily: mono, marginBottom: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  featureCheck: { color: C.green, fontSize: 14, fontWeight: '700' },
  featureText: { color: C.textSoft, fontSize: 12, fontFamily: mono },
  ctaBtn: { backgroundColor: C.gold, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  ctaBtnText: { color: C.bg, fontSize: 16, fontWeight: '800' },
  restoreBtn: { alignItems: 'center', paddingVertical: 12 },
  restoreBtnText: { color: C.textMuted, fontSize: 12, fontFamily: mono },
  legal: { color: C.textFaint, fontSize: 9, fontFamily: mono, textAlign: 'center', marginTop: 12, lineHeight: 14 },
  checkmark: { color: C.green, fontSize: 64, marginBottom: 16 },
  premiumTitle: { color: C.gold, fontSize: 24, fontWeight: '800' },
  premiumSub: { color: C.textMuted, fontSize: 13, fontFamily: mono, marginTop: 8 },
  doneBtn: { backgroundColor: C.green, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginTop: 24 },
  doneBtnText: { color: C.bg, fontWeight: '700', fontSize: 16 },
});
