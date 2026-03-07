import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { C } from '../../lib/constants';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  emoji?: string;
}

export default function StatCard({ label, value, sub, accent = C.green, emoji }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: accent + '12', borderColor: accent + '20' }]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    flex: 1,
  },
  emoji: {
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    color: C.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: mono,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: mono,
  },
  sub: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 4,
    fontFamily: mono,
  },
});
