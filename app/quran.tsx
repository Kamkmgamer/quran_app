import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  LayoutChangeEvent,
  I18nManager,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import quranImport from '../assets/Quran.json';
import InlineAyahNumber from '../components/InlineAyahNumber';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

// Type definitions
interface QuranVerse {
  ar: string;
  en?: string;
}

interface QuranSurah {
  name: string;
  array: QuranVerse[];
  type: string;
}

const quran = quranImport as QuranSurah[];
const HIGHLIGHT_END_THRESHOLD_MS = 1750;

const FRAME_BORDER_TOP = Platform.OS === 'android' ? 75 : 28;
const FRAME_BORDER_BOTTOM = Platform.OS === 'android' ? 75 : 50;
const FRAME_BORDER_HORIZONTAL = Platform.OS === 'android' ? 40 : 32;
const HEADER_HEIGHT_BASE = 55;
const MINI_PLAYER_HEIGHT = 90;

const BACK_ARROW_PATH =
  'M7.75 17.75L4.6648 14.7796C2.20442 12.4107 0.974227 11.2263 0.784807 9.78267C0.738398 9.42896 ' +
  '0.738398 9.07104 0.784807 8.71733C0.974227 7.27371 2.20442 6.08928 4.6648 3.72042L7.75 0.75';

// Animation configuration
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

const fontSizeOptions: { [key: string]: { size: number; lineHeight: number } } = {
  small: { size: 20, lineHeight: 40 },
  medium: { size: 24, lineHeight: 48 },
  large: { size: 28, lineHeight: 56 },
  xlarge: { size: 32, lineHeight: 64 },
};

export default function Quran() {
  const { surah, verse } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { state, playVerse, playSurahFromVerse, stop } = useAudioPlayer();
  const { showActionSheetWithOptions } = useActionSheet();

  // State
  const [renderCount, setRenderCount] = useState(50 + Number(verse));
  const [fontSize, setFontSize] = useState(fontSizeOptions.medium);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const verseRefs = useRef<{ [key: number]: Text | null }>({});
  const versePositions = useRef<{ [key: number]: number }>({});
  const scrollYRef = useRef(0);
  const lastScrolledVerse = useRef<number | null>(null);
  const userInteractionTimer = useRef<NodeJS.Timeout | null>(null);

  // Animated values
  const isFullScreen = useSharedValue(0); // 0 = normal, 1 = fullscreen
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);
  const gestureTranslateY = useSharedValue(0);

  // ============== Callbacks ==============

  const saveLastVisited = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        '@quran_last_visited',
        JSON.stringify({
          surah: Number(surah),
          verse: Number(verse),
          timestamp: Date.now(),
        }),
      );
    } catch {
      // Silently fail
    }
  }, [surah, verse]);

  const loadFontSize = useCallback(async () => {
    try {
      const savedSize = await AsyncStorage.getItem('quranFontSize');
      if (savedSize && fontSizeOptions[savedSize]) {
        setFontSize(fontSizeOptions[savedSize]);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const enterFullScreen = useCallback(() => {
    'worklet';
    isFullScreen.value = withSpring(1, SPRING_CONFIG);
    headerOpacity.value = withTiming(0, { duration: 200 });
    headerTranslateY.value = withSpring(-100, SPRING_CONFIG);
  }, []);

  const exitFullScreen = useCallback(() => {
    'worklet';
    isFullScreen.value = withSpring(0, SPRING_CONFIG);
    headerOpacity.value = withTiming(1, TIMING_CONFIG);
    headerTranslateY.value = withSpring(0, SPRING_CONFIG);
    runOnJS(triggerHaptic)();
  }, [triggerHaptic]);

  const handleUserInteraction = useCallback(() => {
    setIsUserInteracting(true);

    if (userInteractionTimer.current) {
      clearTimeout(userInteractionTimer.current);
    }

    userInteractionTimer.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 5000);
  }, []);

  // ============== Effects ==============

  useEffect(() => {
    loadFontSize();
    saveLastVisited();
  }, [loadFontSize, saveLastVisited]);

  useEffect(() => {
    setIsMiniPlayerVisible(state.currentSurahId !== null);
  }, [state.currentSurahId]);

  // Sync full screen with playback state
  useEffect(() => {
    if (state.isPlaying && state.currentSurahId === Number(surah) && !isUserInteracting) {
      enterFullScreen();
    } else if (!state.isPlaying) {
      exitFullScreen();
    }
  }, [
    state.isPlaying,
    state.currentSurahId,
    surah,
    isUserInteracting,
    enterFullScreen,
    exitFullScreen,
  ]);

  // Auto-scroll to active verse
  useEffect(() => {
    if (
      !state.isPlaying ||
      state.currentSurahId !== Number(surah) ||
      state.currentVerseId === null ||
      isUserInteracting
    ) {
      return;
    }

    const currentVerseIndex = state.currentVerseId - 1;

    // Only scroll if we've moved to a different verse
    if (lastScrolledVerse.current === currentVerseIndex) {
      return;
    }

    const versePosition = versePositions.current[currentVerseIndex];

    if (versePosition !== undefined && scrollViewRef.current && viewportHeight > 0) {
      // Center the verse in the viewport
      const targetY = Math.max(0, versePosition - viewportHeight * 0.3);

      scrollViewRef.current.scrollTo({
        y: targetY,
        animated: true,
      });

      lastScrolledVerse.current = currentVerseIndex;
    }
  }, [
    state.isPlaying,
    state.currentSurahId,
    state.currentVerseId,
    surah,
    viewportHeight,
    isUserInteracting,
  ]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (userInteractionTimer.current) {
        clearTimeout(userInteractionTimer.current);
      }
    };
  }, []);

  // ============== Handlers ==============

  const saveVerseToStorage = async (surahNum: number, verseNum: number) => {
    try {
      const existingBookmarksString = await AsyncStorage.getItem('bookmarkedVerses');
      const bookmarks = existingBookmarksString ? JSON.parse(existingBookmarksString) : [];

      const isAlreadyBookmarked = bookmarks.some(
        (item: { surah: number; verse: number }) =>
          item.surah === surahNum && item.verse === verseNum,
      );

      if (!isAlreadyBookmarked) {
        bookmarks.push({
          surah: surahNum,
          verse: verseNum,
          addedAt: Date.now(),
        });
        await AsyncStorage.setItem('bookmarkedVerses', JSON.stringify(bookmarks));
        triggerHaptic();
      }
    } catch {
      // Silently fail
    }
  };

  const handleScroll = (event: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollHeight = event.nativeEvent.contentSize.height;
    const windowHeight = event.nativeEvent.layoutMeasurement.height;

    scrollYRef.current = scrollPosition;
    handleUserInteraction();

    if (scrollPosition + windowHeight > scrollHeight - 100) {
      setRenderCount((prevCount: number) => prevCount + 20);
    }
  };

  const handlePlaySurah = async () => {
    try {
      triggerHaptic();
      if (state.isPlaying && state.currentSurahId === Number(surah)) {
        await stop();
      } else {
        const startVerse = Number(verse) || 1;
        await playSurahFromVerse(Number(surah), startVerse);
      }
    } catch {
      // Silently fail
    }
  };

  const handlePlayVerse = async (verseIndex: number) => {
    try {
      triggerHaptic();
      await playVerse(Number(surah), verseIndex + 1, true);
    } catch {
      // Silently fail
    }
  };

  const showActionSheet = (verseIndex: number) => {
    triggerHaptic();
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
          triggerHaptic();
        }
      },
    );
  };

  const handleVerseLayout = (index: number, event: LayoutChangeEvent) => {
    versePositions.current[index] = event.nativeEvent.layout.y;
  };

  // ============== Verse Helpers ==============

  const isVerseActive = (verseIndex: number) => {
    return (
      state.currentSurahId === Number(surah) &&
      state.currentVerseId === verseIndex + 1 &&
      state.isPlaying
    );
  };

  const isCurrentVerse = (verseIndex: number) => {
    return state.currentSurahId === Number(surah) && state.currentVerseId === verseIndex + 1;
  };

  // ============== Gestures ==============

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      // Only allow downward swipe in fullscreen mode
      if (isFullScreen.value > 0.5 && event.translationY > 0) {
        gestureTranslateY.value = Math.min(event.translationY * 0.5, 100);
      }
    })
    .onEnd(event => {
      if (event.translationY > 80 && isFullScreen.value > 0.5) {
        // Exit fullscreen with swipe down
        exitFullScreen();
        runOnJS(handleUserInteraction)();
      }
      gestureTranslateY.value = withSpring(0, SPRING_CONFIG);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (isFullScreen.value > 0.5) {
      exitFullScreen();
      runOnJS(handleUserInteraction)();
    } else if (state.isPlaying && state.currentSurahId === Number(surah)) {
      enterFullScreen();
    }
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // ============== Animated Styles ==============

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: gestureTranslateY.value }],
  }));

  const frameContainerAnimatedStyle = useAnimatedStyle(() => {
    // In fullscreen, we need extra padding for decorative borders
    // Plus safe area inset at top when status bar is hidden
    const fullscreenTopPadding = FRAME_BORDER_TOP + insets.top;
    const fullscreenBottomPadding = FRAME_BORDER_BOTTOM;

    // In normal mode, just the frame borders
    const normalTopPadding = FRAME_BORDER_TOP;
    const normalBottomPadding = FRAME_BORDER_BOTTOM;

    return {
      paddingTop: interpolate(
        isFullScreen.value,
        [0, 1],
        [normalTopPadding, fullscreenTopPadding],
        Extrapolation.CLAMP,
      ),
      paddingBottom: interpolate(
        isFullScreen.value,
        [0, 1],
        [normalBottomPadding, fullscreenBottomPadding],
        Extrapolation.CLAMP,
      ),
      paddingHorizontal: FRAME_BORDER_HORIZONTAL,
    };
  });

  const miniPlayerSpacerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      isFullScreen.value,
      [0, 1],
      [0, isMiniPlayerVisible ? MINI_PLAYER_HEIGHT + 20 : 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Main content container needs to offset for the header when not fullscreen
  const mainContentAnimatedStyle = useAnimatedStyle(() => {
    const topOffset = interpolate(
      isFullScreen.value,
      [0, 1],
      [HEADER_HEIGHT_BASE + insets.top, 0],
      Extrapolation.CLAMP,
    );

    const bottomOffset = interpolate(
      isFullScreen.value,
      [0, 1],
      [0, isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0],
      Extrapolation.CLAMP,
    );

    return {
      marginTop: topOffset,
      marginBottom: bottomOffset,
    };
  });

  // ============== Render ==============

  const surahData = quran[Number(surah)];

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <StatusBar hidden={isFullScreen.value > 0.5} animated />

        {/* Animated Header */}
        <Animated.View style={[styles.headerWrapper, headerAnimatedStyle]}>
          <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.headerBackButton}
                onPress={() => {
                  triggerHaptic();
                  router.back();
                }}
              >
                <Svg width="9" height="19" viewBox="0 0 9 19" fill="none">
                  <Path
                    d={BACK_ARROW_PATH}
                    stroke="#065F46"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              <View style={styles.headerDetails}>
                <Text style={styles.headerTitle}>{surahData.name}</Text>
                <Text style={styles.headerSubtitle}>
                  {surahData.array.length} آيات — {surahData.type}
                </Text>
              </View>
              <TouchableOpacity style={styles.playButton} onPress={handlePlaySurah}>
                <Ionicons
                  name={
                    state.isPlaying && state.currentSurahId === Number(surah) ? 'pause' : 'play'
                  }
                  size={20}
                  color="#065F46"
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[styles.mainContentContainer, contentAnimatedStyle, mainContentAnimatedStyle]}
        >
          <ImageBackground
            source={require('../assets/images/quran-frame.png')}
            style={styles.frameContainer}
            resizeMode="stretch"
          >
            <Animated.View style={[styles.frameInnerContainer, frameContainerAnimatedStyle]}>
              <ScrollView
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ref={scrollViewRef}
                onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={handleUserInteraction}
              >
                <View style={styles.textContainer}>
                  {/* Surah Name Header */}
                  <View style={styles.surahHeaderContainer}>
                    <ImageBackground
                      source={require('../assets/images/Frame.png')}
                      style={styles.surahFrame}
                      resizeMode="contain"
                    >
                      <Text style={styles.surahNameInside}>{surahData.name}</Text>
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
                  <View
                    onLayout={_e => {
                      /* Container for measuring */
                    }}
                  >
                    <Text
                      style={[
                        styles.versesText,
                        {
                          fontSize: fontSize.size,
                          lineHeight: fontSize.lineHeight,
                        },
                      ]}
                    >
                      {surahData.array
                        .slice(0, renderCount)
                        .map((item: QuranVerse, index: number) => {
                          const words = String(item.ar || '')
                            .trim()
                            .split(/\s+/);
                          const active = isVerseActive(index);
                          const current = isCurrentVerse(index);
                          const durationMs = state.duration || 0;
                          const positionMs = state.position || 0;
                          const ratio =
                            durationMs > 0
                              ? Math.min(0.9999, Math.max(0, positionMs / durationMs))
                              : 0;
                          const remainingMs = Math.max(0, durationMs - positionMs);
                          const isAtVerseEnd =
                            durationMs > 0 && remainingMs <= HIGHLIGHT_END_THRESHOLD_MS;
                          const isAtVerseStart = ratio < 0.02;
                          const activeWordIndex =
                            active && current && !isAtVerseEnd && !isAtVerseStart
                              ? Math.min(words.length - 1, Math.floor(ratio * (words.length + 0.5)))
                              : -1;

                          const isWordActive = (i: number) =>
                            active &&
                            current &&
                            !isAtVerseEnd &&
                            !isAtVerseStart &&
                            i >= Math.max(0, activeWordIndex - 2) &&
                            i <= activeWordIndex &&
                            activeWordIndex >= 0;

                          const isWordHighlighted = (i: number) =>
                            active && current && i === activeWordIndex && activeWordIndex >= 0;

                          return (
                            <Text
                              key={index}
                              ref={r => (verseRefs.current[index] = r)}
                              onLongPress={() => showActionSheet(index)}
                              onLayout={e => handleVerseLayout(index, e)}
                              style={current && !active ? styles.currentVerse : undefined}
                            >
                              {words.map((w: string, i: number) => (
                                <Text
                                  key={`${index}-${i}`}
                                  style={[
                                    isWordActive(i) && styles.wordActive,
                                    isWordHighlighted(i) && styles.wordHighlighted,
                                  ]}
                                >
                                  {w}
                                  {i !== words.length - 1 && ' '}
                                </Text>
                              ))}
                              <Text style={{ fontFamily: 'System' }}>{'\u00A0'}</Text>
                              <InlineAyahNumber
                                verseNumber={index + 1}
                                size={fontSize.size * 0.9}
                              />
                              <Text style={{ fontFamily: 'System' }}>{'\u00A0'}</Text>
                            </Text>
                          );
                        })}
                    </Text>
                  </View>
                </View>

                {/* Mini Player Spacer */}
                <Animated.View style={miniPlayerSpacerStyle} />
                <View style={{ height: 40 }} />
              </ScrollView>
            </Animated.View>
          </ImageBackground>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerSafeArea: {
    backgroundColor: '#F5F5F5',
  },
  headerRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
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
  mainContentContainer: {
    flex: 1,
  },
  frameContainer: {
    flex: 1,
  },
  frameInnerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  textContainer: {
    width: '100%',
  },
  surahHeaderContainer: {
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 12,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  versesText: {
    textAlign: 'center',
    writingDirection: 'rtl',
    color: '#1F2937',
    fontFamily: 'AlMadina',
    includeFontPadding: false,
    paddingHorizontal: 0,
  },
  currentVerse: {
    color: '#065F46',
  },
  wordActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    color: '#065F46',
    borderRadius: 4,
  },
  wordHighlighted: {
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
    color: '#064E3B',
    fontWeight: '600',
  },
});
