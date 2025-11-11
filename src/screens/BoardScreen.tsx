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
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <Text style={styles.gameId}>{gameId}</Text>
          <TouchableOpacity
            style={styles.changeModeButton}
            onPress={() => navigation.navigate('ModeSelect', { gameId })}
          >
            <Text style={styles.changeModeText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBar}>
          {/* Score */}
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBox, styles.redBox]}>
              <Text style={styles.scoreText}>{game.redRemaining}</Text>
              <Text style={styles.scoreLabel}>RED</Text>
            </View>
            <View style={[styles.scoreBox, styles.blueBox]}>
              <Text style={styles.scoreText}>{game.blueRemaining}</Text>
              <Text style={styles.scoreLabel}>BLUE</Text>
            </View>
          </View>

          {/* Turn or Winner */}
          {game.winner ? (
            <View style={[styles.winnerBadge, { backgroundColor: game.winner === 'red' ? '#E53935' : '#1E88E5' }]}>
              <Text style={styles.winnerText}>🏆 {game.winner.toUpperCase()} WINS!</Text>
            </View>
          ) : (
            <View style={[styles.turnBadge, { backgroundColor: game.currentTeam === 'red' ? '#E53935' : '#1E88E5' }]}>
              <Text style={styles.turnText}>{game.currentTeam.toUpperCase()}'S TURN</Text>
            </View>
          )}

          {/* Clue */}
          {game.currentClue && (
            <View style={styles.clueBox}>
              <Text style={styles.clueText}>
                "{game.currentClue.word.toUpperCase()}" - {game.currentClue.number}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Board */}
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
    backgroundColor: '#0d1117',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    backgroundColor: '#161b22',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameId: {
    fontSize: 16,
    color: '#8b949e',
    fontWeight: '600',
    letterSpacing: 4,
  },
  changeModeButton: {
    backgroundColor: '#21262d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeModeText: {
    fontSize: 18,
  },
  statusBar: {
    gap: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  scoreBox: {
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  redBox: {
    backgroundColor: '#da3633',
  },
  blueBox: {
    backgroundColor: '#1f6feb',
  },
  scoreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  turnBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  turnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  winnerBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  clueBox: {
    backgroundColor: '#21262d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#58a6ff',
    alignSelf: 'center',
  },
  clueText: {
    fontSize: 18,
    color: '#58a6ff',
    fontWeight: '600',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  card: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardUnrevealed: {
    backgroundColor: '#f0e68c',
    borderWidth: 2,
    borderColor: '#daa520',
  },
  cardRed: {
    backgroundColor: '#da3633',
  },
  cardBlue: {
    backgroundColor: '#1f6feb',
  },
  cardNeutral: {
    backgroundColor: '#8b949e',
  },
  cardAssassin: {
    backgroundColor: '#161b22',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overlayIcon: {
    textAlign: 'center',
  },
});
