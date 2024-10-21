import { useLocalSearchParams, useNavigation } from "expo-router";
import quran from "../assets/Quran.json";
import {
  Text,
  Image,
  ScrollView,
  View,
  StyleSheet,
  ActionSheetIOS,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";

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
  const [renderCount, setRenderCount] = useState(50); // Limit initially rendered items
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const pressTimeoutRef = useRef(null);
  useEffect(() => {
    navigation.setOptions({
      title: `سورة ${quran[surah].name}`,
      headerTitleStyle: {
        fontFamily: "othmani-1",
        fontSize: 24,
      },
    });
  }, [navigation]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollHeight = event.nativeEvent.contentSize.height;
    const windowHeight = event.nativeEvent.layoutMeasurement.height;

    if (scrollPosition + windowHeight > scrollHeight - 100) {
      setRenderCount((prevCount) => prevCount + 20); // Load 20 more verses
    }
  };

  const showActionSheet = (verse: number) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "حفظ الآية 🔖", "نسخ الآية 📋"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          console.log(`${surah}`, `${verse}`);
        } else if (buttonIndex === 2) {
          Clipboard.setString(quran[surah].array[verse].ar);
        }
      }
    );
  };

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
    >
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
          {quran[surah].array.slice(0, renderCount).map((item, index) => (
            <Text
              onPressIn={() => {
                pressTimeoutRef.current = setTimeout(() => {
                  setHighlightedIndex(index);
                }, 150);
              }}
              onPressOut={() => {
                clearTimeout(pressTimeoutRef.current);
                setHighlightedIndex(null);
              }}
              onLongPress={() => {
                showActionSheet(index);
              }}
              delayLongPress={250}
              key={index}
              style={[
                highlightedIndex === index && styles.highlighted,
                {
                  borderRadius: 100,
                },
              ]}
              onLayout={(e) => {
                console.log(item.ar);
              }}
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

const styles = StyleSheet.create({
  highlighted: {
    backgroundColor: "gray",
    borderRadius: 100,
  },
});
