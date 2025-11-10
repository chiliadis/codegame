import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { CameraView, Camera } from 'expo-camera';

type QRScannerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QRScanner'>;
};

export default function QRScannerScreen({ navigation }: QRScannerScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);

    // Extract game ID from URL or use directly
    let gameId = data;
    if (data.includes('?join=')) {
      gameId = data.split('?join=')[1];
    }

    navigation.navigate('ModeSelect', { gameId });
  };

  const handleManualJoin = () => {
    if (manualCode.trim().length > 0) {
      navigation.navigate('ModeSelect', { gameId: manualCode.trim().toUpperCase() });
    } else {
      Alert.alert('Error', 'Please enter a game code');
    }
  };

  if (Platform.OS === 'web' || showManualEntry) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Join Game</Text>

        <Text style={styles.instructions}>
          Enter the game code shared by the host
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Game Code"
          placeholderTextColor="#666"
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
        />

        <TouchableOpacity style={styles.joinButton} onPress={handleManualJoin}>
          <Text style={styles.joinButtonText}>Join Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setShowManualEntry(true)}
        >
          <Text style={styles.manualButtonText}>Enter Code Manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>Scan QR Code</Text>
        </View>
      </CameraView>

      <View style={styles.bottomContainer}>
        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setShowManualEntry(true)}
        >
          <Text style={styles.manualButtonText}>Enter Code Manually</Text>
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
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  scanText: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  bottomContainer: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 20,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  message: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  manualButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rescanButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
