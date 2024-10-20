import { useLocalSearchParams, useNavigation } from "expo-router";

import quran from "../assets/Quran.json";
import { Text, Image, ScrollView, View, Button } from "react-native";
import { useEffect } from "react";

import ScrollIntoView from "react-scroll-into-view";

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
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: `سورة ${quran[surah].name}`,
      headerTitleStyle: {
        fontFamily: "othmani-1",
        fontSize: 24,
      },
    });
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
          className="text-justify px-3 text-2xl mt-5 text-white font-[othmani-1] items-end"
        >
          {quran[surah].array.map((item, index) => (
            <Text
              onLongPress={() => {
                alert("test");
              }}
              delayLongPress={250}
              key={index}
            >
              {item.ar}{" "}
              <Text style={{ fontSize: 30 }}>
                {convertToArabicNumerals(index + 1)}
              </Text>{" "}
            </Text>
          ))}
        </Text>
      </View>
    </ScrollView>
  );
}
