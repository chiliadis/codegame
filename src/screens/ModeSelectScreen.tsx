import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type ModeSelectScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ModeSelect'>;
  route: RouteProp<RootStackParamList, 'ModeSelect'>;
};

export default function ModeSelectScreen({ navigation, route }: ModeSelectScreenProps) {
  const { gameId } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.gameId}>Game: {gameId}</Text>
      <Text style={styles.title}>Select Mode</Text>

      <TouchableOpacity
        style={[styles.button, styles.spymasterButton]}
        onPress={() => navigation.navigate('Spymaster', { gameId })}
      >
        <Text style={styles.buttonText}>SPYMASTER</Text>
        <Text style={styles.buttonSubtext}>View the key card & give clues</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.boardButton]}
        onPress={() => navigation.navigate('Board', { gameId })}
      >
        <Text style={styles.buttonText}>BOARD VIEW</Text>
        <Text style={styles.buttonSubtext}>For players & display</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
  gameId: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    fontSize: 20,
    color: '#888',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 15,
  },
  spymasterButton: {
    backgroundColor: '#9C27B0',
  },
  boardButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
});
