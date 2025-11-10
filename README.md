# Codenames Game

A mobile/web app implementation of the popular Codenames board game, built with Expo and Firebase.

## Features

- **Spymaster Mode**: Mobile view showing the key card with color-coded words
- **Board Mode**: Player/TV display with real-time card reveals
- **Real-time Sync**: All players see updates instantly via Firebase
- **Game Management**: Create and join games with simple room codes

## Setup

### 1. Install Dependencies

```bash
cd codenames-app
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Add a Web app to your project
4. Copy the Firebase configuration
5. Update `src/services/firebase.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. In Firebase Console, enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose a location

### 3. Run the App

**Web (for TV/Board display):**
```bash
npm run web
```

**iOS (requires Mac):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Or use Expo Go app:**
```bash
npx expo start
```
Then scan the QR code with Expo Go app on your phone.

## How to Play

1. **Create a game** on any device - you'll get a 6-character game code
2. **Spymasters** join via mobile using the game code and select "Spymaster" mode
   - They see the key card showing which words belong to which team
   - Can end turns manually
3. **Players** join using the game code and select "Board View"
   - Display this on a TV or share screen
   - Players tap cards to reveal them
   - Real-time updates for everyone

## Project Structure

```
codenames-app/
├── src/
│   ├── screens/          # App screens
│   │   ├── HomeScreen.tsx       # Create/Join game
│   │   ├── ModeSelectScreen.tsx # Choose mode
│   │   ├── SpymasterScreen.tsx  # Spymaster view
│   │   └── BoardScreen.tsx      # Board/player view
│   ├── services/         # Firebase integration
│   ├── types/            # TypeScript types
│   ├── utils/            # Game logic & word bank
│   └── navigation/       # Navigation types
└── App.tsx               # Main app component
```

## Game Rules

- 25 words on a 5×5 grid
- One team has 9 agents, the other has 8
- 7 neutral bystanders
- 1 assassin (instant loss if revealed)
- Teams alternate giving one-word clues + number
- First team to find all their agents wins

## Technologies

- **Expo** - React Native framework
- **React Navigation** - Navigation
- **Firebase Firestore** - Real-time database
- **TypeScript** - Type safety

## Notes

- Firebase test mode rules expire after 30 days - update security rules for production
- For production, implement proper authentication
- Current word bank has 400+ words - can be expanded in `src/utils/words.ts`
