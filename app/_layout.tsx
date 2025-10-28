import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { I18nManager } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    I18nManager.forceRTL(true);
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "الرئيسية" }}
        />
        <Stack.Screen 
          name="quran"
          options={{
            headerShown: true,
            title: "القرآن الكريم",
            headerStyle: {
              backgroundColor: "#065F46",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen 
          name="qibla"
          options={{
            headerShown: false,
            title: "اتجاه القبلة",
          }}
        />
        <Stack.Screen 
          name="prayer-times"
          options={{
            headerShown: true,
            title: "مواقيت الصلاة",
            headerStyle: {
              backgroundColor: "#065F46",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
