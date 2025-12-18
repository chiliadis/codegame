import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
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

  // Handle deep links / URL parameters for joining games
  useEffect(() => {
    if (Platform.OS === 'web') {
      const params = new URLSearchParams(window.location.search);
      const joinGameId = params.get('join');
      if (joinGameId) {
        // Auto-join game from URL
        handleAutoJoin(joinGameId);
      }
    }
  }, []);

  const handleAutoJoin = async (gameIdToJoin: string) => {
    setLoading(true);
    try {
      const game = await getGame(gameIdToJoin.toUpperCase());
      if (game) {
        // Joiners try to become spymaster (SpymasterScreen will handle claiming or redirecting)
        navigation.navigate('Spymaster', { gameId: gameIdToJoin.toUpperCase() });
      } else {
        alert('Game not found.');
      }
    } catch (error) {
      console.error('Error auto-joining game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    console.log('Create Game button pressed');
    setLoading(true);
    try {
      const newGameId = generateGameId();
      console.log('Creating game with ID:', newGameId);
      const game = createNewGame(newGameId);
      console.log('Game object created:', game);

      await createGame(game);
      console.log('Game created successfully in Firebase!');

      // Go to waiting room to show QR code
      console.log('Navigating to WaitingRoom with gameId:', newGameId);
      navigation.navigate('WaitingRoom', { gameId: newGameId });
    } catch (error: any) {
      console.error('Error creating game:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      if (Platform.OS === 'web') {
        alert(`Failed to create game: ${error?.message || 'Unknown error'}\n\nCheck the browser console for details.`);
      } else {
        Alert.alert('Error', `Failed to create game: ${error?.message || 'Unknown error'}`);
      }
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
        // Joiners try to become spymaster (SpymasterScreen will handle claiming or redirecting)
        navigation.navigate('Spymaster', { gameId: gameId.toUpperCase() });
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
          style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreateGame}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create New Game'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Join Existing Game</Text>

        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={() => navigation.navigate('QRScanner')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📷 Scan QR Code</Text>
        </TouchableOpacity>

        <View style={styles.orDivider}>
          <Text style={styles.orText}>or enter code</Text>
        </View>

        <TextInput
          style={styles.input}
          value={gameId}
          onChangeText={setGameId}
          placeholder="Enter Game ID"
          placeholderTextColor="#666"
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
  buttonDisabled: {
    opacity: 0.5,
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  scanButton: {
    backgroundColor: '#9C27B0',
    marginBottom: 15,
  },
  joinButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orDivider: {
    alignItems: 'center',
    marginBottom: 15,
  },
  orText: {
    color: '#666',
    fontSize: 14,
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
