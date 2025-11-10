import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { generateGameId, createNewGame } from '../utils/gameLogic';
import { createGame, getGame } from '../services/gameService';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const newGameId = generateGameId();
      console.log('Creating game with ID:', newGameId);
      const game = createNewGame(newGameId);
      await createGame(game);
      console.log('Game created successfully!');

      // Creator is always the spymaster
      navigation.navigate('Spymaster', { gameId: newGameId });
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Check Firebase configuration and console for errors.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      alert('Please enter a game ID');
      return;
    }

    setLoading(true);
    try {
      console.log('Joining game:', gameId.toUpperCase());
      const game = await getGame(gameId.toUpperCase());
      if (game) {
        // Players joining go directly to board view
        navigation.navigate('Board', { gameId: gameId.toUpperCase() });
      } else {
        alert('Game not found. Check the game ID.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Check Firebase configuration and console for errors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CODENAMES</Text>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateGame}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create New Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Join Existing Game</Text>
        <TextInput
          style={styles.input}
          value={gameId}
          onChangeText={setGameId}
          placeholder="Enter Game ID"
          autoCapitalize="characters"
          maxLength={6}
        />
        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={handleJoinGame}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Join Game</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: 4,
  },
  section: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  joinButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#444',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 10,
    fontSize: 14,
  },
});
