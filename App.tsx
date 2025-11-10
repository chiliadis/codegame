import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import ModeSelectScreen from './src/screens/ModeSelectScreen';
import SpymasterScreen from './src/screens/SpymasterScreen';
import BoardScreen from './src/screens/BoardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ModeSelect"
          component={ModeSelectScreen}
          options={{ title: 'Select Mode' }}
        />
        <Stack.Screen
          name="Spymaster"
          component={SpymasterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Board"
          component={BoardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
