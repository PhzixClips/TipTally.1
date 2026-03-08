import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { usePremium } from '../../context/PremiumContext';
import { C } from '../../lib/constants';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, fallback, feature }: Props) {
  const { isPremium } = usePremium();
  const router = useRouter();

  if (isPremium) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <View style={styles.container}>
      <View style={styles.lockBox}>
        <Text style={styles.lockIcon}>&#x1f512;</Text>
        <Text style={styles.lockTitle}>Premium Feature</Text>
        <Text style={styles.lockDesc}>
          {feature ? `${feature} requires` : 'This feature requires'} TipTally Premium
        </Text>
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/paywall' as any)}>
          <Text style={styles.upgradeBtnText}>Unlock Premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: C.bg },
  lockBox: { alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 32, width: '100%', maxWidth: 320 },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockTitle: { color: C.gold, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  lockDesc: { color: C.textMuted, fontSize: 12, fontFamily: mono, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  upgradeBtn: { backgroundColor: C.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  upgradeBtnText: { color: C.bg, fontWeight: '700', fontFamily: mono, fontSize: 14 },
});
