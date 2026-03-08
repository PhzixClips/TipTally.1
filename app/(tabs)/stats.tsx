import React, { useMemo } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { getDayOfWeekAverages } from '../../lib/helpers';

export default function StatsScreen() {
  const { data } = useData();
  const { colors, accent } = useTheme();
  const shifts = data.shifts;

  const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  const bestShift = useMemo(
    () =>
      shifts.length > 0
        ? shifts.reduce((best, s) => (s.totalEarned > best.totalEarned ? s : best), shifts[0])
        : null,
    [shifts],
  );

  const avgShift = useMemo(
    () =>
      shifts.length > 0
        ? shifts.reduce((s, sh) => s + sh.totalEarned, 0) / shifts.length
        : 0,
    [shifts],
  );

  const dayAverages = useMemo(() => getDayOfWeekAverages(shifts), [shifts]);
  const bestDay = dayAverages.length > 0 ? dayAverages[0] : null;

  const avgHourly = useMemo(
    () =>
      shifts.length > 0
        ? shifts.reduce((s, sh) => s + sh.totalEarned / sh.hours, 0) / shifts.length
        : 0,
    [shifts],
  );

  const bestShiftSub = bestShift
    ? `${bestShift.displayDate} \u00B7 ${bestShift.hours} hrs\n$${Math.round(bestShift.totalEarned / bestShift.hours)}/hr`
    : '';

  const cardStyle = {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  };

  if (shifts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 28 }}>{'\uD83D\uDC37'}</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', fontFamily: mono }}>Stats</Text>
            </View>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '600' }}>+</Text>
            </View>
          </View>

          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>{'\uD83D\uDCCA'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, fontFamily: mono, textAlign: 'center' }}>
              Log some shifts to see your stats
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 28 }}>{'\uD83D\uDC37'}</Text>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', fontFamily: mono }}>Stats</Text>
          </View>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '600' }}>+</Text>
          </View>
        </View>

        {/* Best Shift Ever */}
        <View style={cardStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', fontFamily: mono, marginBottom: 4 }}>Best Shift Ever</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: mono, lineHeight: 16 }}>{bestShiftSub}</Text>
          </View>
          <Text style={{ color: accent.primary, fontSize: 28, fontWeight: '800', fontFamily: mono }}>
            ${Math.round(bestShift!.totalEarned)}
          </Text>
        </View>

        {/* Average Shift */}
        <View style={cardStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', fontFamily: mono, marginBottom: 4 }}>Average Shift</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: mono }}>per shift</Text>
          </View>
          <Text style={{ color: accent.primary, fontSize: 28, fontWeight: '800', fontFamily: mono }}>
            ${Math.round(avgShift)}
          </Text>
        </View>

        {/* Best Day */}
        <View style={cardStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', fontFamily: mono, marginBottom: 4 }}>Best Day</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: mono }}>
              Average: ${bestDay ? Math.round(bestDay.avgEarned) : 0}
            </Text>
          </View>
          <Text style={{ color: accent.primary, fontSize: 22, fontWeight: '800', fontFamily: mono }}>
            {bestDay ? bestDay.dayFull.charAt(0) + bestDay.dayFull.slice(1).toLowerCase() : '--'}
          </Text>
        </View>

        {/* Average Hourly */}
        <View style={cardStyle}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', fontFamily: mono, marginBottom: 4 }}>Average Hourly</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: mono }}>per hour</Text>
          </View>
          <Text style={{ color: accent.primary, fontSize: 28, fontWeight: '800', fontFamily: mono }}>
            ${Math.round(avgHourly)}/hr
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
