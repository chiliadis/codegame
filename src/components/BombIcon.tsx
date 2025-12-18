import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, Line, Ellipse } from 'react-native-svg';

interface BombIconProps {
  size: number;
}

export default function BombIcon({ size }: BombIconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background circle - dark */}
        <Circle cx="50" cy="50" r="48" fill="#212121" />

        {/* Warning stripes background */}
        <Rect x="20" y="20" width="60" height="8" fill="#FFD600" />
        <Rect x="20" y="28" width="60" height="8" fill="#000000" />
        <Rect x="20" y="36" width="60" height="8" fill="#FFD600" />

        {/* Bomb body - main sphere */}
        <Circle cx="50" cy="60" r="24" fill="#1a1a1a" stroke="#000000" strokeWidth="2" />

        {/* Bomb highlight (to show it's spherical) */}
        <Ellipse cx="44" cy="54" rx="8" ry="10" fill="#2a2a2a" opacity="0.6" />

        {/* Fuse holder */}
        <Rect x="48" y="32" width="4" height="8" fill="#4a4a4a" />

        {/* Fuse - curved */}
        <Path
          d="M 50 32 Q 54 28 56 24 Q 58 20 60 18"
          fill="none"
          stroke="#8B4513"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Spark/Flame at fuse tip */}
        <Circle cx="60" cy="18" r="3" fill="#FF6F00" />
        <Circle cx="60" cy="18" r="5" fill="#FFD600" opacity="0.5" />

        {/* Spark particles */}
        <Circle cx="58" cy="15" r="1.5" fill="#FF6F00" />
        <Circle cx="63" cy="17" r="1.5" fill="#FF6F00" />
        <Circle cx="61" cy="21" r="1.5" fill="#FFD600" />

        {/* Skull warning symbol on bomb */}
        {/* Skull */}
        <Ellipse cx="50" cy="58" rx="7" ry="8" fill="#ffffff" />
        <Rect x="46" y="62" width="8" height="4" fill="#ffffff" />

        {/* Skull eyes */}
        <Circle cx="47" cy="57" r="2" fill="#000000" />
        <Circle cx="53" cy="57" r="2" fill="#000000" />

        {/* Skull nose */}
        <Path d="M 50 60 L 48 62 L 52 62 Z" fill="#000000" />

        {/* Crossbones behind */}
        <Rect x="40" y="67" width="3" height="10" fill="#ffffff" rx="1.5" transform="rotate(-45 42 72)" />
        <Rect x="57" y="67" width="3" height="10" fill="#ffffff" rx="1.5" transform="rotate(45 58 72)" />

        {/* Bone ends */}
        <Circle cx="38" cy="70" r="2" fill="#ffffff" />
        <Circle cx="38" cy="74" r="2" fill="#ffffff" />
        <Circle cx="62" cy="70" r="2" fill="#ffffff" />
        <Circle cx="62" cy="74" r="2" fill="#ffffff" />

        {/* Red warning glow */}
        <Circle cx="50" cy="60" r="26" fill="#FF0000" opacity="0.15" />
      </Svg>
    </View>
  );
}
