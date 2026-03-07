import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  percent: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ percent, color = '#B18CFF', height = 8 }: Props) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <View style={[styles.track, { height, backgroundColor: color + '18' }]}>
      <View style={[styles.fill, { width: `${width}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 99,
  },
});
