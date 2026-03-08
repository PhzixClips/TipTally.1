import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../context/DataContext';
import { C } from '../lib/constants';

const { width } = Dimensions.get('window');

const SCREENS = [
  {
    title: 'Track Every Dollar',
    subtitle: 'Log shifts in seconds with role selection, cash/credit split, and smart tip-out calculation.',
    accent: C.green,
    icon: '$',
    features: ['One-tap shift logging', 'Cash vs credit tip tracking', 'Automatic tip-out calculation', 'Smart role-based wages'],
  },
  {
    title: 'Know Your Tax Deduction',
    subtitle: "The 2026 No Tax on Tips Act lets you deduct up to $25,000 in tips. We track every dollar.",
    accent: C.gold,
    icon: '%',
    features: ['$25K deduction tracker', 'Quarterly tax estimates', 'YTD earnings dashboard', 'Cash vs credit breakdown'],
  },
  {
    title: 'AI Schedule Scanner',
    subtitle: 'Snap a photo of your work schedule and let AI extract every shift automatically.',
    accent: C.purple,
    icon: 'AI',
    features: ['Photo-to-schedule in seconds', 'Auto-detects roles & times', 'One-tap shift logging', 'Never miss a shift'],
  },
];

export default function OnboardingScreen() {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { markOnboardingSeen } = useData();

  const goNext = () => {
    if (page < SCREENS.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
      setPage(page + 1);
    } else {
      markOnboardingSeen();
      router.replace('/(tabs)');
    }
  };

  const skip = () => {
    markOnboardingSeen();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16}
      >
        {SCREENS.map((screen, i) => (
          <View key={i} style={[styles.page, { width }]}>
            <View style={[styles.iconCircle, { borderColor: screen.accent + '40' }]}>
              <Text style={[styles.iconText, { color: screen.accent }]}>{screen.icon}</Text>
            </View>
            <Text style={[styles.pageTitle, { color: screen.accent }]}>{screen.title}</Text>
            <Text style={styles.pageSub}>{screen.subtitle}</Text>
            <View style={styles.featureList}>
              {screen.features.map((f, j) => (
                <View key={j} style={styles.featureRow}>
                  <View style={[styles.featureDot, { backgroundColor: screen.accent }]} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SCREENS.map((_, i) => (
          <View key={i} style={[styles.dot, page === i && { backgroundColor: SCREENS[page].accent, width: 24 }]} />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: SCREENS[page].accent }]} onPress={goNext}>
        <Text style={styles.ctaText}>{page === SCREENS.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>

      {page === SCREENS.length - 1 && (
        <TouchableOpacity style={styles.trialBtn} onPress={() => { markOnboardingSeen(); router.replace('/paywall' as any); }}>
          <Text style={styles.trialText}>Start Free Trial</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingBottom: 40 },
  skipBtn: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { color: C.textMuted, fontSize: 14, fontFamily: mono },
  page: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 80 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  iconText: { fontSize: 36, fontWeight: '800', fontFamily: mono },
  pageTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  pageSub: { color: C.textMuted, fontSize: 13, fontFamily: mono, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  featureList: { width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  featureDot: { width: 6, height: 6, borderRadius: 3 },
  featureText: { color: C.textSoft, fontSize: 13, fontFamily: mono },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  ctaBtn: { marginHorizontal: 24, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  ctaText: { color: C.bg, fontSize: 16, fontWeight: '800' },
  trialBtn: { alignItems: 'center', marginTop: 12 },
  trialText: { color: C.gold, fontSize: 13, fontFamily: mono, fontWeight: '600' },
});
