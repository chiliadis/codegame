import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Game } from '../types/game';

const GAMES_COLLECTION = 'games';

export async function createGame(game: Game): Promise<void> {
  await setDoc(doc(db, GAMES_COLLECTION, game.id), game);
}

export async function getGame(gameId: string): Promise<Game | null> {
  const docRef = doc(db, GAMES_COLLECTION, gameId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Game;
  }

  return null;
}

export async function updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
  const docRef = doc(db, GAMES_COLLECTION, gameId);
  console.log('Updating game:', gameId, updates);
  try {
    await updateDoc(docRef, updates as any);
    console.log('Game updated successfully');
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
}

export function subscribeToGame(gameId: string, callback: (game: Game | null) => void): () => void {
  const docRef = doc(db, GAMES_COLLECTION, gameId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Game);
    } else {
      callback(null);
    }
  });
}
