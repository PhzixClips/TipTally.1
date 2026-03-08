import React from 'react';
import { View, Text, TextInput, Platform, KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}

export default function Input({ label, value, onChangeText, placeholder, keyboardType = 'default' }: Props) {
  const { colors } = useTheme();
  const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{
        color: colors.textMuted, fontSize: 11, fontFamily: mono,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: '600',
      }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        style={{
          backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
          borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
          color: colors.text, fontFamily: mono, fontSize: 16,
        }}
      />
    </View>
  );
}
