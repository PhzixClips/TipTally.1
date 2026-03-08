import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
  children, onPress, color, filled = false,
  style, disabled, size = 'md',
}: Props) {
  const { accent, colors } = useTheme();
  const btnColor = color || accent.primary;
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
          backgroundColor: filled ? btnColor : btnColor + '15',
          borderColor: btnColor + '40',
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: filled ? colors.bg : btnColor, fontSize }]}>
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
