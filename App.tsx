import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChecklistProvider } from './src/context/ChecklistContext';
import { ChecklistScreen } from './src/screens/ChecklistScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ThemeProvider, useTheme, useThemeMode } from './src/theme/ThemeContext';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const theme = useTheme();
  const { scheme } = useThemeMode();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      card: theme.colors.brandBg,
      text: theme.colors.onBrand,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
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
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ChecklistProvider>
          <RootNavigator />
          {/* Header chrome is always near-black, so the status bar stays light. */}
          <StatusBar style="light" />
        </ChecklistProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
