import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import quranImport from '../assets/Quran.json';
import InlineAyahNumber from '../components/InlineAyahNumber';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

const quran = quranImport as any[];
const HIGHLIGHT_END_THRESHOLD_MS = 1750;

// Responsive constants
const CONTAINER_PADDING = 0;

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
  const scrollViewRef = useRef<ScrollView>(null);
  const verseRefs = useRef<{ [key: number]: Text | null }>({});
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollYRef = useRef(0);

  useEffect(() => {
    loadFontSize();
    saveLastVisited();
  }, []);

  const saveLastVisited = async () => {
    try {
      await AsyncStorage.setItem(
        '@quran_last_visited',
        JSON.stringify({
          surah: Number(surah),
          verse: Number(verse),
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error('Error saving last visited:', error);
    }
  };

  // Auto-scroll every 10 seconds while playing
  useEffect(() => {
    if (!state.isPlaying || state.currentSurahId !== Number(surah)) {
      return;
    }

    const intervalId = setInterval(() => {
      if (scrollViewRef.current && viewportHeight > 0) {
        const scrollAmount = viewportHeight * 0.4; // Scroll 40% of viewport height
        const newScrollY = scrollYRef.current + scrollAmount;
        scrollViewRef.current.scrollTo({ y: newScrollY, animated: true });
        scrollYRef.current = newScrollY;
      }
    }, 35000);

    return () => clearInterval(intervalId);
  }, [state.isPlaying, state.currentSurahId, surah, viewportHeight]);

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
      const bookmarks = existingBookmarksString ? JSON.parse(existingBookmarksString) : [];

      // Check if verse is already bookmarked
      const isAlreadyBookmarked = bookmarks.some(
        (item: any) => item.surah === surah && item.verse === verse,
      );

      if (!isAlreadyBookmarked) {
        // Add new bookmark
        bookmarks.push({
          surah,
          verse,
          addedAt: Date.now(),
        });

        await AsyncStorage.setItem('bookmarkedVerses', JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error saving verse:', error);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollHeight = event.nativeEvent.contentSize.height;
    const windowHeight = event.nativeEvent.layoutMeasurement.height;

    scrollYRef.current = scrollPosition;

    if (scrollPosition + windowHeight > scrollHeight - 100) {
      setRenderCount((prevCount: number) => prevCount + 20);
    }
  };

  const handlePlaySurah = async () => {
    try {
      if (state.isPlaying && state.currentSurahId === Number(surah)) {
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

  const handlePlayVerse = async (verseIndex: number) => {
    try {
      await playVerse(Number(surah), verseIndex + 1, true);
    } catch (error) {
      console.error('Error playing verse:', error);
    }
  };

  const showActionSheet = (verseIndex: number) => {
    const options = ['إلغاء', 'تشغيل الآية 🎵', 'حفظ الآية 🔖', 'نسخ الآية 📋'];
    const cancelButtonIndex = 0;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === 1) {
          handlePlayVerse(verseIndex);
        } else if (buttonIndex === 2) {
          saveVerseToStorage(Number(surah), verseIndex);
        } else if (buttonIndex === 3) {
          Clipboard.setString(quran[Number(surah)].array[verseIndex].ar);
        }
      },
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
    return state.currentSurahId === Number(surah) && state.currentVerseId === verseIndex + 1;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
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
          <TouchableOpacity style={styles.playButton} onPress={handlePlaySurah}>
            <Ionicons
              name={state.isPlaying && state.currentSurahId === Number(surah) ? 'pause' : 'play'}
              size={20}
              color="#065F46"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.mainContentContainer}>
        {/* Custom Border Frame Container */}
        <ImageBackground
          source={require('../assets/images/Quran fram.png')}
          style={styles.frameContainer}
          resizeMode="stretch"
        >
          {/* Main Content */}
          <ScrollView
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={scrollViewRef}
            onLayout={e => {
              const h = e.nativeEvent.layout.height;
              setViewportHeight(h);
            }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.textContainer}>
              {/* Surah Name Header */}
              <View style={styles.surahHeaderContainer}>
                <ImageBackground
                  source={require('../assets/images/Frame.png')}
                  style={styles.surahFrame}
                  resizeMode="contain"
                >
                  <Text style={styles.surahNameInside}>{quran[Number(surah)].name}</Text>
                </ImageBackground>
              </View>

              {/* Basmalah */}
              {Number(surah) !== 0 && Number(surah) !== 8 && (
                <Text
                  style={[
                    styles.basmalah,
                    { fontSize: fontSize.size, lineHeight: fontSize.lineHeight },
                  ]}
                >
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </Text>
              )}

              {/* Verses Block */}
              <Text
                style={[
                  styles.versesText,
                  {
                    fontSize: fontSize.size,
                    lineHeight: fontSize.lineHeight * 1,
                  },
                ]}
              >
                {quran[Number(surah)].array
                  .slice(0, renderCount)
                  .map((item: any, index: number) => {
                    const words = String(item.ar || '')
                      .trim()
                      .split(/\s+/);
                    const active = isVerseActive(index);
                    const durationMs = state.duration || 0;
                    const positionMs = state.position || 0;
                    const ratio =
                      durationMs > 0 ? Math.min(0.9999, Math.max(0, positionMs / durationMs)) : 0;
                    const remainingMs = Math.max(0, durationMs - positionMs);
                    const isAtVerseEnd =
                      durationMs > 0 && remainingMs <= HIGHLIGHT_END_THRESHOLD_MS;
                    const isAtVerseStart = ratio < 0.02;
                    const activeWordIndex =
                      active && isCurrentVerse(index) && !isAtVerseEnd && !isAtVerseStart
                        ? Math.min(words.length - 1, Math.floor(ratio * (words.length + 0.5)))
                        : -1;
                    const isWordActive = (i: number) =>
                      active &&
                      isCurrentVerse(index) &&
                      !isAtVerseEnd &&
                      !isAtVerseStart &&
                      i >= Math.max(0, activeWordIndex - 2) &&
                      i <= activeWordIndex &&
                      activeWordIndex >= 0;

                    return (
                      <Text
                        key={index}
                        ref={r => (verseRefs.current[index] = r)}
                        onLongPress={() => showActionSheet(index)}
                      >
                        {words.map((w: string, i: number) => (
                          <Text
                            key={`${index}-${i}`}
                            style={isWordActive(i) ? styles.wordActive : undefined}
                          >
                            {w}
                            {i !== words.length - 1 && ' '}
                          </Text>
                        ))}
                        <Text style={{ fontFamily: 'System' }}>{'\u00A0'}</Text>
                        <InlineAyahNumber verseNumber={index + 1} size={fontSize.size * 0.9} />
                        <Text style={{ fontFamily: 'System' }}>{'\u00A0'}</Text>
                      </Text>
                    );
                  })}
              </Text>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light background outside
  },
  mainContentContainer: {
    flex: 1,
    padding: CONTAINER_PADDING, // Gap between screen edge and border
    backgroundColor: '#F5F5F5',
  },
  frameContainer: {
    flex: 1,
    paddingTop: 97,
    paddingBottom: 95,
    paddingHorizontal: 40,
  },
  headerSafeArea: {
    backgroundColor: '#F5F5F5',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDetails: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#065F46',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  textContainer: {
    width: '100%',
  },
  surahHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  surahFrame: {
    width: 180,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNameInside: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  basmalah: {
    fontSize: 24,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  versesText: {
    textAlign: 'center',
    writingDirection: 'rtl',
    color: '#000',
    fontFamily: 'AlMadina',
    includeFontPadding: false,
    paddingHorizontal: 10,
  },
  wordActive: {
    backgroundColor: '#FFF9C4',
    color: '#065F46',
  },
});
