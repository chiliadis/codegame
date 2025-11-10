import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeToGame, updateGame } from '../services/gameService';
import { Game, Card } from '../types/game';
import { endTurn, revealCard } from '../utils/gameLogic';

type SpymasterScreenProps = {
  route: RouteProp<RootStackParamList, 'Spymaster'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Spymaster'>;
};

export default function SpymasterScreen({ route, navigation }: SpymasterScreenProps) {
  const { gameId } = route.params;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      setGame(gameData);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId]);

  const handleEndTurn = async () => {
    if (!game) return;
    try {
      const updatedGame = endTurn(game);
      const updates: any = {
        currentTeam: updatedGame.currentTeam,
      };

      // Only include currentClue if it exists, otherwise explicitly set to null
      if (updatedGame.currentClue) {
        updates.currentClue = updatedGame.currentClue;
      } else {
        updates.currentClue = null;
      }

      await updateGame(gameId, updates);
      console.log('Turn ended successfully');
    } catch (error) {
      console.error('Error ending turn:', error);
    }
  };

  const handleCardPress = async (index: number) => {
    if (!game || game.winner) return;

    const card = game.cards[index];
    if (card.revealed) return;

    try {
      console.log('Revealing card:', index, card.word, card.type);
      const updatedGame = revealCard(game, index);
      console.log('Updated game state:', {
        redRemaining: updatedGame.redRemaining,
        blueRemaining: updatedGame.blueRemaining,
        currentTeam: updatedGame.currentTeam,
        winner: updatedGame.winner,
      });

      const updates: any = {
        cards: updatedGame.cards,
        redRemaining: updatedGame.redRemaining,
        blueRemaining: updatedGame.blueRemaining,
        currentTeam: updatedGame.currentTeam,
      };

      // Only include winner if it exists
      if (updatedGame.winner) {
        updates.winner = updatedGame.winner;
      }

      await updateGame(gameId, updates);
      console.log('Card revealed successfully');
    } catch (error) {
      console.error('Error revealing card:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  const getCardColor = (card: Card) => {
    if (card.type === 'red') return '#E53935';
    if (card.type === 'blue') return '#1E88E5';
    if (card.type === 'assassin') return '#212121';
    return '#BDBDBD';
  };

  // Calculate card size to fit 5 cards with proper spacing
  const screenWidth = Dimensions.get('window').width;
  const availableWidth = Math.min(screenWidth - 40, 1200); // Max width for large screens
  const cardSize = (availableWidth - 40) / 5; // 5 cards with gaps

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.changeModeButton}
          onPress={() => navigation.navigate('ModeSelect', { gameId })}
        >
          <Text style={styles.changeModeText}>Change Mode</Text>
        </TouchableOpacity>

        <Text style={styles.gameId}>Game: {gameId}</Text>
        <Text style={styles.title}>SPYMASTER VIEW</Text>

        <View style={styles.scoreContainer}>
          <View style={[styles.scoreBox, { backgroundColor: '#E53935' }]}>
            <Text style={styles.scoreText}>Red: {game.redRemaining}</Text>
          </View>
          <View style={[styles.scoreBox, { backgroundColor: '#1E88E5' }]}>
            <Text style={styles.scoreText}>Blue: {game.blueRemaining}</Text>
          </View>
        </View>

        {game.winner ? (
          <Text style={styles.winnerText}>
            {game.winner.toUpperCase()} TEAM WINS!
          </Text>
        ) : (
          <View style={styles.turnContainer}>
            <Text style={styles.turnText}>
              Current Turn:{' '}
              <Text style={{ color: game.currentTeam === 'red' ? '#E53935' : '#1E88E5' }}>
                {game.currentTeam.toUpperCase()}
              </Text>
            </Text>
            <TouchableOpacity style={styles.endTurnButton} onPress={handleEndTurn}>
              <Text style={styles.endTurnText}>End Turn</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.boardContainer}>
        <View style={[styles.board, { width: availableWidth }]}>
          {game.cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                {
                  width: cardSize,
                  height: cardSize,
                  backgroundColor: getCardColor(card),
                },
              ]}
              onPress={() => handleCardPress(index)}
              disabled={card.revealed || !!game.winner}
              activeOpacity={0.7}
            >
              <Text style={[styles.cardWord, { fontSize: cardSize * 0.15 }]}>{card.word}</Text>

              {card.revealed && (
                <View style={styles.overlay}>
                  <Text style={[styles.overlayIcon, { fontSize: cardSize * 0.5 }]}>
                    {card.type === 'red' ? '🔴' :
                     card.type === 'blue' ? '🔵' :
                     card.type === 'assassin' ? '💣' :
                     '⚪'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  changeModeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  changeModeText: {
    color: '#fff',
    fontSize: 14,
  },
  gameId: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'center',
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  scoreBox: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  turnContainer: {
    alignItems: 'center',
  },
  turnText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  endTurnButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  endTurnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  boardContainer: {
    padding: 20,
    alignItems: 'center',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  card: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderWidth: 3,
    borderColor: '#000',
  },
  cardWord: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  overlayIcon: {
    textAlign: 'center',
  },
  revealedText: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: '#fff',
    fontSize: 16,
  },
});
