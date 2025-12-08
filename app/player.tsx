import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import Slider from '@react-native-community/slider'; // معطل مؤقتاً
import quranDataImport from '../assets/Quran.json';
import recitersData from '../assets/reciters.json';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

const quranData = quranDataImport as any[];
const HIGHLIGHT_END_THRESHOLD_MS = 1750;

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function Player() {
  const {
    state,
    togglePlayPause,
    playNext,
    playPrevious,
    setPlaybackSpeed,
    setRepeatMode,
    setReciter,
  } = useAudioPlayer();

  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);

  if (state.currentSurahId === null || state.currentVerseId === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>لم يتم تشغيل أي شيء</Text>
          <Text style={styles.emptySubtext}>اذهب إلى صفحة القرآن لبدء الاستماع</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSurah = quranData[state.currentSurahId];
  const currentVerse = currentSurah.array[state.currentVerseId - 1];

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const repeatModes = [
    { value: 'none', label: 'لا تكرار', icon: 'repeat' },
    { value: 'verse', label: 'تكرار الآية', icon: 'repeat-outline' },
    { value: 'surah', label: 'تكرار السورة', icon: 'albums-outline' },
    { value: 'all', label: 'تكرار الكل', icon: 'infinite' },
  ];

  const currentRepeatMode = repeatModes.find(m => m.value === state.repeatMode);

  const handleRepeatToggle = () => {
    const currentIndex = repeatModes.findIndex(m => m.value === state.repeatMode);
    const nextIndex = (currentIndex + 1) % repeatModes.length;
    setRepeatMode(repeatModes[nextIndex].value as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#065F46" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>مشغل الصوت</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* بانر السورة */}
        <View style={styles.surahBanner}>
          <View style={styles.surahIconContainer}>
            <Ionicons name="book" size={48} color="#D4AF37" />
          </View>
          <Text style={styles.surahName}>{currentSurah.name}</Text>
          <Text style={styles.surahInfo}>
            {currentSurah.array.length} آية • {currentSurah.type}
          </Text>
        </View>

        {/* نص الآية */}
        <View style={styles.verseContainer}>
          <Text style={styles.verseNumber}>الآية {state.currentVerseId}</Text>
          <ScrollView style={styles.verseScrollView}>
            <Text style={styles.verseText}>
              {String(currentVerse.ar || '')
                .trim()
                .split(/\s+/)
                .map((w: string, i: number, arr: string[]) => {
                  const durationMs = state.duration || 0;
                  const positionMs = state.position || 0;
                  const ratio =
                    durationMs > 0 ? Math.min(0.9999, Math.max(0, positionMs / durationMs)) : 0;
                  // Don't highlight if we're at the very end or at the very beginning
                  const remainingMs = Math.max(0, durationMs - positionMs);
                  const isAtVerseEnd = durationMs > 0 && remainingMs <= HIGHLIGHT_END_THRESHOLD_MS;
                  const isAtVerseStart = ratio < 0.02;
                  const activeIndex =
                    state.isPlaying && !isAtVerseEnd && !isAtVerseStart
                      ? Math.min(arr.length - 1, Math.floor(ratio * (arr.length + 0.5)))
                      : -1;
                  const isActive =
                    state.isPlaying &&
                    !isAtVerseEnd &&
                    !isAtVerseStart &&
                    i >= activeIndex - 2 &&
                    i <= activeIndex;
                  return (
                    <Text key={i} style={isActive ? styles.wordActive : undefined}>
                      {w}
                      <Text> </Text>
                    </Text>
                  );
                })}
            </Text>
          </ScrollView>
        </View>

        {/* معلومات القارئ */}
        <TouchableOpacity style={styles.reciterButton} onPress={() => setShowReciterModal(true)}>
          <View style={styles.reciterInfo}>
            <Ionicons name="person" size={20} color="#065F46" />
            <Text style={styles.reciterName}>{state.currentReciter?.name || ''}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#065F46" />
        </TouchableOpacity>

        {/* شريط التقدم */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(state.position)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${state.duration > 0 ? (state.position / state.duration) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.timeText}>{formatTime(state.duration)}</Text>
        </View>

        {/* أزرار التحكم الرئيسية */}
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.secondaryControlButton} onPress={handleRepeatToggle}>
            <Ionicons
              name={currentRepeatMode?.icon as any}
              size={24}
              color={state.repeatMode !== 'none' ? '#065F46' : '#9CA3AF'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={playPrevious}>
            <Ionicons name="play-skip-forward" size={32} color="#065F46" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            {state.isLoading ? (
              <Ionicons name="hourglass" size={40} color="#fff" />
            ) : (
              <Ionicons name={state.isPlaying ? 'pause' : 'play'} size={40} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={playNext}>
            <Ionicons name="play-skip-back" size={32} color="#065F46" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryControlButton}
            onPress={() => setShowSpeedModal(true)}
          >
            <Text style={styles.speedText}>{state.playbackSpeed}x</Text>
          </TouchableOpacity>
        </View>

        {/* Modal اختيار السرعة */}
        <Modal
          visible={showSpeedModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSpeedModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSpeedModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>سرعة التشغيل</Text>
              {speedOptions.map(speed => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.modalOption,
                    state.playbackSpeed === speed && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      state.playbackSpeed === speed && styles.modalOptionTextSelected,
                    ]}
                  >
                    {speed}x
                  </Text>
                  {state.playbackSpeed === speed && (
                    <Ionicons name="checkmark" size={20} color="#065F46" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal اختيار القارئ */}
        <Modal
          visible={showReciterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReciterModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowReciterModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>اختر القارئ</Text>
              <ScrollView>
                {recitersData.reciters.map(reciter => (
                  <TouchableOpacity
                    key={reciter.id}
                    style={[
                      styles.modalOption,
                      state.currentReciterId === reciter.id && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setReciter(reciter.id);
                      setShowReciterModal(false);
                    }}
                  >
                    <View style={styles.reciterModalInfo}>
                      <Text
                        style={[
                          styles.modalOptionText,
                          state.currentReciterId === reciter.id && styles.modalOptionTextSelected,
                        ]}
                      >
                        {reciter.name}
                      </Text>
                      <Text style={styles.reciterQuality}>{reciter.quality}</Text>
                    </View>
                    {state.currentReciterId === reciter.id && (
                      <Ionicons name="checkmark" size={20} color="#065F46" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F0F9F8',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  content: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#065F46',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  surahBanner: {
    backgroundColor: '#065F46',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  surahIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  surahName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  surahInfo: {
    fontSize: 14,
    color: '#D4AF37',
  },
  verseContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 200,
  },
  verseNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  verseScrollView: {
    maxHeight: 200,
  },
  verseText: {
    fontSize: 24,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 40,
  },
  wordActive: {
    color: '#065F46',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  reciterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  reciterInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  reciterName: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#065F46',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 40,
  },
  mainControls: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F9F8',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#065F46',
    fontWeight: '600',
  },
  reciterModalInfo: {
    flex: 1,
  },
  reciterQuality: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
