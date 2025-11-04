import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useRouter } from 'expo-router';
import quranDataImport from '../assets/Quran.json';

const quranData = quranDataImport as any[];

const MiniPlayer: React.FC = () => {
  const { state, togglePlayPause, playNext, playPrevious } = useAudioPlayer();
  const router = useRouter();

  // عدم عرض المشغل إذا لم يكن هناك تشغيل حالي
  if (state.currentSurahId === null || state.currentVerseId === null) {
    return null;
  }

  const currentSurah = quranData[state.currentSurahId];
  const surahName = currentSurah?.name || '';

  const handlePress = () => {
    router.push('/player');
  };

  return (
    <View style={styles.container} testID="mini-player">
      <Pressable onPress={handlePress} style={styles.content} testID="mini-player-content">
        {/* معلومات التشغيل */}
        <View style={styles.info}>
          <Text style={styles.surahName} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={styles.verseInfo} numberOfLines={1}>
            آية {state.currentVerseId} • {state.currentReciter?.name || ''}
          </Text>
        </View>

        {/* أزرار التحكم */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={playPrevious} style={styles.controlButton} testID="previous-button">
            <Ionicons name="play-skip-forward" size={20} color="#065F46" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={[styles.controlButton, styles.playButton]}
            testID="play-pause-button"
          >
            <Ionicons
              name={state.isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.controlButton} testID="next-button">
            <Ionicons name="play-skip-back" size={20} color="#065F46" />
          </TouchableOpacity>
        </View>

        {/* زر فتح المشغل الكامل */}
        <TouchableOpacity onPress={handlePress} style={styles.expandButton}>
          <Ionicons name="chevron-up" size={20} color="#065F46" />
        </TouchableOpacity>
      </Pressable>

      {/* شريط التقدم */}
      {state.duration > 0 && (
        <View style={styles.progressBar} testID="progress-bar">
          <View
            style={[
              styles.progressFill,
              {
                width: `${(state.position / state.duration) * 100}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 2,
  },
  verseInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#065F46',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  expandButton: {
    marginLeft: 8,
    padding: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#065F46',
  },
});

export default MiniPlayer;

