import { Card, CardType, Game, TeamColor } from '../types/game';
import { getRandomWords } from './words';

export function generateGameId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function createNewGame(gameId: string): Game {
  const words = getRandomWords(25);

  // Determine starting team (random)
  const startingTeam: TeamColor = Math.random() > 0.5 ? 'red' : 'blue';

  // Create card types array: 9 for starting team, 8 for other team, 7 neutral, 1 assassin
  const cardTypes: CardType[] = [
    ...Array(startingTeam === 'red' ? 9 : 8).fill('red'),
    ...Array(startingTeam === 'blue' ? 9 : 8).fill('blue'),
    ...Array(7).fill('neutral'),
    'assassin',
  ];

  // Shuffle card types
  const shuffledTypes = cardTypes.sort(() => Math.random() - 0.5);

  // Create cards
  const cards: Card[] = words.map((word, index) => ({
    word,
    type: shuffledTypes[index],
    revealed: false,
  }));

  return {
    id: gameId,
    cards,
    currentTeam: startingTeam,
    redRemaining: startingTeam === 'red' ? 9 : 8,
    blueRemaining: startingTeam === 'blue' ? 9 : 8,
    createdAt: Date.now(),
    // spymasterId is initially undefined - first joiner becomes spymaster
  };
}

export function revealCard(game: Game, cardIndex: number): Game {
  if (cardIndex < 0 || cardIndex >= game.cards.length) {
    return game;
  }

  const card = game.cards[cardIndex];

  if (card.revealed) {
    return game;
  }

  const updatedCards = [...game.cards];
  updatedCards[cardIndex] = { ...card, revealed: true };

  let redRemaining = game.redRemaining;
  let blueRemaining = game.blueRemaining;
  let winner = game.winner;
  let currentTeam = game.currentTeam;

  // Update remaining counts
  if (card.type === 'red') {
    redRemaining--;
  } else if (card.type === 'blue') {
    blueRemaining--;
  }

  // Check for win conditions
  if (card.type === 'assassin') {
    // Team that clicked assassin loses
    winner = currentTeam === 'red' ? 'blue' : 'red';
  } else if (redRemaining === 0) {
    winner = 'red';
  } else if (blueRemaining === 0) {
    winner = 'blue';
  } else {
    // Switch teams if wrong card was clicked or neutral
    if (card.type !== currentTeam) {
      currentTeam = currentTeam === 'red' ? 'blue' : 'red';
    }
  }

  return {
    ...game,
    cards: updatedCards,
    redRemaining,
    blueRemaining,
    currentTeam,
    winner,
  };
}

export function setClue(game: Game, word: string, number: number): Game {
  return {
    ...game,
    currentClue: {
      word,
      number,
      team: game.currentTeam,
    },
  };
}

export function endTurn(game: Game): Game {
  return {
    ...game,
    currentTeam: game.currentTeam === 'red' ? 'blue' : 'red',
    currentClue: undefined,
  };
}

export function shuffleGame(game: Game): Game {
  // Keep the same words but reassign card types
  const words = game.cards.map(card => card.word);

  // Determine starting team (random)
  const startingTeam: TeamColor = Math.random() > 0.5 ? 'red' : 'blue';

  // Create card types array: 9 for starting team, 8 for other team, 7 neutral, 1 assassin
  const cardTypes: CardType[] = [
    ...Array(startingTeam === 'red' ? 9 : 8).fill('red'),
    ...Array(startingTeam === 'blue' ? 9 : 8).fill('blue'),
    ...Array(7).fill('neutral'),
    'assassin',
  ];

  // Shuffle card types
  const shuffledTypes = cardTypes.sort(() => Math.random() - 0.5);

  // Create new cards with same words but new assignments
  const cards: Card[] = words.map((word, index) => ({
    word,
    type: shuffledTypes[index],
    revealed: false,
  }));

  return {
    ...game,
    cards,
    currentTeam: startingTeam,
    redRemaining: startingTeam === 'red' ? 9 : 8,
    blueRemaining: startingTeam === 'blue' ? 9 : 8,
    winner: undefined,
    currentClue: undefined,
  };
}

export function resetGame(game: Game): Game {
  // Create completely new game with new words and clear spymaster
  return createNewGame(game.id);
}
