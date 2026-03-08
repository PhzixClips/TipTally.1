import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

// Piggy bank icon - Home tab
export function PiggyBankIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <Path
        d="M19 10c0-3.87-3.37-7-7.5-7S4 6.13 4 10c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h1.5l.5 2h2l.5-2H14a1 1 0 001-1v-1.26c1.81-1.27 3-3.36 3-5.74h1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ear */}
      <Path
        d="M6.5 6.5L4.5 4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* Coin slot */}
      <Circle cx="11.5" cy="6" r="1.5" stroke={color} strokeWidth={1.5} />
      {/* Eye */}
      <Circle cx="14" cy="10" r="0.8" fill={color} />
      {/* Tail */}
      <Path
        d="M19 10c.5-.5 1.5-.5 2 .5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Front leg */}
      <Line x1="8" y1="17" x2="8" y2="19.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Back leg */}
      <Line x1="14" y1="17" x2="14" y2="19.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// Clock icon - Shifts tab
export function ClockIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={2} />
      {/* Hour marks */}
      <Line x1="12" y1="3.5" x2="12" y2="5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="12" y1="19" x2="12" y2="20.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="3.5" y1="12" x2="5" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="19" y1="12" x2="20.5" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Hour hand */}
      <Line x1="12" y1="12" x2="12" y2="7.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Minute hand */}
      <Line x1="12" y1="12" x2="15.5" y2="8" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      {/* Center dot */}
      <Circle cx="12" cy="12" r="1" fill={color} />
    </Svg>
  );
}

// Calendar icon - Schedule tab
export function CalendarIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Calendar body */}
      <Rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth={2} />
      {/* Top bar */}
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={2} />
      {/* Binding rings */}
      <Line x1="8" y1="3" x2="8" y2="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="16" y1="3" x2="16" y2="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Date dots - row 1 */}
      <Rect x="6" y="12.5" width="2.5" height="2" rx="0.5" fill={color} />
      <Rect x="10.5" y="12.5" width="2.5" height="2" rx="0.5" fill={color} />
      <Rect x="15" y="12.5" width="2.5" height="2" rx="0.5" fill={color} />
      {/* Date dots - row 2 */}
      <Rect x="6" y="16" width="2.5" height="2" rx="0.5" fill={color} />
      <Rect x="10.5" y="16" width="2.5" height="2" rx="0.5" fill={color} />
      <Rect x="15" y="16" width="2.5" height="2" rx="0.5" fill={color} />
    </Svg>
  );
}

// Bar chart with arrow icon - Stats tab
export function StatsIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bar 1 (short) */}
      <Rect x="4" y="14" width="4" height="7" rx="1.2" stroke={color} strokeWidth={1.8} />
      {/* Bar 2 (medium) */}
      <Rect x="10" y="10" width="4" height="11" rx="1.2" stroke={color} strokeWidth={1.8} />
      {/* Bar 3 (tall) */}
      <Rect x="16" y="6" width="4" height="15" rx="1.2" stroke={color} strokeWidth={1.8} />
      {/* Growth arrow */}
      <Path
        d="M5 13C8 10 12 7 19 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 3h4v4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Gear icon - Settings tab
export function GearIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
