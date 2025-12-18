import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { subscribeToGame, updateGame } from '../services/gameService';
import { Game, Card } from '../types/game';
import { endTurn, revealCard, shuffleGame, resetGame } from '../utils/gameLogic';
import WinAnimation from '../components/WinAnimation';
import ExplosionAnimation from '../components/ExplosionAnimation';
import RedAgentIcon from '../components/RedAgentIcon';
import BlueAgentIcon from '../components/BlueAgentIcon';
import BombIcon from '../components/BombIcon';
import NeutralIcon from '../components/NeutralIcon';
import { playCardSound, playEndTurnSound } from '../utils/soundEffects';
import { getUserId } from '../utils/userManager';

type SpymasterScreenProps = {
  route: RouteProp<RootStackParamList, 'Spymaster'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Spymaster'>;
};

export default function SpymasterScreen({ route, navigation }: SpymasterScreenProps) {
  const { gameId } = route.params;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');

  // Check if user is the spymaster or can claim the role
  useEffect(() => {
    const checkAuthorization = async () => {
      const currentUserId = await getUserId();
      setUserId(currentUserId);
    };

    checkAuthorization();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToGame(gameId, async (gameData) => {
      if (gameData && userId) {
        setGame(gameData);

        // If no spymaster exists, claim the role
        if (!gameData.spymasterId) {
          console.log('No spymaster exists. Claiming role for user:', userId);
          try {
            await updateGame(gameId, { spymasterId: userId });
            setIsAuthorized(true);
            console.log('Successfully claimed spymaster role');
          } catch (error) {
            console.error('Error claiming spymaster role:', error);
            setIsAuthorized(false);
          }
        }
        // If spymaster exists and it's not this user, redirect to Board
        else if (gameData.spymasterId !== userId) {
          console.log('Spymaster already exists. Redirecting to Board view.');
          setIsAuthorized(false);
          setLoading(false);
          // Redirect to Board view after a short delay
          setTimeout(() => {
            navigation.replace('Board', { gameId });
          }, 2000);
        }
        // If this user is the spymaster, grant access
        else {
          setIsAuthorized(true);
        }
      }
      setLoading(false);

      // Trigger win animation when a team wins
      if (gameData?.winner && !showWinAnimation) {
        setShowWinAnimation(true);
      }
    });

    return unsubscribe;
  }, [gameId, userId]);

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

  const handleEndTurn = async () => {
    if (!game) return;
    try {
      playEndTurnSound();

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
      // Play sound effect for the card type (pass current team for xios sound)
      playCardSound(card.type, game.currentTeam);

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

  const handleShuffle = async () => {
    if (!game) return;
    try {
      const shuffledGame = shuffleGame(game);
      await updateGame(gameId, {
        cards: shuffledGame.cards,
        currentTeam: shuffledGame.currentTeam,
        redRemaining: shuffledGame.redRemaining,
        blueRemaining: shuffledGame.blueRemaining,
        winner: null,
        currentClue: null,
      });
      console.log('Game shuffled successfully');
    } catch (error) {
      console.error('Error shuffling game:', error);
    }
  };

  const handleReset = async () => {
    if (!game) return;
    try {
      const newGame = resetGame(game);
      await updateGame(gameId, {
        cards: newGame.cards,
        currentTeam: newGame.currentTeam,
        redRemaining: newGame.redRemaining,
        blueRemaining: newGame.blueRemaining,
        winner: null,
        currentClue: null,
      });
      console.log('Game reset successfully');
    } catch (error) {
      console.error('Error resetting game:', error);
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

  if (!isAuthorized && !loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Spymaster Role Taken</Text>
        <Text style={styles.errorSubtext}>
          Another player has already claimed the spymaster role.
        </Text>
        <Text style={styles.errorSubtext}>
          Redirecting to Board view...
        </Text>
      </View>
    );
  }

  const getCardColor = (card: Card) => {
    if (card.type === 'red') return '#E53935';
    if (card.type === 'blue') return '#1E88E5';
    if (card.type === 'assassin') return '#212121';
    return '#BDBDBD';
  };

  // Calculate card size to fit 5x5 grid in 16:9 aspect ratio for TV
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate available space
  const headerHeight = 280; // Approximate header height with controls
  const verticalPadding = 40; // boardContainer padding
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
  const cardWidth = (boardContainerWidth - (4 * gap)) / 5;
  const cardHeight = (boardContainerHeight - (4 * gap)) / 5;

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

        <View style={styles.gameControlsContainer}>
          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <Text style={styles.controlButtonText}>🔀 Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.controlButtonText}>🔄 Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.boardContainer}>
        <View style={[styles.board, { width: boardContainerWidth }]}>
          {game.cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                  backgroundColor: getCardColor(card),
                },
              ]}
              onPress={() => handleCardPress(index)}
              disabled={card.revealed || !!game.winner}
              activeOpacity={0.7}
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
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
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
  gameControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15,
  },
  shuffleButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
