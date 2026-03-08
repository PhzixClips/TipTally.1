import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { DataProvider } from '../context/DataContext';
import { PremiumProvider } from '../context/PremiumContext';
import { C } from '../lib/constants';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <PremiumProvider>
      <DataProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: C.bg },
            headerTintColor: C.text,
            headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 16 },
            contentStyle: { backgroundColor: C.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="shift/[id]" options={{ title: 'Edit Shift', presentation: 'modal' }} />
          <Stack.Screen name="schedule/add" options={{ title: 'Add Shift', presentation: 'modal' }} />
          <Stack.Screen name="schedule/scan" options={{ title: 'Scan Schedule', presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ title: 'Premium', presentation: 'modal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="expenses" options={{ title: 'Expenses', presentation: 'modal' }} />
        </Stack>
      </DataProvider>
    </PremiumProvider>
  );
}
