import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface NeutralIconProps {
  size: number;
}

export default function NeutralIcon({ size }: NeutralIconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background circle */}
        <Circle cx="50" cy="50" r="48" fill="#757575" />

        {/* Bystander person icon - simple silhouette */}
        {/* Head */}
        <Circle cx="50" cy="35" r="10" fill="#424242" />

        {/* Body */}
        <Path
          d="M 50 45 L 40 50 L 38 70 L 42 70 L 44 55 L 50 57 L 56 55 L 58 70 L 62 70 L 60 50 Z"
          fill="#424242"
        />

        {/* Simple facial features */}
        <Circle cx="46" cy="34" r="1.5" fill="#212121" />
        <Circle cx="54" cy="34" r="1.5" fill="#212121" />
        <Path d="M 46 38 Q 50 40 54 38" fill="none" stroke="#212121" strokeWidth="1" />

        {/* Question mark overlay (bystander is confused/neutral) */}
        <Circle cx="50" cy="60" r="18" fill="#9E9E9E" opacity="0.9" />
        <Path
          d="M 46 52 Q 46 48 50 48 Q 54 48 54 52 Q 54 55 50 56 L 50 60"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Circle cx="50" cy="65" r="2" fill="#FFFFFF" />
      </Svg>
    </View>
  );
}
