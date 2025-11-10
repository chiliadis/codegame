import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeToGame, updateGame } from '../services/gameService';
import { Game, Card } from '../types/game';
import { revealCard } from '../utils/gameLogic';
import SpyIcon from '../components/SpyIcon';

type BoardScreenProps = {
  route: RouteProp<RootStackParamList, 'Board'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Board'>;
};

export default function BoardScreen({ route, navigation }: BoardScreenProps) {
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

  // Board view is display-only - no card clicking allowed
  // All game actions are controlled by spymaster

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

  const getCardStyle = (card: Card) => {
    if (!card.revealed) {
      return styles.cardUnrevealed;
    }

    switch (card.type) {
      case 'red':
        return styles.cardRed;
      case 'blue':
        return styles.cardBlue;
      case 'assassin':
        return styles.cardAssassin;
      default:
        return styles.cardNeutral;
    }
  };

  // Calculate card size to fit 5 cards wide with rectangular shape for 16:9 screens
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const availableWidth = Math.min(screenWidth - 40, 1200); // Max width for large screens
  const cardWidth = (availableWidth - 48) / 5; // 5 cards with gaps (8px gaps between)
  const cardHeight = cardWidth * 0.65; // Make rectangular (wider than tall) for 16:9

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
            <Text style={styles.turnLabel}>Current Turn:</Text>
            <View
              style={[
                styles.turnIndicator,
                { backgroundColor: game.currentTeam === 'red' ? '#E53935' : '#1E88E5' },
              ]}
            >
              <Text style={styles.turnText}>{game.currentTeam.toUpperCase()}</Text>
            </View>
          </View>
        )}

        {game.currentClue && (
          <View style={styles.clueContainer}>
            <Text style={styles.clueLabel}>Current Clue:</Text>
            <Text style={styles.clueText}>
              {game.currentClue.word.toUpperCase()} - {game.currentClue.number}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.boardContainer}>
        <View style={[styles.board, { width: availableWidth }]}>
          {game.cards.map((card, index) => (
            <View
              key={index}
              style={[
                styles.card,
                getCardStyle(card),
                {
                  width: cardWidth,
                  height: cardHeight,
                },
              ]}
            >
              <Text style={[styles.cardWord, { fontSize: cardHeight * 0.22 }]}>{card.word}</Text>

              {card.revealed && (
                <View style={styles.overlay}>
                  <SpyIcon type={card.type} size={cardHeight * 0.85} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
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
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 15,
  },
  scoreBox: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  turnContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  turnLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  turnIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  turnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  winnerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  clueContainer: {
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  clueLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 5,
  },
  clueText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    borderColor: '#333',
  },
  cardUnrevealed: {
    backgroundColor: '#F5DEB3',
  },
  cardRed: {
    backgroundColor: '#E53935',
  },
  cardBlue: {
    backgroundColor: '#1E88E5',
  },
  cardNeutral: {
    backgroundColor: '#BDBDBD',
  },
  cardAssassin: {
    backgroundColor: '#212121',
  },
  cardWord: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  overlayIcon: {
    textAlign: 'center',
  },
});
