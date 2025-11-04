import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AudioService, { VerseAudio } from '../AudioService';
import StorageService from '../StorageService';

// Mock the modules
jest.mock('expo-av');
jest.mock('expo-file-system');
jest.mock('../StorageService');

const mockAudio = Audio as jest.Mocked<typeof Audio>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('AudioService', () => {
  let audioService: AudioService;

  beforeEach(() => {
    jest.clearAllMocks();
    audioService = new AudioService();
  });

  describe('initializeAudio', () => {
    it('should set audio mode when not initialized', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue({} as any);

      // Access private method through type assertion
      await (audioService as any).initializeAudio();

      expect(mockAudio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });

    it('should not set audio mode when already initialized', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue({} as any);

      // Initialize first time
      await (audioService as any).initializeAudio();
      
      // Clear mock to track second call
      mockAudio.setAudioModeAsync.mockClear();

      // Initialize second time
      await (audioService as any).initializeAudio();

      expect(mockAudio.setAudioModeAsync).not.toHaveBeenCalled();
    });
  });

  describe('buildAudioUrl', () => {
    it('should build correct audio URL', () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const surahId = 1;
      const verseId = 5;

      const url = (audioService as any).buildAudioUrl(reciterPath, surahId, verseId);

      expect(url).toBe('https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001005.mp3');
    });

    it('should handle single digit surah and verse', () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const surahId = 1;
      const verseId = 1;

      const url = (audioService as any).buildAudioUrl(reciterPath, surahId, verseId);

      expect(url).toBe('https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3');
    });

    it('should handle double digit surah and verse', () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const surahId = 10;
      const verseId = 15;

      const url = (audioService as any).buildAudioUrl(reciterPath, surahId, verseId);

      expect(url).toBe('https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/010015.mp3');
    });
  });

  describe('loadAndPlayVerse', () => {
    const mockSound = {
      unloadAsync: jest.fn(),
      playAsync: jest.fn(),
      pauseAsync: jest.fn(),
      stopAsync: jest.fn(),
      setPositionAsync: jest.fn(),
      setRateAsync: jest.fn(),
      getStatusAsync: jest.fn(),
    };

    beforeEach(() => {
      mockAudio.Sound.createAsync.mockResolvedValue({
        sound: mockSound,
        status: { isLoaded: true, isPlaying: false },
      } as any);
      mockAudio.setAudioModeAsync.mockResolvedValue({} as any);
      mockStorageService.getLocalAudioPath.mockResolvedValue(null);
      mockStorageService.saveLastPosition.mockResolvedValue();
    });

    it('should load and play verse with autoPlay', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      await audioService.loadAndPlayVerse(reciterPath, reciterId, surahId, verseId, true);

      expect(mockAudio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001005.mp3' },
        { shouldPlay: true, rate: 1.0, shouldCorrectPitch: true },
        expect.any(Function)
      );
      expect(mockStorageService.saveLastPosition).toHaveBeenCalledWith({
        surahId: 1,
        verseId: 5,
        reciterId: 'abdul_basit',
        timestamp: expect.any(Number),
      });
    });

    it('should load verse without autoPlay', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      await audioService.loadAndPlayVerse(reciterPath, reciterId, surahId, verseId, false);

      expect(mockAudio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001005.mp3' },
        { shouldPlay: false, rate: 1.0, shouldCorrectPitch: true },
        expect.any(Function)
      );
    });

    it('should use local path when available', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;
      const localPath = '/mock/local/path/001005.mp3';

      mockStorageService.getLocalAudioPath.mockResolvedValue(localPath);

      await audioService.loadAndPlayVerse(reciterPath, reciterId, surahId, verseId, true);

      expect(mockAudio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: localPath },
        { shouldPlay: true, rate: 1.0, shouldCorrectPitch: true },
        expect.any(Function)
      );
    });

    it('should unload existing sound before loading new one', async () => {
      const existingSound = { unloadAsync: jest.fn() };
      (audioService as any).sound = existingSound;

      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      await audioService.loadAndPlayVerse(reciterPath, reciterId, surahId, verseId, true);

      expect(existingSound.unloadAsync).toHaveBeenCalled();
    });

    it('should handle errors during loading', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      mockAudio.Sound.createAsync.mockRejectedValue(new Error('Audio loading failed'));

      await expect(audioService.loadAndPlayVerse(reciterPath, reciterId, surahId, verseId, true))
        .rejects.toThrow('Audio loading failed');
    });
  });

  describe('playback controls', () => {
    const mockSound = {
      unloadAsync: jest.fn(),
      playAsync: jest.fn(),
      pauseAsync: jest.fn(),
      stopAsync: jest.fn(),
      setPositionAsync: jest.fn(),
      setRateAsync: jest.fn(),
      getStatusAsync: jest.fn(),
    };

    beforeEach(() => {
      (audioService as any).sound = mockSound;
    });

    it('should play audio', async () => {
      await audioService.play();

      expect(mockSound.playAsync).toHaveBeenCalled();
      expect((audioService as any).isPlaying).toBe(true);
    });

    it('should pause audio', async () => {
      await audioService.pause();

      expect(mockSound.pauseAsync).toHaveBeenCalled();
      expect((audioService as any).isPlaying).toBe(false);
    });

    it('should stop audio', async () => {
      await audioService.stop();

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect((audioService as any).isPlaying).toBe(false);
    });

    it('should toggle play/pause', async () => {
      (audioService as any).isPlaying = false;

      await audioService.togglePlayPause();

      expect(mockSound.playAsync).toHaveBeenCalled();
      expect((audioService as any).isPlaying).toBe(true);

      (audioService as any).isPlaying = true;

      await audioService.togglePlayPause();

      expect(mockSound.pauseAsync).toHaveBeenCalled();
      expect((audioService as any).isPlaying).toBe(false);
    });
  });

  describe('setPlaybackSpeed', () => {
    const mockSound = {
      setRateAsync: jest.fn(),
    };

    beforeEach(() => {
      (audioService as any).sound = mockSound;
      mockStorageService.getPreferences.mockResolvedValue({
        autoPlay: false,
        playbackSpeed: 1.0,
        repeatMode: 'none',
        selectedReciter: 'abdul_basit',
      });
      mockStorageService.savePreferences.mockResolvedValue();
    });

    it('should set playback speed', async () => {
      const speed = 1.5;

      await audioService.setPlaybackSpeed(speed);

      expect(mockSound.setRateAsync).toHaveBeenCalledWith(speed, true);
      expect((audioService as any).playbackSpeed).toBe(speed);
      expect(mockStorageService.savePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ playbackSpeed: speed })
      );
    });
  });

  describe('seekTo', () => {
    const mockSound = {
      setPositionAsync: jest.fn(),
    };

    beforeEach(() => {
      (audioService as any).sound = mockSound;
    });

    it('should seek to position', async () => {
      const position = 5000;

      await audioService.seekTo(position);

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(position);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', async () => {
      const mockSound = {
        unloadAsync: jest.fn(),
      };

      (audioService as any).sound = mockSound;
      (audioService as any).currentVerse = { surahId: 1, verseId: 1, reciterId: 'test', url: 'test' };
      (audioService as any).isPlaying = true;

      await audioService.cleanup();

      expect(mockSound.unloadAsync).toHaveBeenCalled();
      expect((audioService as any).sound).toBeNull();
      expect((audioService as any).currentVerse).toBeNull();
      expect((audioService as any).isPlaying).toBe(false);
    });
  });

  describe('getter methods', () => {
    it('should return current verse', () => {
      const mockVerse: VerseAudio = {
        surahId: 1,
        verseId: 5,
        reciterId: 'abdul_basit',
        url: 'test-url',
      };

      (audioService as any).currentVerse = mockVerse;

      expect(audioService.getCurrentVerse()).toEqual(mockVerse);
    });

    it('should return isPlaying status', () => {
      (audioService as any).isPlaying = true;

      expect(audioService.getIsPlaying()).toBe(true);
    });

    it('should return playback speed', () => {
      (audioService as any).playbackSpeed = 1.5;

      expect(audioService.getPlaybackSpeed()).toBe(1.5);
    });
  });

  describe('preloadVerse', () => {
    beforeEach(() => {
      mockStorageService.downloadAudioFile.mockResolvedValue('/mock/path');
    });

    it('should preload verse successfully', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      const result = await audioService.preloadVerse(reciterPath, reciterId, surahId, verseId);

      expect(result).toBe(true);
      expect(mockStorageService.downloadAudioFile).toHaveBeenCalledWith(
        'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001005.mp3',
        reciterId,
        surahId,
        verseId,
        undefined
      );
    });

    it('should handle preload failure', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      mockStorageService.downloadAudioFile.mockResolvedValue(null);

      const result = await audioService.preloadVerse(reciterPath, reciterId, surahId, verseId);

      expect(result).toBe(false);
    });
  });

  describe('downloadSurah', () => {
    beforeEach(() => {
      jest.spyOn(audioService, 'preloadVerse').mockResolvedValue(true);
    });

    it('should download entire surah', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const totalVerses = 7;
      const onProgress = jest.fn();

      const result = await audioService.downloadSurah(reciterPath, reciterId, surahId, totalVerses, onProgress);

      expect(result).toBe(true);
      expect(audioService.preloadVerse).toHaveBeenCalledTimes(7);
      expect(onProgress).toHaveBeenCalledTimes(7);
    });

    it('should handle download failure for individual verses', async () => {
      const reciterPath = 'Abdul_Basit_Murattal_192kbps';
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const totalVerses = 3;

      jest.spyOn(audioService, 'preloadVerse')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await audioService.downloadSurah(reciterPath, reciterId, surahId, totalVerses);

      expect(result).toBe(true); // Still returns true even if some verses fail
    });
  });
});
