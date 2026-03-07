import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform, KeyboardTypeOptions } from 'react-native';
import { C } from '../../lib/constants';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}

export default function Input({ label, value, onChangeText, placeholder, keyboardType = 'default' }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textFaint}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: C.text,
    fontFamily: mono,
    fontSize: 16,
  },
});
