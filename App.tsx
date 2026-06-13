import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChecklistProvider } from './src/context/ChecklistContext';
import { ChecklistScreen } from './src/screens/ChecklistScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RootStackParamList } from './src/types';
import { theme } from './src/constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ChecklistProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.brandBg },
              headerTintColor: theme.colors.primary,
              headerTitleStyle: { fontWeight: '700', color: theme.colors.onBrand },
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Checklist" component={ChecklistScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </ChecklistProvider>
    </SafeAreaProvider>
  );
}
