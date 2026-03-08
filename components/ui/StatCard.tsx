import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  emoji?: string;
}

export default function StatCard({ label, value, sub, accent: accentProp, emoji }: Props) {
  const { accent, colors } = useTheme();
  const color = accentProp || accent.primary;
  const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  return (
    <View style={{ borderWidth: 1, borderRadius: 16, padding: 16, minWidth: 140, flex: 1, backgroundColor: color + '12', borderColor: color + '20' }}>
      {emoji && <Text style={{ fontSize: 18, marginBottom: 8 }}>{emoji}</Text>}
      <Text style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: mono, marginBottom: 6, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color, fontSize: 24, fontWeight: '800', fontFamily: mono }}>{value}</Text>
      {sub ? <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4, fontFamily: mono }}>{sub}</Text> : null}
    </View>
  );
}
