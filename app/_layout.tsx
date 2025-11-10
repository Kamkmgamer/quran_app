import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { I18nManager, View } from 'react-native';

import MiniPlayer from '../components/MiniPlayer';
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext';
import { LocationProvider } from '../contexts/LocationContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    I18nManager.forceRTL(true);
  }, []);

  return (
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
                <Stack.Screen name="+not-found" />
              </Stack>
              <MiniPlayer />
            </View>
          </ThemeProvider>
        </LocationProvider>
      </AudioPlayerProvider>
    </ActionSheetProvider>
  );
}
