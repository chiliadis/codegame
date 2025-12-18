import { Platform } from 'react-native';
import { CardType, TeamColor } from '../types/game';
import { Asset } from 'expo-asset';

// Load xios sound asset
const xiosSound = Asset.fromModule(require('../../assets/sounds/xios.mp3'));

// Greek TV inspired sound effects using Web Audio API for instant playback
// These create funny beeps and tones reminiscent of Greek TV game shows
export async function playCardSound(cardType: CardType, currentTeam?: TeamColor) {
  if (Platform.OS === 'web') {
    await playWebSound(cardType, currentTeam);
  }
  // For native platforms, you would load MP3/WAV files here
}

async function playWebSound(cardType: CardType, currentTeam?: TeamColor) {
  try {
    console.log('Playing sound for card type:', cardType, 'current team:', currentTeam);

    // Check if it's a wrong answer (opponent's card)
    const isWrongAnswer = currentTeam &&
      ((cardType === 'red' && currentTeam === 'blue') ||
       (cardType === 'blue' && currentTeam === 'red'));

    if (isWrongAnswer) {
      // Play xios.mp3 for wrong answers
      console.log('Wrong answer! Playing xios.mp3');
      await xiosSound.downloadAsync();
      const audio = new Audio(xiosSound.uri);
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Error playing xios.mp3:', err));
      return;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('AudioContext state:', audioContext.state);

    // Resume audio context (required by browser autoplay policies)
    if (audioContext.state === 'suspended') {
      console.log('Resuming audio context...');
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different funny sounds for each card type
    switch (cardType) {
      case 'red':
        // Ascending "Success" tone (like Greek game show victory)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;

      case 'blue':
        // Descending "Success" tone (mirror of red)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;

      case 'neutral':
        // Play xios.mp3 for neutral cards too (wrong answer)
        console.log('Neutral card! Playing xios.mp3');
        await xiosSound.downloadAsync();
        const neutralAudio = new Audio(xiosSound.uri);
        neutralAudio.volume = 0.5;
        neutralAudio.play().catch(err => console.log('Error playing xios.mp3:', err));
        break;

      case 'assassin':
        // Dramatic "Game Over" sound (descending dramatic tone)
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);

        // Add a second dramatic note
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(500, audioContext.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);
          gain2.gain.setValueAtTime(0.4, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
        break;
    }
  } catch (error) {
    console.log('Sound playback not supported:', error);
  }
}

// Play end turn sound
export function playEndTurnSound() {
  if (Platform.OS === 'web') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume audio context (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Quick "next turn" chime
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Sound playback not supported:', error);
    }
  }
}
