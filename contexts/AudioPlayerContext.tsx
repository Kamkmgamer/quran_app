import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AudioService from '../services/AudioService';
import StorageService, { UserPreferences } from '../services/StorageService';
import quranDataImport from '../assets/Quran.json';
import recitersData from '../assets/reciters.json';

const quranData = quranDataImport as any[];

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
}

interface AudioPlayerContextType {
  state: AudioPlayerState;
  playVerse: (surahId: number, verseId: number, autoPlay?: boolean) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setRepeatMode: (mode: 'none' | 'verse' | 'surah' | 'all') => Promise<void>;
  setReciter: (reciterId: string) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  stop: () => Promise<void>;
  resumeLastPosition: () => Promise<void>;
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
  });

  // تحميل التفضيلات عند البدء
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadPreferences();
        setupAudioService();
      } catch (error) {
        console.error('Error initializing AudioPlayerContext:', error);
      }
    };
    
    initialize();
  }, []);

  // إعداد AudioService مع callback للتحديثات
  const setupAudioService = () => {
    try {
      AudioService.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setState((prev) => ({
            ...prev,
            isPlaying: status.isPlaying,
            position: status.positionMillis || 0,
            duration: status.durationMillis || 0,
          }));

          // التحقق من انتهاء التشغيل
          if (status.didJustFinish && !status.isLooping) {
            handleVerseFinished();
          }
        }
      });
    } catch (error) {
      console.error('Error setting up AudioService:', error);
    }
  };

  // تحميل التفضيلات المحفوظة
  const loadPreferences = async () => {
    const preferences = await StorageService.getPreferences();
    const reciter = recitersData.reciters.find((r) => r.id === preferences.selectedReciter);
    
    setState((prev) => ({
      ...prev,
      currentReciterId: preferences.selectedReciter,
      playbackSpeed: preferences.playbackSpeed,
      repeatMode: preferences.repeatMode,
      currentReciter: reciter || recitersData.reciters[0],
    }));
  };

  // معالجة انتهاء الآية
  const handleVerseFinished = async () => {
    if (state.repeatMode === 'verse') {
      // تكرار الآية
      if (state.currentSurahId && state.currentVerseId) {
        await playVerse(state.currentSurahId, state.currentVerseId, true);
      }
    } else if (state.repeatMode === 'surah' || state.repeatMode === 'all') {
      // تشغيل الآية التالية
      await playNext();
    }
  };

  // تشغيل آية محددة
  const playVerse = async (surahId: number, verseId: number, autoPlay: boolean = true) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const reciter = recitersData.reciters.find((r) => r.id === state.currentReciterId);
      if (!reciter) {
        throw new Error('Reciter not found');
      }

      await AudioService.loadAndPlayVerse(
        reciter.apiPath,
        reciter.id,
        surahId,
        verseId,
        autoPlay
      );

      setState((prev) => ({
        ...prev,
        currentSurahId: surahId,
        currentVerseId: verseId,
        isPlaying: autoPlay,
        isLoading: false,
        currentReciter: reciter,
      }));
    } catch (error) {
      console.error('Error playing verse:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // تشغيل/إيقاف
  const togglePlayPause = async () => {
    try {
      await AudioService.togglePlayPause();
      setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // تشغيل الآية التالية
  const playNext = async () => {
    if (!state.currentSurahId || state.currentVerseId === null) return;

    const surah = quranData[state.currentSurahId];
    if (!surah) return;

    const totalVerses = surah.array.length;
    let nextSurahId = state.currentSurahId;
    let nextVerseId = state.currentVerseId + 1;

    // التحقق من نهاية السورة
    if (nextVerseId > totalVerses) {
      if (state.repeatMode === 'surah') {
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
        await AudioService.stop();
        setState((prev) => ({ ...prev, isPlaying: false }));
        return;
      }
    }

    await playVerse(nextSurahId, nextVerseId, true);
  };

  // تشغيل الآية السابقة
  const playPrevious = async () => {
    if (!state.currentSurahId || state.currentVerseId === null) return;

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
      await AudioService.setPlaybackSpeed(speed);
      setState((prev) => ({ ...prev, playbackSpeed: speed }));

      // حفظ في التفضيلات
      const preferences = await StorageService.getPreferences();
      await StorageService.savePreferences({ ...preferences, playbackSpeed: speed });
    } catch (error) {
      console.error('Error setting playback speed:', error);
    }
  };

  // تغيير وضع التكرار
  const setRepeatMode = async (mode: 'none' | 'verse' | 'surah' | 'all') => {
    setState((prev) => ({ ...prev, repeatMode: mode }));

    // حفظ في التفضيلات
    const preferences = await StorageService.getPreferences();
    await StorageService.savePreferences({ ...preferences, repeatMode: mode });
  };

  // تغيير القارئ
  const setReciter = async (reciterId: string) => {
    const reciter = recitersData.reciters.find((r) => r.id === reciterId);
    if (!reciter) return;

    setState((prev) => ({
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
      await AudioService.seekTo(position);
      setState((prev) => ({ ...prev, position }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  // إيقاف
  const stop = async () => {
    try {
      await AudioService.stop();
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        position: 0,
      }));
    } catch (error) {
      console.error('Error stopping:', error);
    }
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
    } catch (error) {
      console.error('Error resuming last position:', error);
    }
  };

  const value: AudioPlayerContextType = {
    state,
    playVerse,
    togglePlayPause,
    playNext,
    playPrevious,
    setPlaybackSpeed,
    setRepeatMode,
    setReciter,
    seekTo,
    stop,
    resumeLastPosition,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

