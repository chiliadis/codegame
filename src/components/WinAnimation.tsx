import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

interface WinAnimationProps {
  teamColor: 'red' | 'blue';
}

const { width, height } = Dimensions.get('window');

export default function WinAnimation({ teamColor }: WinAnimationProps) {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    translateY: useRef(new Animated.Value(-100)).current,
    translateX: useRef(new Animated.Value(Math.random() * width)).current,
    rotate: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(1)).current,
  }));

  useEffect(() => {
    // Animate each confetti piece
    confettiPieces.forEach((piece, index) => {
      const delay = index * 30;
      const duration = 2000 + Math.random() * 1000;

      Animated.parallel([
        Animated.timing(piece.translateY, {
          toValue: height + 100,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: Math.random() * 720,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration: duration * 0.8,
          delay: delay + duration * 0.2,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const colors = teamColor === 'red'
    ? ['#E53935', '#C62828', '#FF5252', '#FFEB3B', '#FFC107']
    : ['#1E88E5', '#1565C0', '#42A5F5', '#FFEB3B', '#FFC107'];

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confetti,
            {
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              width: Math.random() * 10 + 5,
              height: Math.random() * 20 + 10,
              transform: [
                { translateX: piece.translateX },
                { translateY: piece.translateY },
                { rotate: piece.rotate.interpolate({
                  inputRange: [0, 720],
                  outputRange: ['0deg', '720deg'],
                }) },
              ],
              opacity: piece.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});
