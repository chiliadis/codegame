import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeToGame, updateGame } from '../services/gameService';
import { Game, Card } from '../types/game';
import { revealCard } from '../utils/gameLogic';
import WinAnimation from '../components/WinAnimation';
import ExplosionAnimation from '../components/ExplosionAnimation';
import RedAgentIcon from '../components/RedAgentIcon';
import BlueAgentIcon from '../components/BlueAgentIcon';
import BombIcon from '../components/BombIcon';
import NeutralIcon from '../components/NeutralIcon';

type BoardScreenProps = {
  route: RouteProp<RootStackParamList, 'Board'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Board'>;
};

export default function BoardScreen({ route, navigation }: BoardScreenProps) {
  const { gameId } = route.params;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes in seconds

  useEffect(() => {
    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      setGame(gameData);
      setLoading(false);

      // Trigger win animation when a team wins
      if (gameData?.winner && !showWinAnimation) {
        setShowWinAnimation(true);
      }
    });

    return unsubscribe;
  }, [gameId]);

  // Reset timer when turn changes
  useEffect(() => {
    if (game && !game.winner) {
      setTimeRemaining(240); // Reset to 4 minutes
    }
  }, [game?.currentTeam, game?.winner]);

  // Countdown timer
  useEffect(() => {
    if (game?.winner) {
      return; // Stop timer if game is over
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.winner]);

  useEffect(() => {
    // Check if assassin was just revealed
    if (game?.cards) {
      const assassinRevealed = game.cards.find(
        card => card.type === 'assassin' && card.revealed
      );
      if (assassinRevealed && !showExplosion) {
        setShowExplosion(true);
        // Clear explosion after animation completes (1 second)
        setTimeout(() => setShowExplosion(false), 1200);
      }
    }
  }, [game?.cards]);

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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine timer color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining <= 30) return '#da3633'; // Red when 30 seconds or less
    if (timeRemaining <= 60) return '#fb8500'; // Orange when 1 minute or less
    return '#58a6ff'; // Blue otherwise
  };

  // Calculate card size to fit 5x5 grid in 16:9 aspect ratio for TV
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate available space
  const headerHeight = 175; // Approximate header height
  const verticalPadding = 16; // boardContainer padding
  const horizontalPadding = 40; // Container horizontal padding
  const gap = 8; // Gap between cards

  // Calculate 16:9 viewport dimensions
  const availableHeight = screenHeight - headerHeight - verticalPadding;
  const availableWidth = screenWidth - horizontalPadding;

  // Calculate board container size maintaining 16:9 aspect ratio
  let boardContainerWidth: number;
  let boardContainerHeight: number;

  // Fit 16:9 container into available space
  const targetAspectRatio = 16 / 9;
  const availableAspectRatio = availableWidth / availableHeight;

  if (availableAspectRatio > targetAspectRatio) {
    // Limited by height
    boardContainerHeight = availableHeight;
    boardContainerWidth = boardContainerHeight * targetAspectRatio;
  } else {
    // Limited by width
    boardContainerWidth = availableWidth;
    boardContainerHeight = boardContainerWidth / targetAspectRatio;
  }

  // Calculate card dimensions to fit 5x5 grid within the 16:9 container
  // Use slightly more width to make cards wider (better for reading Greek text)
  const cardWidth = (boardContainerWidth - (4 * gap)) / 5;
  const cardHeight = (boardContainerHeight - (4 * gap)) / 5;

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
          {/* Score and Timer */}
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBox, styles.redBox]}>
              <Text style={styles.scoreText}>{game.redRemaining}</Text>
              <Text style={styles.scoreLabel}>RED</Text>
            </View>

            {/* Timer */}
            {!game.winner && (
              <View style={[styles.timerBox, { borderColor: getTimerColor() }]}>
                <Text style={[styles.timerText, { color: getTimerColor() }]}>
                  ⏱️ {formatTime(timeRemaining)}
                </Text>
              </View>
            )}

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
        <View style={[styles.board, { width: cardWidth * 5 + gap * 4 }]}>
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
              <Text
                style={[styles.cardWord, { fontSize: Math.min(cardHeight * 0.2, cardWidth * 0.12, 24) }]}
                numberOfLines={3}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {card.word}
              </Text>

              {card.revealed && (
                <View style={styles.overlay}>
                  {card.type === 'red' && <RedAgentIcon size={Math.min(cardHeight * 0.9, cardWidth * 0.7)} />}
                  {card.type === 'blue' && <BlueAgentIcon size={Math.min(cardHeight * 0.9, cardWidth * 0.7)} />}
                  {card.type === 'assassin' && <BombIcon size={Math.min(cardHeight * 0.9, cardWidth * 0.7)} />}
                  {card.type === 'neutral' && <NeutralIcon size={Math.min(cardHeight * 0.9, cardWidth * 0.7)} />}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Animations */}
      {showWinAnimation && game.winner && (
        <WinAnimation teamColor={game.winner} />
      )}
      {showExplosion && <ExplosionAnimation />}
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
  timerBox: {
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  card: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
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
    width: '100%',
    flexShrink: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  overlayIcon: {
    textAlign: 'center',
  },
});
