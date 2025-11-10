import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect } from 'react-native-svg';

interface SpyIconProps {
  type: 'red' | 'blue' | 'assassin' | 'neutral';
  size: number;
}

export default function SpyIcon({ type, size }: SpyIconProps) {
  const getColors = () => {
    switch (type) {
      case 'red':
        return {
          hat: '#8B0000',
          coat: '#DC143C',
          skin: '#FFD0B5',
          glasses: '#1a1a1a',
        };
      case 'blue':
        return {
          hat: '#00008B',
          coat: '#4169E1',
          skin: '#FFD0B5',
          glasses: '#1a1a1a',
        };
      case 'assassin':
        return {
          hat: '#000000',
          coat: '#1a1a1a',
          skin: '#FFD0B5',
          glasses: '#000000',
        };
      default: // neutral
        return {
          hat: '#696969',
          coat: '#A9A9A9',
          skin: '#FFD0B5',
          glasses: '#1a1a1a',
        };
    }
  };

  const colors = getColors();

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Fedora Hat */}
        <Ellipse cx="50" cy="25" rx="28" ry="8" fill={colors.hat} />
        <Path
          d="M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 30 Q 70 35 50 35 Q 30 35 30 30 Z"
          fill={colors.hat}
        />

        {/* Head */}
        <Circle cx="50" cy="45" r="12" fill={colors.skin} />

        {/* Sunglasses */}
        <Rect x="40" y="43" width="8" height="5" rx="2" fill={colors.glasses} />
        <Rect x="52" y="43" width="8" height="5" rx="2" fill={colors.glasses} />
        <Rect x="48" y="44" width="4" height="2" fill={colors.glasses} />

        {/* Trench Coat - Body */}
        <Path
          d="M 38 55 L 35 75 L 40 95 L 45 95 L 50 70 L 55 95 L 60 95 L 65 75 L 62 55 Z"
          fill={colors.coat}
        />

        {/* Collar */}
        <Path
          d="M 38 55 L 42 60 L 50 57 L 58 60 L 62 55 Z"
          fill={colors.hat}
        />

        {/* Belt */}
        <Rect x="38" y="70" width="24" height="3" fill={colors.hat} />

        {/* Arms */}
        <Path
          d="M 38 60 L 25 65 L 28 75 L 35 72"
          fill={colors.coat}
        />
        <Path
          d="M 62 60 L 75 65 L 72 75 L 65 72"
          fill={colors.coat}
        />

        {/* Briefcase (for extra spy feel) */}
        <Rect x="22" y="73" width="8" height="6" rx="1" fill="#654321" />
        <Rect x="24" y="75" width="4" height="2" fill="#8B7355" />
      </Svg>
    </View>
  );
}
