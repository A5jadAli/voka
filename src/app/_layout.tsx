import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OptionalUpdateBanner } from '@/components/optional-update-banner';
import {
  CloudSyncProvider,
  LearningScopeScreen,
  useLearningScopeReady,
} from '@/components/cloud-sync-provider';
import { useLanguageSelection } from '@/features/language/selection';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    DMMono_400Regular,
    DMMono_500Medium,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // The native splash stays up until fonts, saved progress and language are ready (see
  // SplashGate), so launch goes straight from splash to a finished screen with no blank flash.
  useEffect(() => {
    const fallback = setTimeout(() => void SplashScreen.hideAsync(), 6000);
    return () => clearTimeout(fallback);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CloudSyncProvider>
          <StatusBar style="dark" />
          <SplashGate />
          <Stack
            screenOptions={{ animation: 'ios_from_right', headerShown: false }}
            screenLayout={({ children, route }) =>
              // Auth must finish sign-in/recovery across session changes. Learning screens reset.
              route.name === 'auth' ? (
                <>{children}</>
              ) : (
                <LearningScopeScreen>{children}</LearningScopeScreen>
              )
            }
          >
            {tabRoutes.map((name) => (
              <Stack.Screen key={name} name={name} options={{ animation: 'fade' }} />
            ))}
            {flowRoutes.map((name) => (
              <Stack.Screen
                key={name}
                name={name}
                options={{ animation: 'slide_from_bottom', gestureDirection: 'vertical' }}
              />
            ))}
          </Stack>
          <OptionalUpdateBanner />
        </CloudSyncProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Primary destinations switch with a quick cross-fade; focused flows rise like a sheet.
const tabRoutes = ['index', 'sprint', 'progress', 'profile', 'conversation'];
const flowRoutes = [
  'foundation/[id]',
  'review',
  'placement',
  'speaking-mock',
  'activity/[kind]',
  'lesson/[id]',
  'level-check',
];

function SplashGate() {
  const ready = useLearningScopeReady();
  const languageReady = useLanguageSelection((state) => state.hydrated);
  useEffect(() => {
    if (ready && languageReady) void SplashScreen.hideAsync();
  }, [languageReady, ready]);
  return null;
}
