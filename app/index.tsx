import { Text, View, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
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

  useFocusEffect(
    React.useCallback(() => {
      loadSavedVerse();
      loadLastListeningPosition();
    }, [])
  );

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
    const backgroundColor = isLastRead ? "#D4AF37" : "#fff";
    const textColor = isLastRead ? "#fff" : "#065F46";
    const numberColor = isLastRead ? "#fff" : "#D4AF37";
    const verseCountColor = isLastRead ? "#fff" : "#10B981";
    
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
            borderColor: isLastRead ? "#D4AF37" : "#E5E7EB",
            borderWidth: 1,
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24} color="#065F46" />
        </TouchableOpacity>
        <Text style={styles.headerTime}>5:30 مساء</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#065F46" />
        </TouchableOpacity>
      </View>

      {/* Recently Read Section */}
      <View style={styles.recentCard}>
        <Ionicons name="bookmark" size={20} color="#D4AF37" style={styles.recentIcon} />
        <View style={styles.recentContent}>
          <Text style={styles.recentTitle}>ماتم قراءته مؤخرا</Text>
          <Text style={styles.recentSurah}>{surahList[surah as number].name}</Text>
          <Text style={styles.recentVerse}>الأية : {verse + 1}</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/quran",
              params: { surah: surah, verse: verse },
            })
          }
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>متابعة</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Last Listening Position */}
      {lastListeningPosition && (
        <TouchableOpacity
          style={styles.listeningCard}
          onPress={() => resumeLastPosition()}
        >
          <Ionicons name="headset" size={20} color="#10B981" style={styles.listeningIcon} />
          <View style={styles.listeningContent}>
            <Text style={styles.listeningTitle}>استئناف الاستماع</Text>
            <Text style={styles.listeningSurah}>
              {surahList[lastListeningPosition.surahId]?.name} - آية {lastListeningPosition.verseId}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => resumeLastPosition()}
            style={styles.playSmallButton}
          >
            <Ionicons name="play" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/qibla")}
        >
          <Ionicons name="compass" size={24} color="#D4AF37" />
          <Text style={styles.quickActionText}>القبلة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/prayer-times")}
        >
          <Ionicons name="time" size={24} color="#10B981" />
          <Text style={styles.quickActionText}>الصلاة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/reciters")}
        >
          <Ionicons name="person" size={24} color="#D4AF37" />
          <Text style={styles.quickActionText}>القراء</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/player")}
        >
          <Ionicons name="musical-notes" size={24} color="#10B981" />
          <Text style={styles.quickActionText}>المشغل</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#10B981" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="بحث السور"
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

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

      {/* Menu Component */}
      <Menu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9F8",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIcon: {
    padding: 8,
  },
  headerTime: {
    fontSize: 12,
    color: "#D4AF37",
    fontWeight: "500",
  },
  recentCard: {
    backgroundColor: "#065F46",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  recentIcon: {
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  recentSurah: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recentVerse: {
    color: "#fff",
    fontSize: 12,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  continueText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#065F46",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#E0F2E9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#065F46",
  },
  tabText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  gridContainer: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  surahNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  surahName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  verseCount: {
    fontSize: 12,
  },
  qiblaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qiblaContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  qiblaIcon: {
    marginRight: 12,
  },
  qiblaTextContainer: {
    flex: 1,
  },
  qiblaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 4,
  },
  qiblaSubtitle: {
    fontSize: 14,
    color: "#10B981",
  },
  listeningCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  listeningIcon: {
    marginRight: 12,
  },
  listeningContent: {
    flex: 1,
  },
  listeningTitle: {
    fontSize: 14,
    color: "#065F46",
    marginBottom: 4,
  },
  listeningSurah: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  playSmallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: "#065F46",
    marginTop: 8,
    fontWeight: "500",
  },
});
