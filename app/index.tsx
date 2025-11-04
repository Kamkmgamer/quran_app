import { Text, View, TextInput, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import quran from "../assets/Quran.json";
import Menu from "../components/Menu";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import StorageService from "../services/StorageService";

interface Verse {
  id: number;
  ar: string;
  en: string;
  filename: string;
  path: string;
  dir: string;
  size: number;
}

interface Surah {
  id: number;
  name: string;
  name_en: string;
  name_translation: string;
  words: number;
  letters: number;
  type: string;
  type_en: string;
  ar: string;
  en: string;
  array: Verse[];
}

export default function HomeScreen() {
  const surahList = quran as Surah[];
  const { resumeLastPosition } = useAudioPlayer();

  const [surah, setSurah] = React.useState(0);
  const [verse, setVerse] = React.useState(0);
  const [surahSearchList, setSurahSearchList] = React.useState<Surah[]>(surahList);
  const [activeTab, setActiveTab] = React.useState("سورة");
  const [searchText, setSearchText] = React.useState("");
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [lastListeningPosition, setLastListeningPosition] = React.useState<any>(null);
  const [currentTime, setCurrentTime] = React.useState<string>("");

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

  const loadLastListeningPosition = async () => {
    try {
      const position = await StorageService.getLastPosition();
      setLastListeningPosition(position);
    } catch (error) {
      console.error("Error loading last listening position:", error);
    }
  };

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Convert to 12-hour format
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const period = hours >= 12 ? "مساء" : "صباح";
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${displayHours}:${formattedMinutes} ${period}`;
  };

  const updateTime = () => {
    setCurrentTime(formatTime());
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSavedVerse();
      loadLastListeningPosition();
      updateTime();
    }, [])
  );

  React.useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    const results = surahList.filter((item: Surah) =>
      item.name.includes(text)
    );
    setSurahSearchList(results);
  };

  const tabs = ["سورة", "جزء", "الأذكار"];

  const renderSurahCard = ({ item, index }: { item: Surah; index: number }) => {
    const isLastRead = item.id - 1 === surah;
    const isEven = index % 2 === 0;
    const backgroundColor = isLastRead ? "#D4AF37" : (isEven ? "#fff" : "#FEFCE8");
    const borderColor = isLastRead ? "#D4AF37" : "#D4AF37";
    const textColor = isLastRead ? "#fff" : "#D97706";
    const numberColor = isLastRead ? "#fff" : "#D97706";
    const verseCountColor = isLastRead ? "#fff" : "#D97706";
    
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/quran",
            params: { surah: item.id - 1, verse: 0 },
          })
        }
        style={[
          styles.card,
          {
            backgroundColor,
            borderColor,
            borderWidth: 2,
          },
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.surahNumber, { color: numberColor }]}>
            {item.id}
          </Text>
          <Text style={[styles.surahName, { color: textColor }]}>
            {item.name}
          </Text>
        </View>
        <Text style={[styles.verseCount, { color: verseCountColor }]}>
          {item.array.length} آيات
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Mosque Background */}
      <ImageBackground
        source={require("../assets/images/Mosque.png")}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={24} color="#065F46" />
            </TouchableOpacity>
            <Text style={styles.headerTime}>{currentTime}</Text>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#065F46" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Recently Read Section */}
      <View style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <Ionicons name="bookmark" size={20} color="#D4AF37" />
          <Text style={styles.recentTitle}>ماتم قراءته مؤخرا</Text>
        </View>
        <Text style={styles.recentSurah}>{surahList[surah as number].name}</Text>
        <View style={styles.recentFooter}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/quran",
                params: { surah: surah, verse: verse },
              })
            }
            style={styles.continueButton}
          >
            <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
            <Text style={styles.continueText}>متابعة</Text>
          </TouchableOpacity>
          <Text style={styles.recentVerse}>الأية : {verse + 1}</Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.contentContainer}>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Surah Grid */}
        <FlatList
          data={surahSearchList}
          renderItem={renderSurahCard}
          keyExtractor={(item: any) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {/* Menu Component */}
      <Menu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF3C7",
  },
  headerBackground: {
    width: "100%",
    height: 280,
    backgroundColor: "#FEF3C7",
  },
  headerBackgroundImage: {
    resizeMode: "cover",
  },
  headerSafeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
  },
  headerTime: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentCard: {
    backgroundColor: "#065F46",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -100,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  recentTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  recentSurah: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  recentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentVerse: {
    color: "#fff",
    fontSize: 14,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  continueText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#065F46",
  },
  tabText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#065F46",
    fontWeight: "600",
  },
  gridContainer: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 20,
    minHeight: 100,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  surahNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  surahName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
  },
  verseCount: {
    fontSize: 12,
    textAlign: "right",
  },
});
