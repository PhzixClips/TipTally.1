import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { C } from '../../lib/constants';

interface Props {
  children: string;
  onPress: () => void;
  color?: string;
  filled?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children, onPress, color = C.green, filled = false,
  style, disabled, size = 'md',
}: Props) {
  const padV = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const padH = size === 'sm' ? 14 : size === 'lg' ? 24 : 20;
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.btn,
        {
          backgroundColor: filled ? color : color + '15',
          borderColor: color + '40',
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: filled ? C.bg : color, fontSize }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
