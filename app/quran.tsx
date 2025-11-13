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
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const verseRefs = useRef<{ [key: number]: View | null }>({});
  const verseLayouts = useRef<{ [key: number]: { y: number; height: number } }>({});
  const verseLineMaps = useRef<{ [key: number]: { ys: number[]; heights: number[]; lineCount: number } }>({});
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollYRef = useRef(0);
  const lastScrolledVerseRef = useRef<number | null>(null);

  useEffect(() => {
    loadFontSize();
  }, []);

  const ensureVerseVisibility = (verseIndex: number, progress = 1, attempt = 0) => {
    if (!scrollViewRef.current || viewportHeight === 0) return;

    const layout = verseLayouts.current[verseIndex];
    if (!layout) {
      const verseContainer = verseRefs.current[verseIndex];
      if (verseContainer && attempt < 3) {
        verseContainer.measureLayout(
      scrollViewRef.current as any,
      (_x: number, verseY: number, _w: number, verseHeight: number) => {
            verseLayouts.current[verseIndex] = { y: verseY, height: verseHeight };
            requestAnimationFrame(() => ensureVerseVisibility(verseIndex, progress, attempt + 1));
          },
          () => {},
        );
      }
      return;
    }

    const bufferBottom = fontSize.lineHeight * 3;
    const bufferTop = fontSize.lineHeight * 1.5;
        const visibleTop = scrollYRef.current;
    const visibleBottom = visibleTop + viewportHeight;

    let targetLineTop = layout.y;
    let targetLineBottom = layout.y + layout.height;

    const lineMap = verseLineMaps.current[verseIndex];
    if (lineMap && lineMap.lineCount > 0) {
      const clampedProgress = Math.min(0.9999, Math.max(0, progress));
      const lineIdx = Math.min(lineMap.lineCount - 1, Math.floor(clampedProgress * lineMap.lineCount));
      const lineY = lineMap.ys[lineIdx] ?? 0;
      const lineHeight = lineMap.heights[lineIdx] ?? fontSize.lineHeight;
      targetLineTop = layout.y + lineY;
      targetLineBottom = targetLineTop + lineHeight;
    }

    if (targetLineBottom > visibleBottom - bufferBottom) {
      const targetY = targetLineBottom - viewportHeight + bufferBottom;
      if (targetY > visibleTop) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, targetY), animated: true });
        scrollYRef.current = Math.max(0, targetY);
      }
    } else if (targetLineTop < visibleTop + bufferTop) {
      const targetY = Math.max(0, targetLineTop - bufferTop);
      if (targetY < visibleTop) {
        scrollViewRef.current.scrollTo({ y: targetY, animated: true });
        scrollYRef.current = targetY;
      }
    }
  };

  const currentVerseProgress =
    state.duration > 0 ? Math.min(0.9999, Math.max(0, state.position / state.duration)) : 0;

  // Auto-scroll to keep active verse visible with buffer
  useEffect(() => {
    const currentSurahId = Number(surah);
    if (!viewportHeight || state.currentSurahId !== currentSurahId) return;

    const verseIndex = Math.max(0, (state.currentVerseId || 1) - 1);
    if (!verseRefs.current[verseIndex] && !verseLayouts.current[verseIndex]) return;

    ensureVerseVisibility(verseIndex, currentVerseProgress);
    lastScrolledVerseRef.current = verseIndex;
  }, [
    state.currentVerseId,
    state.currentSurahId,
    state.position,
    state.duration,
    viewportHeight,
    fontSize.lineHeight,
    surah,
    currentVerseProgress,
  ]);

  useEffect(() => {
    lastScrolledVerseRef.current = null;
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
      (buttonIndex) => {
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
              name={state.isPlayingSurah && state.currentSurahId === Number(surah) ? 'pause' : 'play'}
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
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setViewportHeight(h);
            if (__DEV__) console.log('[Quran] viewportHeight:', h);
          }}
          onContentSizeChange={(_w, h) => {
            if (__DEV__) console.log('[Quran] contentHeight:', h);
          }}
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
            {quran[Number(surah)].array.slice(0, renderCount).map((item: any, index: number) => {
              const words = String(item.ar || '').trim().split(/\s+/);
              const active = isVerseActive(index);
              const ratio = state.duration > 0 ? Math.min(0.9999, Math.max(0, state.position / state.duration)) : 0;
              const isAtVerseEnd = ratio > 0.90;
              const isAtVerseStart = ratio < 0.02;
              const activeWordIndex = active && isCurrentVerse(index) && !isAtVerseEnd && !isAtVerseStart ? Math.min(words.length - 1, Math.floor(ratio * (words.length + 0.5))) : -1;
              const isWordActive = (i: number) => active && isCurrentVerse(index) && !isAtVerseEnd && !isAtVerseStart && i >= activeWordIndex - 2 && i <= activeWordIndex;
              return (
                <View
                  key={index}
                  ref={(r) => (verseRefs.current[index] = r as any)}
                  onLayout={(e) => {
                    const { y, height } = e.nativeEvent.layout;
                    verseLayouts.current[index] = { y, height };
                    const currentSurahId = Number(surah);
                    if (
                      state.currentSurahId === currentSurahId &&
                      Math.max(0, (state.currentVerseId || 1) - 1) === index
                    ) {
                      ensureVerseVisibility(index);
                      lastScrolledVerseRef.current = index;
                    }
                  }}
                  style={[
                    styles.verseWrapper,
                    active && styles.verseWrapperActive,
                  ]}
                >
                  <View style={styles.verseContent}>
                    <View style={styles.verseTextWrapper}>
                      <Text
                        style={[styles.versesContainer, { fontSize: fontSize.size, lineHeight: fontSize.lineHeight }]}
                        onLongPress={() => showActionSheet(index)}
                        onTextLayout={(e) => {
                          const lines = (e.nativeEvent as any).lines || [];
                          const ys: number[] = [];
                          const heights: number[] = [];
                          for (const line of lines) {
                            ys.push(line.y || 0);
                            heights.push(line.height || fontSize.lineHeight);
                          }
                          verseLineMaps.current[index] = { ys, heights, lineCount: ys.length };
                        }}
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
                      </Text>
                    </View>
                    <View style={styles.verseNumberBadge}>
                      <Text style={styles.verseNumberText}>{index + 1}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Footer Navigation */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              if (Number(surah) > 0) {
                router.push({
                  pathname: '/quran',
                  params: { surah: Number(surah) - 1, verse: 0 },
                });
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.pageNumber}>{quran[Number(surah)].id}/1</Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              if (Number(surah) < quran.length - 1) {
                router.push({
                  pathname: '/quran',
                  params: { surah: Number(surah) + 1, verse: 0 },
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
    borderRadius: 0,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    minHeight: 500,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  basmalah: {
    fontSize: 24,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    lineHeight: 40,
  },
  verseWrapper: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    marginHorizontal: -16,
    alignSelf: 'stretch',
  },
  verseWrapperActive: {
    backgroundColor: '#FFF9C4',
  },
  verseContent: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    width: '100%',
  },
  verseTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  versesContainer: {
    textAlign: 'justify',
    color: '#1F2937',
    fontFamily: 'System',
  },
  wordActive: {
    color: '#065F46',
    backgroundColor: 'transparent',
    fontWeight: '700',
  },
  verseNumberBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    paddingHorizontal: 4,
  },
  verseNumberText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footerSafeArea: {
    backgroundColor: '#10B981',
  },
  footer: {
    backgroundColor: '#10B981',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 0,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pageNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
