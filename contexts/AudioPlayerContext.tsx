import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';

import quranDataImport from '../assets/Quran.json';
import recitersData from '../assets/reciters.json';
import AudioService from '../services/AudioService';
import StorageService from '../services/StorageService';

const quranData = quranDataImport as any[];
const audioService = new AudioService();

// Early-next behavior tuning:
// - We only jump early when most of the file has played (to avoid
//   cutting the recitation itself).
// - We still keep a small fixed window to trim trailing silence.
const EARLY_NEXT_BASE_THRESHOLD_MS = 1500; // max remaining time to allow early-next
const EARLY_NEXT_MIN_PROGRESS_RATIO = 0.85; // must have played at least 85% of the file

interface Reciter {
  id: string;
  name: string;
  name_en: string;
  apiPath: string;
  quality: string;
  style: string;
  subfolder: string;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentSurahId: number | null;
  currentVerseId: number | null;
  currentReciterId: string;
  playbackSpeed: number;
  repeatMode: 'none' | 'verse' | 'surah' | 'all';
  position: number;
  duration: number;
  isLoading: boolean;
  currentReciter: Reciter | null;
  isPlayingSurah: boolean;
}

interface AudioPlayerContextType {
  state: AudioPlayerState;
  playVerse: (surahId: number, verseId: number, autoPlay?: boolean) => Promise<void>;
  playSurahFromVerse: (surahId: number, startVerseId: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setRepeatMode: (mode: 'none' | 'verse' | 'surah' | 'all') => Promise<void>;
  setReciter: (reciterId: string) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  stop: () => Promise<void>;
  resumeLastPosition: () => Promise<void>;
  closePlayer: () => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentSurahId: null,
    currentVerseId: null,
    currentReciterId: 'abdul_basit',
    playbackSpeed: 1.0,
    repeatMode: 'none',
    position: 0,
    duration: 0,
    isLoading: false,
    currentReciter: null,
    isPlayingSurah: false,
  });
  const isLoadingRef = useRef(false);
  const earlyNextTriggeredRef = useRef(false);

  const preloadNextVerseAudio = useCallback(
    async (surahId: number, verseId: number, reciter: Reciter) => {
      const surah = quranData[surahId];
      if (!surah) {
        return;
      }

      const totalVerses = surah.array.length;
      if (verseId >= totalVerses) {
        return;
      }

      try {
        await audioService.preloadVerse(reciter.apiPath, reciter.id, surahId, verseId + 1);
      } catch (error) {}
    },
    [],
  );

  // تحميل التفضيلات المحفوظة
  const loadPreferences = useCallback(async () => {
    const preferences = await StorageService.getPreferences();
    const reciter = recitersData.reciters.find(r => r.id === preferences.selectedReciter);

    setState(prev => ({
      ...prev,
      currentReciterId: preferences.selectedReciter,
      playbackSpeed: preferences.playbackSpeed,
      repeatMode: preferences.repeatMode,
      currentReciter: reciter || recitersData.reciters[0],
    }));
  }, []);

  // تشغيل آية محددة
  const playVerse = useCallback(
    async (surahId: number, verseId: number, autoPlay: boolean = true) => {
      if (isLoadingRef.current) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setState(prev => ({ ...prev, isLoading: true }));

        const reciter = recitersData.reciters.find(r => r.id === state.currentReciterId);
        if (!reciter) {
          throw new Error('Reciter not found');
        }

        // reset early-next trigger for the new verse
        earlyNextTriggeredRef.current = false;

        await audioService.loadAndPlayVerse(
          reciter.apiPath,
          reciter.id,
          surahId,
          verseId,
          autoPlay,
        );

        // pre-buffer the next verse audio (download to local storage) when auto-playing
        if (autoPlay) {
          preloadNextVerseAudio(surahId, verseId, reciter);
        }

        setState(prev => ({
          ...prev,
          currentSurahId: surahId,
          currentVerseId: verseId,
          isPlaying: autoPlay,
          isLoading: false,
          currentReciter: reciter,
        }));
      } catch (error) {
        console.error('Error playing verse:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        isLoadingRef.current = false;
      }
    },
    [state.currentReciterId, preloadNextVerseAudio],
  );

  // تشغيل السورة من آية محددة إلى النهاية
  const playSurahFromVerse = useCallback(
    async (surahId: number, startVerseId: number) => {
      try {
        setState(prev => ({ ...prev, isPlayingSurah: true }));
        await playVerse(surahId, startVerseId, true);
      } catch (error) {
        setState(prev => ({ ...prev, isPlayingSurah: false }));
      }
    },
    [playVerse],
  );

  // تشغيل الآية التالية
  const playNext = useCallback(async () => {
    if (
      state.currentSurahId === null ||
      state.currentSurahId === undefined ||
      state.currentVerseId === null
    ) {
      return;
    }

    const surah = quranData[state.currentSurahId];
    if (!surah) return;

    const totalVerses = surah.array.length;
    let nextSurahId = state.currentSurahId;
    let nextVerseId = state.currentVerseId + 1;

    // التحقق من نهاية السورة
    if (nextVerseId > totalVerses) {
      if (state.isPlayingSurah) {
        // إيقاف التشغيل عند نهاية السورة في وضع التشغيل المستمر
        await audioService.stop();
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPlayingSurah: false,
        }));
        return;
      } else if (state.repeatMode === 'surah') {
        // العودة لأول السورة
        nextVerseId = 1;
      } else if (state.repeatMode === 'all') {
        // الانتقال للسورة التالية
        nextSurahId = state.currentSurahId + 1;
        if (nextSurahId >= quranData.length) {
          nextSurahId = 0; // العودة لأول سورة
        }
        nextVerseId = 1;
      } else {
        // إيقاف التشغيل
        await audioService.stop();
        setState(prev => ({ ...prev, isPlaying: false, isPlayingSurah: false }));
        return;
      }
    }

    await playVerse(nextSurahId, nextVerseId, true);
  }, [
    state.currentSurahId,
    state.currentVerseId,
    state.repeatMode,
    state.isPlayingSurah,
    playVerse,
  ]);

  // إعداد AudioService مع callback للتحديثات
  const setupAudioService = useCallback(() => {
    try {
      audioService.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          const position = status.positionMillis || 0;
          const duration = status.durationMillis || 0;

          setState(prev => ({
            ...prev,
            isPlaying: status.isPlaying,
            position,
            duration,
          }));

          // Early trigger: start the next verse slightly before the current one ends.
          // To avoid cutting recitation, we require both:
          // - high playback progress (e.g. > 85% of file duration);
          // - and a small remaining time window.
          if (!status.didJustFinish && !status.isLooping && duration > 0) {
            const remaining = duration - position;
            const progressRatio = duration > 0 ? position / duration : 0;

            if (
              progressRatio >= EARLY_NEXT_MIN_PROGRESS_RATIO &&
              remaining <= EARLY_NEXT_BASE_THRESHOLD_MS &&
              !earlyNextTriggeredRef.current
            ) {
              earlyNextTriggeredRef.current = true;

              setState(currentState => {
                const handleEarlyNext = async () => {
                  if (
                    currentState.repeatMode === 'surah' ||
                    currentState.repeatMode === 'all' ||
                    currentState.isPlayingSurah
                  ) {
                    await playNext();
                  }
                };

                // Execute async logic
                handleEarlyNext();

                return currentState; // Return current state unchanged
              });
            }
          }

          // التحقق من انتهاء التشغيل - use current state from setState callback
          if (status.didJustFinish && !status.isLooping) {
            // Use setState callback to get current state
            setState(currentState => {
              // Handle verse finished logic with current state
              const handleVerseEnd = async () => {
                if (currentState.repeatMode === 'verse') {
                  // تكرار الآية
                  if (currentState.currentSurahId && currentState.currentVerseId) {
                    await playVerse(currentState.currentSurahId, currentState.currentVerseId, true);
                  }
                } else if (
                  currentState.repeatMode === 'surah' ||
                  currentState.repeatMode === 'all' ||
                  currentState.isPlayingSurah
                ) {
                  // تشغيل الآية التالية (في حال لم يتم تشغيلها مبكراً)
                  if (!earlyNextTriggeredRef.current) {
                    await playNext();
                  }
                }
              };

              // Execute async logic
              handleVerseEnd();

              return currentState; // Return current state unchanged
            });
          }
        }
      });
    } catch (error) {}
  }, [playVerse, playNext]);

  // تحميل التفضيلات عند البدء
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadPreferences();
        setupAudioService();
      } catch (error) {}
    };

    initialize();
  }, [loadPreferences, setupAudioService]);

  // تشغيل/إيقاف
  const togglePlayPause = async () => {
    try {
      await audioService.togglePlayPause();
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    } catch (error) {}
  };

  // تشغيل الآية السابقة
  const playPrevious = async () => {
    if (
      state.currentSurahId === null ||
      state.currentSurahId === undefined ||
      state.currentVerseId === null
    )
      return;

    let prevSurahId = state.currentSurahId;
    let prevVerseId = state.currentVerseId - 1;

    // التحقق من بداية السورة
    if (prevVerseId < 1) {
      if (state.repeatMode === 'all') {
        // الانتقال للسورة السابقة
        prevSurahId = state.currentSurahId - 1;
        if (prevSurahId < 0) {
          prevSurahId = quranData.length - 1; // الذهاب لآخر سورة
        }
        const prevSurah = quranData[prevSurahId];
        prevVerseId = prevSurah.array.length;
      } else {
        // البقاء في أول آية
        prevVerseId = 1;
      }
    }

    await playVerse(prevSurahId, prevVerseId, true);
  };

  // تغيير سرعة التشغيل
  const setPlaybackSpeed = async (speed: number) => {
    try {
      await audioService.setPlaybackSpeed(speed);
      setState(prev => ({ ...prev, playbackSpeed: speed }));

      // حفظ في التفضيلات
      const preferences = await StorageService.getPreferences();
      await StorageService.savePreferences({ ...preferences, playbackSpeed: speed });
    } catch (error) {
      console.error('Error setting playback speed:', error);
    }
  };

  // تغيير وضع التكرار
  const setRepeatMode = async (mode: 'none' | 'verse' | 'surah' | 'all') => {
    setState(prev => ({ ...prev, repeatMode: mode }));

    // حفظ في التفضيلات
    const preferences = await StorageService.getPreferences();
    await StorageService.savePreferences({ ...preferences, repeatMode: mode });
  };

  // تغيير القارئ
  const setReciter = async (reciterId: string) => {
    const reciter = recitersData.reciters.find(r => r.id === reciterId);
    if (!reciter) return;

    setState(prev => ({
      ...prev,
      currentReciterId: reciterId,
      currentReciter: reciter,
    }));

    // حفظ في التفضيلات
    const preferences = await StorageService.getPreferences();
    await StorageService.savePreferences({ ...preferences, selectedReciter: reciterId });

    // إعادة تحميل الآية الحالية بالقارئ الجديد
    if (state.currentSurahId && state.currentVerseId !== null) {
      await playVerse(state.currentSurahId, state.currentVerseId, state.isPlaying);
    }
  };

  // الانتقال لموضع معين
  const seekTo = async (position: number) => {
    try {
      await audioService.seekTo(position);
      setState(prev => ({ ...prev, position }));
    } catch (error) {}
  };

  // إيقاف
  const stop = async () => {
    try {
      await audioService.stop();
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPlayingSurah: false,
        position: 0,
      }));
    } catch (error) {}
  };

  // استئناف آخر موضع
  const resumeLastPosition = async () => {
    try {
      const lastPosition = await StorageService.getLastPosition();
      if (lastPosition) {
        // تحديث القارئ إذا كان مختلفاً
        if (lastPosition.reciterId !== state.currentReciterId) {
          await setReciter(lastPosition.reciterId);
        }

        await playVerse(lastPosition.surahId, lastPosition.verseId, false);
      }
    } catch (error) {}
  };

  const value: AudioPlayerContextType = {
    state,
    playVerse,
    playSurahFromVerse,
    togglePlayPause,
    playNext,
    playPrevious,
    setPlaybackSpeed,
    setRepeatMode,
    setReciter,
    seekTo,
    stop,
    resumeLastPosition,
    closePlayer: async () => {
      await stop();
      setState(prev => ({
        ...prev,
        currentSurahId: null,
        currentVerseId: null,
        currentReciter: null,
      }));
    },
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};
