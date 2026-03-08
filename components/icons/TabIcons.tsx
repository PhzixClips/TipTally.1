import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

// Piggy bank - Home tab
// Side-profile: round body, two pointy ears top-left, coin dropping in top, curly tail right, two legs, snout left
export function PiggyBankIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Main round body */}
      <Path
        d="M10 28a14 14 0 0128 0a14 14 0 01-28 0z"
        stroke={color}
        strokeWidth={3}
        fill="none"
      />
      {/* Left ear - triangle */}
      <Path d="M15 15l-5-7 6 3z" stroke={color} strokeWidth={2.5} strokeLinejoin="round" fill="none" />
      {/* Right ear - triangle */}
      <Path d="M22 14l1-7 4 5z" stroke={color} strokeWidth={2.5} strokeLinejoin="round" fill="none" />
      {/* Coin on top */}
      <Circle cx="24" cy="9" r="3.5" fill={color} />
      {/* Snout on left */}
      <Path d="M9 26a3.5 3.5 0 010 5" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* Eye */}
      <Circle cx="17" cy="25" r="1.5" fill={color} />
      {/* Curly tail on right */}
      <Path d="M38 25c3-1 5 1 4 4s-3 2-3 1" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {/* Front leg */}
      <Line x1="18" y1="40" x2="18" y2="45" stroke={color} strokeWidth={3} strokeLinecap="round" />
      {/* Back leg */}
      <Line x1="30" y1="40" x2="30" y2="45" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

// Clock - Shifts tab
// Circle, 4 tick marks at 12/3/6/9, two hands forming V shape (pointing to ~10 and ~2)
export function ClockIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Outer circle */}
      <Circle cx="24" cy="24" r="20" stroke={color} strokeWidth={3} />
      {/* 12 o'clock tick */}
      <Line x1="24" y1="6" x2="24" y2="10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* 3 o'clock tick */}
      <Line x1="42" y1="24" x2="38" y2="24" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* 6 o'clock tick */}
      <Line x1="24" y1="42" x2="24" y2="38" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* 9 o'clock tick */}
      <Line x1="6" y1="24" x2="10" y2="24" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* Left hand - pointing to ~10 */}
      <Line x1="24" y1="24" x2="16" y2="13" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      {/* Right hand - pointing to ~2 */}
      <Line x1="24" y1="24" x2="32" y2="13" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      {/* Center dot */}
      <Circle cx="24" cy="24" r="2" fill={color} />
    </Svg>
  );
}

// Calendar - Schedule tab
// Rounded rect body, two binding posts, header divider, 4x3 grid of filled squares
export function CalendarIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Calendar body */}
      <Rect x="4" y="8" width="40" height="36" rx="5" stroke={color} strokeWidth={3} />
      {/* Header divider */}
      <Line x1="4" y1="18" x2="44" y2="18" stroke={color} strokeWidth={3} />
      {/* Left binding post */}
      <Line x1="15" y1="4" x2="15" y2="12" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      {/* Right binding post */}
      <Line x1="33" y1="4" x2="33" y2="12" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      {/* Row 1 */}
      <Rect x="9" y="22" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="17" y="22" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="25" y="22" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="33" y="22" width="4.5" height="3.5" rx="0.8" fill={color} />
      {/* Row 2 */}
      <Rect x="9" y="29" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="17" y="29" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="25" y="29" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="33" y="29" width="4.5" height="3.5" rx="0.8" fill={color} />
      {/* Row 3 */}
      <Rect x="9" y="36" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="17" y="36" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="25" y="36" width="4.5" height="3.5" rx="0.8" fill={color} />
      <Rect x="33" y="36" width="4.5" height="3.5" rx="0.8" fill={color} />
    </Svg>
  );
}

// Stats - Bar chart with curved growth arrow
// 3 bars increasing height L to R, smooth curved arrow sweeping up to the right
export function StatsIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Bar 1 - short */}
      <Rect x="6" y="30" width="9" height="14" rx="1.5" stroke={color} strokeWidth={2.8} />
      {/* Bar 2 - medium */}
      <Rect x="19.5" y="22" width="9" height="22" rx="1.5" stroke={color} strokeWidth={2.8} />
      {/* Bar 3 - tall */}
      <Rect x="33" y="14" width="9" height="30" rx="1.5" stroke={color} strokeWidth={2.8} />
      {/* Growth arrow - smooth curve */}
      <Path
        d="M8 28C16 20 24 12 40 6"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head */}
      <Path
        d="M35 4l6 2-2 6"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Gear/Cog - Settings tab
// 8 rounded bumpy teeth around the edge, inner donut circle, center hole
export function GearIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Gear body - 8 bumpy teeth */}
      <Path
        d="M24 4c1.8 0 3.3 1 3.8 2.5l.6 2c1 .4 2 1 2.8 1.6l2-.5c1.6-.4 3.3.4 4 1.8.7 1.5.3 3.2-.9 4.2l-1.4 1.2c.2.9.3 1.8.3 2.7 0 .9-.1 1.8-.3 2.7l1.4 1.2c1.2 1 1.6 2.7.9 4.2-.7 1.4-2.4 2.2-4 1.8l-2-.5c-.8.6-1.8 1.2-2.8 1.6l-.6 2c-.5 1.5-2 2.5-3.8 2.5s-3.3-1-3.8-2.5l-.6-2c-1-.4-2-1-2.8-1.6l-2 .5c-1.6.4-3.3-.4-4-1.8-.7-1.5-.3-3.2.9-4.2l1.4-1.2c-.2-.9-.3-1.8-.3-2.7 0-.9.1-1.8.3-2.7l-1.4-1.2c-1.2-1-1.6-2.7-.9-4.2.7-1.4 2.4-2.2 4-1.8l2 .5c.8-.6 1.8-1.2 2.8-1.6l.6-2C20.7 5 22.2 4 24 4z"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner circle - donut */}
      <Circle cx="24" cy="24" r="6" stroke={color} strokeWidth={3} />
    </Svg>
  );
}
