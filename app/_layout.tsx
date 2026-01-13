import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { I18nManager, View } from 'react-native';
import superjson from 'superjson';

import MiniPlayer from '../components/MiniPlayer';
import { API_URL } from '../constants/config';
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext';
import { LocationProvider } from '../contexts/LocationContext';
import { trpc } from '../utils/api';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    AlMadina: require('../assets/fonts/Othmani.ttf'),
  });

  const [queryClient] = useState(() => new QueryClient());
  // @ts-ignore - tRPC v11 typing issue with AnyRouter
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: API_URL,
          transformer: superjson,
        }),
      ],
    }),
  );

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // NOTE: trpc.Provider might be named differently in v11?
  // In v10 it's trpc.Provider.
  // In v11, createTRPCReact returns a QueryClientProvider essentially?
  // Let's assume standard v10/v11 pattern for now.

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ActionSheetProvider>
          <AudioPlayerProvider>
            <LocationProvider>
              <ThemeProvider value={DarkTheme}>
                <View style={{ flex: 1 }}>
                  <Stack>
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false, title: 'الرئيسية' }}
                    />
                    <Stack.Screen
                      name="quran"
                      options={{
                        headerShown: false,
                        title: 'القرآن الكريم',
                      }}
                    />
                    <Stack.Screen
                      name="qibla"
                      options={{
                        headerShown: false,
                        title: 'اتجاه القبلة',
                      }}
                    />
                    <Stack.Screen
                      name="prayer-times"
                      options={{
                        headerShown: false,
                        title: 'مواقيت الصلاة',
                      }}
                    />
                    <Stack.Screen
                      name="prayer-detail"
                      options={{
                        headerShown: false,
                        title: 'تفاصيل الصلاة',
                      }}
                    />
                    <Stack.Screen
                      name="player"
                      options={{
                        headerShown: false,
                        title: 'المشغل الصوتي',
                      }}
                    />
                    <Stack.Screen
                      name="reciters"
                      options={{
                        headerShown: false,
                        title: 'القراء',
                      }}
                    />
                    <Stack.Screen
                      name="bookmarks"
                      options={{
                        headerShown: false,
                        title: 'العلامات المرجعية',
                      }}
                    />
                    <Stack.Screen
                      name="font-size"
                      options={{
                        headerShown: false,
                        title: 'حجم الخط',
                      }}
                    />
                    <Stack.Screen
                      name="settings"
                      options={{
                        headerShown: false,
                        title: 'الإعدادات',
                      }}
                    />
                    <Stack.Screen
                      name="calculation-method"
                      options={{
                        headerShown: false,
                        title: 'طريقة الحساب',
                      }}
                    />
                    <Stack.Screen
                      name="location-picker"
                      options={{
                        headerShown: false,
                        title: 'تحديد الموقع',
                      }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <MiniPlayer />
                </View>
              </ThemeProvider>
            </LocationProvider>
          </AudioPlayerProvider>
        </ActionSheetProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
