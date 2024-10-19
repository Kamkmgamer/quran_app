import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { I18nManager } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    I18nManager.forceRTL(true);
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  // value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "الرئيسية" }}
        />
        <Stack.Screen name="quran" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
