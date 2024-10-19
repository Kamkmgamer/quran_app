import { useLocalSearchParams, useNavigation } from "expo-router";

import quran from "../assets/Quran.json";
import { Text, Image, ScrollView, View } from "react-native";
import { useEffect } from "react";

const convertToArabicNumerals = (number: number) => {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Number(digit)])
    .join("");
};

export default function Quran() {
  const { surah, verse } = useLocalSearchParams();

  const fullSurah = quran[surah].array.map(
    (item, index) => `${item.ar} ${convertToArabicNumerals(index + 1)} `
  );
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: `سورة ${quran[surah].name}`,
      headerTitleStyle: {
        fontFamily: "othmani-1", // Use the custom font
        fontSize: 24, // Adjust font size as needed
      },
    }); // Dynamically change the title
  }, [navigation]);
  return (
    <ScrollView>
      <View className="items-center">
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
          style={{ lineHeight: 48, justifyContent: "center", display: "flex" }}
          selectable={true}
          className="text-justify px-3 text-2xl mt-5 text-white font-[othmani-1] items-end"
        >
          {fullSurah.join("")}
        </Text>
      </View>
    </ScrollView>
  );
}
