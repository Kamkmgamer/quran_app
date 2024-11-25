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
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [renderCount, setRenderCount] = useState(50 + verse); // Limit initially rendered items
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const pressTimeoutRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [verseCords, setVerseCords] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current.scrollTo({
        x: 0,
        y: verseCords[35 + 5],
        animated: true,
      });
    }, 500);
    navigation.setOptions({
      title: `سورة ${quran[surah].name}`,
      headerTitleStyle: {
        fontFamily: "othmani-1",
        fontSize: 24,
      },
    });
  }, [navigation]);

  // Save verse and surah to AsyncStorage
  const saveVerseToStorage = async (surah: number, verse: number) => {
    try {
      await AsyncStorage.setItem(
        "savedVerses",
        JSON.stringify({ surah, verse })
      );
      const value = await AsyncStorage.getItem("savedVerses");
    } catch (error) {
      console.error("Error saving verse:", error);
    }
  };

  // Function to handle scrolling and load more verses
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollHeight = event.nativeEvent.contentSize.height;
    const windowHeight = event.nativeEvent.layoutMeasurement.height;

    if (scrollPosition + windowHeight > scrollHeight - 100) {
      setRenderCount((prevCount) => prevCount + 20); // Load 20 more verses
    }
  };

  // Show action sheet to save or copy verse
  const showActionSheet = (verse: number) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "حفظ الآية 🔖", "نسخ الآية 📋"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          // Save surah and verse to AsyncStorage
          saveVerseToStorage(Number(surah), verse);
        } else if (buttonIndex === 2) {
          // Copy the verse to clipboard
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
      ref={scrollViewRef}
    >
      <View className="items-center">
        {verse < 1 ? (
          <Image
            style={{
              width: "75%",
              height: 75,
              tintColor: "white",
              objectFit: "contain",
            }}
            source={require("../assets/images/Basmalah.png")}
          />
        ) : (
          <></>
        )}
        <Text
          style={{ lineHeight: 48, justifyContent: "center", display: "flex" }}
          className="text-justify px-3 text-2xl mt-5 text-white font-[othmani-1] items-end"
        >
          {quran[surah].array.slice(0, renderCount).map((item, index) => {
            console.log(index == quran[surah].array.length - 1);

            return index < verse - 1 ? (
              <></>
            ) : (
              <Text
                key={index + item.ar}
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
                style={[
                  highlightedIndex === index && styles.highlighted,
                  {
                    borderRadius: 100,
                  },
                ]}
                className={`${
                  index == verse && verse > 0 ? "bg-gray-800" : ""
                } ${
                  index == quran[surah].array.length - 1
                    ? "text-right text-red-400"
                    : "text-justify"
                }`}
              >
                {item.ar}{" "}
                <Text style={{ fontSize: 30 }}>
                  {convertToArabicNumerals(index + 1)}
                </Text>{" "}
              </Text>
            );
          })}
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
