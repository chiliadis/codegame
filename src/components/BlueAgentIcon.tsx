import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, Ellipse } from 'react-native-svg';

interface BlueAgentIconProps {
  size: number;
}

export default function BlueAgentIcon({ size }: BlueAgentIconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background circle */}
        <Circle cx="50" cy="50" r="48" fill="#0D47A1" />

        {/* Spy silhouette */}
        {/* Head */}
        <Circle cx="50" cy="35" r="12" fill="#000000" />

        {/* Hat brim */}
        <Ellipse cx="50" cy="26" rx="18" ry="4" fill="#000000" />

        {/* Hat top */}
        <Path
          d="M 38 26 L 38 18 Q 38 15 41 15 L 59 15 Q 62 15 62 18 L 62 26 Z"
          fill="#000000"
        />

        {/* Sunglasses */}
        <Rect x="42" y="34" width="6" height="3" rx="1" fill="#ffffff" opacity="0.9" />
        <Rect x="52" y="34" width="6" height="3" rx="1" fill="#ffffff" opacity="0.9" />
        <Rect x="48" y="35" width="4" height="1.5" fill="#ffffff" opacity="0.9" />

        {/* Body/Trenchcoat */}
        <Path
          d="M 40 45 L 35 55 L 33 75 L 38 75 L 42 58 L 50 60 L 58 58 L 62 75 L 67 75 L 65 55 L 60 45 Z"
          fill="#000000"
        />

        {/* Collar */}
        <Path
          d="M 42 45 L 45 48 L 50 47 L 55 48 L 58 45"
          fill="#1a1a1a"
        />

        {/* Belt */}
        <Rect x="38" y="60" width="24" height="2" fill="#ffffff" opacity="0.8" />
        <Circle cx="50" cy="61" r="2" fill="#FFD700" />

        {/* Blue accent stripe */}
        <Rect x="48" y="48" width="4" height="20" fill="#2196F3" opacity="0.7" />
      </Svg>
    </View>
  );
}
