import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Share } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import QRCode from 'react-qr-code';

type WaitingRoomScreenProps = {
  route: RouteProp<RootStackParamList, 'WaitingRoom'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;
};

export default function WaitingRoomScreen({ route, navigation }: WaitingRoomScreenProps) {
  const { gameId } = route.params;
  const gameUrl = `https://codegame-8730b.web.app?join=${gameId}`;

  const handleContinue = () => {
    // Creator is always the spymaster
    navigation.navigate('Spymaster', { gameId });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Codenames game! Game Code: ${gameId}\n${gameUrl}`,
        url: gameUrl,
        title: 'Join Codenames Game',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Created!</Text>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Game Code:</Text>
        <Text style={styles.code}>{gameId}</Text>
      </View>

      <View style={styles.qrContainer}>
        <Text style={styles.qrLabel}>Scan to Join:</Text>
        <View style={styles.qrWrapper}>
          <QRCode
            value={gameUrl}
            size={Platform.OS === 'web' ? 200 : 250}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </View>
      </View>

      <Text style={styles.instructions}>
        Share this QR code or game code with other players
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 30,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  codeLabel: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 10,
  },
  code: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrLabel: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 15,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  shareButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
