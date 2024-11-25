import { HelloWave } from "@/components/HelloWave";
import { useFonts } from "expo-font";
import { Button, Text, View, Image, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { router } from "expo-router";
import quran from "../assets/Quran.json";

export default function HomeScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    "othmani-1": require("../assets/fonts/Othmani.ttf"),
  });

  const surahList = [];

  quran.forEach((surah) => {
    surahList.push(surah);
  });

  const [surah, setSurah] = React.useState(0);
  const [verse, setVerse] = React.useState(0);
  const [surahSearchList, setSurahSearchList] = React.useState(surahList);

  const loadSavedVerse = async () => {
    try {
      const existingData = await AsyncStorage.getItem("savedVerses");
      let savedVerse = existingData
        ? JSON.parse(existingData)
        : { surah: 0, verse: 0 };
      setSurah(savedVerse.surah);
      setVerse(savedVerse.verse);
    } catch (error) {
      console.error("Error loading saved verse:", error);
    }
  };

  // Use useFocusEffect to reload saved verse when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSavedVerse();
    }, [])
  );

  const handleSearch = (text: string) => {
    // setSearchText(text);

    // Filter data based on search text
    const results = surahList.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );

    setSurahSearchList(results);
  };

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
        ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ ﴿٢ البقرة﴾
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
      <View className="w-full">
        <Text className="text-right text-xl mt-5 text-white font-[othmani-1]">
          ابحث عن السورة :
        </Text>
        <TextInput
          className="text-right text-xl mt-5 text-white font-[othmani-1] border  border-gray-400 rounded-md p-2 placeholder-white"
          placeholder="🔍"
          onChangeText={(newText) => handleSearch(newText)}
        />
        <FlatList
          className="h-[50%] mt-2"
          data={surahSearchList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="text-right text-xl p-2 m-1 bg-gray-600 rounded-md  text-white font-[othmani-1]">
              <Text
                onPress={() =>
                  router.push({
                    pathname: "quran",
                    params: { surah: item.id - 1, verse: 0 },
                  })
                }
                className="text-right !text-white font-[othmani-1] text-xl"
              >
                {item.name}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
