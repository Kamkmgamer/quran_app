import { useLocalSearchParams, router } from "expo-router";
import quranImport from "../assets/Quran.json";
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const quran = quranImport as any[];

const fontSizeOptions: { [key: string]: { size: number; lineHeight: number } } = {
  small: { size: 20, lineHeight: 40 },
  medium: { size: 24, lineHeight: 48 },
  large: { size: 28, lineHeight: 56 },
  xlarge: { size: 32, lineHeight: 64 },
};

export default function Quran() {
  const { surah, verse } = useLocalSearchParams();
  const { state, playVerse, playSurahFromVerse, stop } = useAudioPlayer();
  const { showActionSheetWithOptions } = useActionSheet();
  const [renderCount, setRenderCount] = useState(50 + Number(verse));
  const [fontSize, setFontSize] = useState(fontSizeOptions.medium);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedSize = await AsyncStorage.getItem('quranFontSize');
      if (savedSize && fontSizeOptions[savedSize]) {
        setFontSize(fontSizeOptions[savedSize]);
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

  const saveVerseToStorage = async (surah: number, verse: number) => {
    try {
      // Get existing bookmarks
      const existingBookmarksString = await AsyncStorage.getItem('bookmarkedVerses');
      let bookmarks = existingBookmarksString ? JSON.parse(existingBookmarksString) : [];
      
      // Check if verse is already bookmarked
      const isAlreadyBookmarked = bookmarks.some(
        (item: any) => item.surah === surah && item.verse === verse
      );
      
      if (!isAlreadyBookmarked) {
        // Add new bookmark
        bookmarks.push({
          surah,
          verse,
          addedAt: Date.now(),
        });
        
        await AsyncStorage.setItem('bookmarkedVerses', JSON.stringify(bookmarks));
        alert('تم حفظ الآية في العلامات المرجعية ✓');
      } else {
        alert('هذه الآية محفوظة بالفعل');
      }
    } catch (error) {
      console.error('Error saving verse:', error);
      alert('حدث خطأ أثناء حفظ الآية');
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

  const handlePlayVerse = async (verseIndex: number) => {
    try {
      await playVerse(Number(surah), verseIndex + 1, true);
    } catch (error) {
      console.error('Error playing verse:', error);
    }
  };

  const handlePlaySurah = async () => {
    try {
      if (state.isPlayingSurah && state.currentSurahId === Number(surah)) {
        // Stop if currently playing this surah
        await stop();
      } else {
        // Start playing from current verse or first verse
        const startVerse = Number(verse) || 1;
        await playSurahFromVerse(Number(surah), startVerse);
      }
    } catch (error) {
      console.error('Error playing surah:', error);
    }
  };

  const showActionSheet = (verseIndex: number) => {
    const options = ["إلغاء", "تشغيل الآية 🎵", "حفظ الآية 🔖", "نسخ الآية 📋"];
    const cancelButtonIndex = 0;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          handlePlayVerse(verseIndex);
        } else if (buttonIndex === 2) {
          saveVerseToStorage(Number(surah), verseIndex);
        } else if (buttonIndex === 3) {
          Clipboard.setString(quran[Number(surah)].array[verseIndex].ar);
        }
      }
    );
  };
  
  // تحديد الآية النشطة (التي يتم تشغيلها حالياً)
  const isVerseActive = (verseIndex: number) => {
    return (
      state.currentSurahId === Number(surah) &&
      state.currentVerseId === verseIndex + 1 &&
      state.isPlaying
    );
  };

  // تحديد ما إذا كانت الآية هي الآية الحالية قيد التشغيل (بغض النظر عن حالة التشغيل)
  const isCurrentVerse = (verseIndex: number) => {
    return (
      state.currentSurahId === Number(surah) &&
      state.currentVerseId === verseIndex + 1
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Svg width="9" height="19" viewBox="0 0 9 19" fill="none">
              <Path
                d="M7.75 17.75L4.6648 14.7796C2.20442 12.4107 0.974227 11.2263 0.784807 9.78267C0.738398 9.42896 0.738398 9.07104 0.784807 8.71733C0.974227 7.27371 2.20442 6.08928 4.6648 3.72042L7.75 0.75"
                stroke="#065F46"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
          <View style={styles.headerDetails}>
            <Text style={styles.headerTitle}>{quran[Number(surah)].name}</Text>
            <Text style={styles.headerSubtitle}>
              {quran[Number(surah)].array.length} آيات — {quran[Number(surah)].type}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={handlePlaySurah}
          >
            <Ionicons 
              name={state.isPlayingSurah && state.currentSurahId === Number(surah) ? "pause" : "play"} 
              size={20} 
              color="#065F46" 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>


      {/* White Section with Decorative Banner */}
      <View style={styles.whiteHeaderSection}>
        {/* Decorative Surah Name Banner with Pattern Background */}
        <ImageBackground
          source={require("../app/Group 3219.png")}
          style={styles.patternBackground}
          imageStyle={styles.patternBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.surahBannerContainer}>
            <Image 
              source={require("../app/Frame.png")} 
              style={styles.decorativeFrame}
              resizeMode="contain"
            />
            <Text style={styles.surahNameOverlay}>{quran[Number(surah)].name}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Main Content with Pattern Background */}
      <ImageBackground
        source={require("../assets/images/Mosque.png")}
        style={styles.backgroundPattern}
        imageStyle={styles.backgroundPatternImage}
      >
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentCard}>
            {/* Basmalah */}
            {Number(surah) !== 0 && Number(surah) !== 8 && (
              <Text style={[styles.basmalah, { fontSize: fontSize.size, lineHeight: fontSize.lineHeight }]}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </Text>
            )}
            
            {/* Verses */}
            <Text style={[styles.versesContainer, { lineHeight: fontSize.lineHeight }]}>
              {quran[Number(surah)].array.slice(0, renderCount).map((item: any, index: number) => {
                const words = String(item.ar || '').trim().split(/\s+/);
                const active = isVerseActive(index);
                const ratio = state.duration > 0 ? Math.min(0.9999, Math.max(0, state.position / state.duration)) : 0;
                // Don't highlight if we're at the very end (about to transition to next verse) or at the very beginning (transitioning in)
                const isAtVerseEnd = ratio > 0.90;
                const isAtVerseStart = ratio < 0.02;
                const activeWordIndex = active && isCurrentVerse(index) && !isAtVerseEnd && !isAtVerseStart ? Math.min(words.length - 1, Math.floor(ratio * (words.length + 0.5))) : -1;
                const isWordActive = (i: number) => active && isCurrentVerse(index) && !isAtVerseEnd && !isAtVerseStart && i >= activeWordIndex - 2 && i <= activeWordIndex;
                return (
                  <Text
                    key={index}
                    onLongPress={() => showActionSheet(index)}
                    style={[styles.verseText, { fontSize: fontSize.size, lineHeight: fontSize.lineHeight }]}
                  >
                    {words.map((w: string, i: number) => (
                      <Text key={`${index}-${i}`} style={isWordActive(i) ? styles.wordActive : undefined}>
                        {w}
                        <Text> </Text>
                      </Text>
                    ))}
                    <Text style={[styles.verseNumberInline, { fontSize: fontSize.size - 4 }]}>
                      {" "}﴿{index + 1}﴾{" "}
                    </Text>
                  </Text>
                );
              })}
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Footer Navigation */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              if (Number(surah) < quran.length - 1) {
                router.push({
                  pathname: "/quran",
                  params: { surah: Number(surah) + 1, verse: 0 },
                });
              }
            }}
          >
            <Svg width="9" height="19" viewBox="0 0 9 19" fill="none">
              <Path 
                d="M7.75 17.75L4.6648 14.7796C2.20442 12.4107 0.974227 11.2263 0.784807 9.78267C0.738398 9.42896 0.738398 9.07104 0.784807 8.71733C0.974227 7.27371 2.20442 6.08928 4.6648 3.72042L7.75 0.75" 
                stroke="#076040" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
          
          <Text style={styles.pageNumber}>{quran[Number(surah)].id}/1</Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              if (Number(surah) > 0) {
                router.push({
                  pathname: "/quran",
                  params: { surah: Number(surah) - 1, verse: 0 },
                });
              }
            }}
          >
            <Text style={styles.navText}>السابق</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerSafeArea: {
    backgroundColor: "#F5F5F5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerDetails: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#065F46",
  },
  whiteHeaderSection: {
    backgroundColor: "#fff",
  },
  englishNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  englishNameTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  englishName: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  surahType: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  patternBackground: {
    width: "100%",
    paddingVertical: 16,
  },
  patternBackgroundImage: {
    resizeMode: "cover",
  },
  surahBannerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    position: "relative",
  },
  decorativeFrame: {
    width: 200,
    height: 50,
  },
  surahNameOverlay: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },
  backgroundPattern: {
    flex: 1,
  },
  backgroundPatternImage: {
    opacity: 0.03,
    resizeMode: "repeat",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    minHeight: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  basmalah: {
    fontSize: 24,
    color: "#065F46",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "600",
    lineHeight: 40,
  },
  versesContainer: {
    paddingHorizontal: 4,
    textAlign: "justify",
    lineHeight: 48,
  },
  verseText: {
    fontSize: 24,
    color: "#1F2937",
    lineHeight: 48,
    fontFamily: "System",
  },
  wordActive: {
    color: "#065F46",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  verseNumberInline: {
    fontSize: 20,
    color: "#065F46",
    fontWeight: "600",
  },
  footerSafeArea: {
    backgroundColor: "#fff",
  },
  footer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    marginLeft: 8,
    fontWeight: "500",
  },
  pageNumber: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
});
