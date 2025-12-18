export type TeamColor = 'red' | 'blue';
export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';

export interface Card {
  word: string;
  type: CardType;
  revealed: boolean;
}

export interface Game {
  id: string;
  cards: Card[];
  currentTeam: TeamColor;
  redRemaining: number;
  blueRemaining: number;
  winner?: TeamColor;
  currentClue?: {
    word: string;
    number: number;
    team: TeamColor;
  };
  createdAt: number;
  spymasterId?: string; // Unique ID of the spymaster (first person to join as spymaster)
}

export interface GameState extends Game {
  // Additional client-side state if needed
}
