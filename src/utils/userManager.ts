import { Platform } from 'react-native';

const USER_ID_KEY = 'codenames_user_id';

// In-memory storage for platforms without localStorage (fallback)
let memoryStorage: { [key: string]: string } = {};

// Generate a unique user ID
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create user ID
export async function getUserId(): Promise<string> {
  try {
    let userId: string | null = null;

    // Use localStorage for web, memory for native (until AsyncStorage is added)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      userId = window.localStorage.getItem(USER_ID_KEY);

      if (!userId) {
        userId = generateUserId();
        window.localStorage.setItem(USER_ID_KEY, userId);
      }
    } else {
      // Fallback to in-memory storage for native platforms
      userId = memoryStorage[USER_ID_KEY];

      if (!userId) {
        userId = generateUserId();
        memoryStorage[USER_ID_KEY] = userId;
      }
    }

    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback to session-based ID if storage fails
    return generateUserId();
  }
}

// Clear user ID (for testing purposes)
export async function clearUserId(): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(USER_ID_KEY);
    } else {
      delete memoryStorage[USER_ID_KEY];
    }
  } catch (error) {
    console.error('Error clearing user ID:', error);
  }
}
