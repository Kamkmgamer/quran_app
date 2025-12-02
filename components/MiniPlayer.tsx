import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
} from 'react-native';

import quranDataImport from '../assets/Quran.json';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MiniPlayerProps {
  embedded?: boolean;
}

const quranData = quranDataImport as any[];
const { width } = Dimensions.get('window');

const MiniPlayer: React.FC<MiniPlayerProps> = ({ embedded = false }) => {
  const { state, togglePlayPause, playNext, playPrevious, closePlayer } = useAudioPlayer();
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Determine if player should be shown
  const isOnQuranScreen = pathname === '/quran' || pathname === '/quran/';
  const shouldShow = isOnQuranScreen;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(shouldShow);
  }, [shouldShow]);

  if (!isVisible && !shouldShow) {
    return null;
  }

  const hasCurrentTrack =
    state.currentSurahId !== null &&
    state.currentSurahId >= 0 &&
    state.currentSurahId < quranData.length &&
    state.currentVerseId !== null;

  const currentSurah =
    hasCurrentTrack && state.currentSurahId !== null
      ? quranData[state.currentSurahId]
      : null;
  const surahName = currentSurah?.name || '';
  const verseLabel = hasCurrentTrack ? `آية ${state.currentVerseId}` : 'لا يوجد تشغيل حالي';

  const handlePress = () => {
    router.push('/player');
  };

  const handleClose = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await closePlayer();
  };

  // Render content based on platform support for Blur
  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: 80, tint: 'light' as const } : {};

  return (
    <View style={[styles.wrapper, !embedded && styles.floatingWrapper]}>
      <Container
        {...containerProps}
        style={[
          styles.container,
          embedded ? styles.embeddedContainer : styles.floatingContainer,
          Platform.OS === 'android' && styles.androidContainer,
        ]}
      >
        {/* Progress Bar Background */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${state.duration > 0 ? (state.position / state.duration) * 100 : 0}%`,
              },
            ]}
          />
        </View>

        <Pressable onPress={handlePress} style={styles.content}>
          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="musical-note" size={20} color="#065F46" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.surahName} numberOfLines={1}>
                {surahName}
              </Text>
              <Text style={styles.verseInfo} numberOfLines={1}>
                {verseLabel} • {state.currentReciter?.name || ''}
              </Text>
            </View>
          </View>

          {/* Controls Section */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={playPrevious} style={styles.iconButton}>
              <Ionicons name="play-skip-forward" size={22} color="#065F46" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <Ionicons name={state.isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={playNext} style={styles.iconButton}>
              <Ionicons name="play-skip-back" size={22} color="#065F46" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  floatingWrapper: {
    position: 'absolute',
    bottom: 20, // Lifted up slightly for better look
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: width - 32, // Floating card effect
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
  },
  androidContainer: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  embeddedContainer: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  floatingContainer: {
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  surahName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 2,
    textAlign: 'right',
  },
  verseInfo: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  iconButton: {
    padding: 4,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
});

export default MiniPlayer;
