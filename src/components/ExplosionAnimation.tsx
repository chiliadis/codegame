import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ExplosionAnimation() {
  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    return {
      id: i,
      scale: useRef(new Animated.Value(0)).current,
      translateX: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(0)).current,
      opacity: useRef(new Animated.Value(1)).current,
      angle,
    };
  });

  const flashOpacity = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Flash effect
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Screen shake
    Animated.sequence([
      Animated.timing(shakeX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Explosion particles
    particles.forEach((particle, index) => {
      const distance = 200 + Math.random() * 100;
      const delay = index * 10;

      Animated.parallel([
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: Math.cos(particle.angle) * distance,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(particle.angle) * distance,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 800,
          delay: delay + 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Flash effect */}
      <Animated.View
        style={[
          styles.flash,
          {
            opacity: flashOpacity,
            transform: [{ translateX: shakeX }],
          },
        ]}
      />

      {/* Explosion center */}
      <View style={styles.center}>
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
                backgroundColor: ['#FF6B6B', '#FFA500', '#FFD700', '#8B0000', '#000000'][
                  Math.floor(Math.random() * 5)
                ],
                transform: [
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    borderRadius: 4,
  },
});
