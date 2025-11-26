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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import quranImport from '../assets/Quran.json';
import MiniPlayer from '../components/MiniPlayer';
import VerseMarker from '../components/VerseMarker';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

const quran = quranImport as any[];
const HIGHLIGHT_END_THRESHOLD_MS = 1750;

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
  const verseLayouts = useRef<{ [key: number]: { y: number; height: number } }>({});
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollYRef = useRef(0);
  const lastScrolledVerseRef = useRef<number | null>(null);

  useEffect(() => {
    loadFontSize();
  }, []);

  const measureVerseLayout = (verseIndex: number, onMeasured?: () => void, attempt = 0) => {
    const verseText = verseRefs.current[verseIndex];
    const scrollView = scrollViewRef.current;
    if (!verseText || !scrollView) return;

    const scrollViewAny: any = scrollView;
    const relativeNode =
      typeof scrollViewAny.getScrollableNode === 'function'
        ? scrollViewAny.getScrollableNode()
        : scrollViewAny;

    (verseText as any).measureLayout(
      relativeNode,
      (_x: number, y: number, _width: number, height: number) => {
        const layout = { y, height: height || fontSize.lineHeight };
        verseLayouts.current[verseIndex] = layout;
        onMeasured?.();
      },
      () => {
        if (attempt < 3) {
          setTimeout(() => {
            measureVerseLayout(verseIndex, onMeasured, attempt + 1);
          }, 100);
        }
      },
    );
  };

  const ensureVerseVisibility = (verseIndex: number, attempt = 0) => {
    if (!scrollViewRef.current || viewportHeight === 0) return;

    const layout = verseLayouts.current[verseIndex];
    if (!layout) {
      if (attempt < 3) {
        measureVerseLayout(
          verseIndex,
          () => ensureVerseVisibility(verseIndex, attempt + 1),
          attempt + 1,
        );
      }
      return;
    }

    // layout.y is the verse top relative to the ScrollView content
    const currentScrollY = scrollYRef.current;
    const desiredTopInViewport = viewportHeight / 3;
    const desiredScrollY = Math.max(0, layout.y - desiredTopInViewport);

    const delta = Math.abs(desiredScrollY - currentScrollY);
    if (delta > 10) {
      scrollViewRef.current.scrollTo({ y: desiredScrollY, animated: true });
      scrollYRef.current = desiredScrollY;

      if (__DEV__) {
        console.log(
          `[Autoscroll] Verse ${verseIndex + 1}: scrolling from ${currentScrollY} to ${desiredScrollY}`,
        );
      }
    }
  };

  // Auto-scroll when verse changes
  useEffect(() => {
    if (state.isPlaying && state.currentSurahId === Number(surah) && state.currentVerseId) {
      const verseIndex = state.currentVerseId - 1;
      ensureVerseVisibility(verseIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentVerseId, state.isPlaying, state.currentSurahId, surah, viewportHeight]);

  useEffect(() => {
    lastScrolledVerseRef.current = null;
    scrollYRef.current = 0;
  }, [state.currentSurahId, surah, viewportHeight]);

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
        console.log('تم حفظ الآية في العلامات المرجعية ✓');
      } else {
        console.log('هذه الآية محفوظة بالفعل');
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
              name={
                state.isPlayingSurah && state.currentSurahId === Number(surah) ? 'pause' : 'play'
              }
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
          source={require('../assets/images/Group 3219.png')}
          style={styles.patternBackground}
          imageStyle={styles.patternBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.surahBannerContainer}>
            <Image
              source={require('../assets/images/Frame.png')}
              style={styles.decorativeFrame}
              resizeMode="contain"
            />
            <Text style={styles.surahNameOverlay}>{quran[Number(surah)].name}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Main Content with Pattern Background */}
      <ImageBackground
        source={require('../assets/images/Mosque.png')}
        style={styles.backgroundPattern}
        imageStyle={styles.backgroundPatternImage}
      >
        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={scrollViewRef}
          onLayout={e => {
            const h = e.nativeEvent.layout.height;
            setViewportHeight(h);
            if (__DEV__) console.log('[Quran] viewportHeight:', h);
          }}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.pageBorderContainer}>
            <View style={styles.pageInnerBorder}>
              <View style={styles.contentCard}>
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

                {/* Verses */}
                <Text
                  style={[
                    styles.versesContainer,
                    { fontSize: fontSize.size, lineHeight: fontSize.lineHeight },
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
                              <Text> </Text>
                            </Text>
                          ))}
                          <VerseMarker verseNumber={index + 1} size={fontSize.lineHeight * 0.8} />
                          <Text> </Text>
                        </Text>
                      );
                    })}
                </Text>
              </View>
            </View>
          </View>
          <MiniPlayer embedded />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  headerSafeArea: {
    backgroundColor: '#F5F5F5',
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
  headerSpacer: {
    width: 40,
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
  whiteHeaderSection: {
    backgroundColor: '#fff',
  },
  englishNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  englishNameTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  englishName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  surahType: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  patternBackground: {
    width: '100%',
    paddingVertical: 8,
  },
  patternBackgroundImage: {
    resizeMode: 'cover',
  },
  surahBannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  decorativeFrame: {
    width: 160,
    height: 40,
  },
  surahNameOverlay: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
  },
  backgroundPattern: {
    flex: 1,
  },
  backgroundPatternImage: {
    opacity: 0,
    resizeMode: 'repeat',
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    minHeight: 500,
  },
  pageBorderContainer: {
    margin: 10,
    borderWidth: 8,
    borderColor: '#065F46', // Dark green border
    borderRadius: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pageInnerBorder: {
    margin: 4,
    borderWidth: 2,
    borderColor: '#D1FAE5', // Light green inner border
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  basmalah: {
    fontSize: 24,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    lineHeight: 40,
  },
  versesContainer: {
    textAlign: 'justify',
    color: '#1F2937',
    fontFamily: 'System',
  },
  wordActive: {
    backgroundColor: '#FFF9C4',
    color: '#065F46',
    fontWeight: 'normal',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 3,
  },
  verseNumberBadgeInline: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  footerSafeArea: {
    backgroundColor: '#10B981',
  },
});
