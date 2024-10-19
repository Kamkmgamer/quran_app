import { HelloWave } from "@/components/HelloWave";
import { useFonts } from "expo-font";
import { Button, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { router } from "expo-router";
import quran from "../assets/Quran.json";

export default function HomeScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    "othmani-1": require("../assets/fonts/Othmani.ttf"),
  });

  const surah = 5;
  const verse = 3;

  return (
    <SafeAreaView className="px-5 flex flex-col items-center">
      <Image
        style={{
          width: "75%",
          height: 75,
          tintColor: "white",
          objectFit: "contain",
        }}
        source={require("@/assets/images/Basmalah.png")}
      />
      <Text
        style={{ textAlign: "right" }}
        className="text-right text-xl mt-5 text-white font-[othmani-1]"
      >
        ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢ البقرة﴾
      </Text>

      <Text className="text-right mt-5 w-2/3">
        ان هذا التطبيق وقف لله تعالى عن هدى عبدالله الورقان وعن سعود رشيد
        المسعود
      </Text>
      <View className="mt-5 w-full flex justify-center">
        <Button
          onPress={() =>
            router.push({
              pathname: "quran",
              params: { surah: surah, verse: verse },
            })
          }
          title={`المتابعة من حيث توقفت {${quran[surah].name} آية ${
            verse + 1
          }}`}
        />
      </View>
    </SafeAreaView>
  );
}
