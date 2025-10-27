import { useLocalSearchParams, useNavigation } from "expo-router";
import quran from "../assets/Quran.json";
import {
  Text,
  Image,
  ScrollView,
  View,
  StyleSheet,
  ActionSheetIOS,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

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
  const [renderCount, setRenderCount] = useState(50 + Number(verse));
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const pressTimeoutRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: quran[Number(surah)].name,
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#065F46",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
      },
    });
  }, [navigation, surah]);

  const saveVerseToStorage = async (surah: number, verse: number) => {
    try {
      await AsyncStorage.setItem(
        "savedVerses",
        JSON.stringify({ surah, verse })
      );
    } catch (error) {
      console.error("Error saving verse:", error);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollHeight = event.nativeEvent.contentSize.height;
    const windowHeight = event.nativeEvent.layoutMeasurement.height;

    if (scrollPosition + windowHeight > scrollHeight - 100) {
      setRenderCount((prevCount: number) => prevCount + 20);
    }
  };

  const showActionSheet = (verseIndex: number) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "حفظ الآية 🔖", "نسخ الآية 📋"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          saveVerseToStorage(Number(surah), verseIndex);
        } else if (buttonIndex === 2) {
          Clipboard.setString(quran[Number(surah)].array[verseIndex].ar);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.bannerContent}>
          <Text style={styles.surahTitle}>{quran[Number(surah)].name}</Text>
          <Text style={styles.surahInfo}>
            {quran[Number(surah)].array.length} آيات - {quran[Number(surah)].type === "مكية" ? "مكية" : "مدنية"}
          </Text>
        </View>
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentCard}>
          {/* Basmalah */}
          <Text style={styles.basmalah}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
          
          {quran[Number(surah)].array.slice(0, renderCount).map((item: any, index: number) => (
            <View key={index} style={styles.verseContainer}>
              <TouchableOpacity
                style={styles.bookmarkIcon}
                onPress={() => showActionSheet(index)}
              >
                <Ionicons name="bookmark-outline" size={20} color="#065F46" />
              </TouchableOpacity>
              <View style={styles.verseContent}>
                <Text
                  style={styles.verseText}
                  onLongPress={() => showActionSheet(index)}
                >
                  {item.ar}
                </Text>
                <View style={styles.verseNumber}>
                  <Text style={styles.verseNumberText}>{index + 1}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color="#065F46" />
          <Text style={styles.navText}>السابق</Text>
        </TouchableOpacity>
        <Text style={styles.pageNumber}>48/1</Text>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>التالي</Text>
          <Ionicons name="chevron-forward" size={20} color="#065F46" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9F8",
  },
  headerBanner: {
    backgroundColor: "#065F46",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  bannerContent: {
    alignItems: "center",
  },
  surahTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  surahInfo: {
    fontSize: 14,
    color: "#D4AF37",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for footer
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    minHeight: 500,
  },
  basmalah: {
    fontSize: 22,
    color: "#065F46",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  verseContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  bookmarkIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
  },
  verseContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  verseText: {
    fontSize: 20,
    color: "#065F46",
    textAlign: "right",
    lineHeight: 36,
    flex: 1,
    marginRight: 12,
  },
  verseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  verseNumberText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 14,
    color: "#065F46",
    marginHorizontal: 4,
  },
  pageNumber: {
    fontSize: 16,
    color: "#065F46",
    fontWeight: "600",
  },
});
