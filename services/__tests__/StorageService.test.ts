import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import StorageService, { LastPosition, UserPreferences, DownloadedAudio } from '../StorageService';

// Mock the modules
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-file-system');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveLastPosition', () => {
    it('should save last position to AsyncStorage', async () => {
      const mockPosition: LastPosition = {
        surahId: 1,
        verseId: 5,
        reciterId: 'abdul_basit',
        timestamp: Date.now(),
      };

      await StorageService.saveLastPosition(mockPosition);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@quran_last_position',
        JSON.stringify(mockPosition),
      );
    });

    it('should handle errors when saving last position', async () => {
      const mockPosition: LastPosition = {
        surahId: 1,
        verseId: 5,
        reciterId: 'abdul_basit',
        timestamp: Date.now(),
      };

      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw error
      await expect(StorageService.saveLastPosition(mockPosition)).resolves.toBeUndefined();
    });
  });

  describe('getLastPosition', () => {
    it('should retrieve last position from AsyncStorage', async () => {
      const mockPosition: LastPosition = {
        surahId: 1,
        verseId: 5,
        reciterId: 'abdul_basit',
        timestamp: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPosition));

      const result = await StorageService.getLastPosition();

      expect(result).toEqual(mockPosition);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@quran_last_position');
    });

    it('should return null when no position is saved', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getLastPosition();

      expect(result).toBeNull();
    });

    it('should handle errors when retrieving last position', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getLastPosition();

      expect(result).toBeNull();
    });
  });

  describe('savePreferences', () => {
    it('should save preferences to AsyncStorage', async () => {
      const mockPreferences: UserPreferences = {
        autoPlay: true,
        playbackSpeed: 1.5,
        repeatMode: 'verse',
        selectedReciter: 'maher_almuaiqly',
      };

      await StorageService.savePreferences(mockPreferences);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@quran_preferences',
        JSON.stringify(mockPreferences),
      );
    });

    it('should handle errors when saving preferences', async () => {
      const mockPreferences: UserPreferences = {
        autoPlay: false,
        playbackSpeed: 1.0,
        repeatMode: 'none',
        selectedReciter: 'abdul_basit',
      };

      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(StorageService.savePreferences(mockPreferences)).resolves.toBeUndefined();
    });
  });

  describe('getPreferences', () => {
    it('should retrieve preferences from AsyncStorage', async () => {
      const mockPreferences: UserPreferences = {
        autoPlay: true,
        playbackSpeed: 1.5,
        repeatMode: 'verse',
        selectedReciter: 'maher_almuaiqly',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await StorageService.getPreferences();

      expect(result).toEqual(mockPreferences);
    });

    it('should return default preferences when none are saved', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getPreferences();

      expect(result).toEqual({
        autoPlay: false,
        playbackSpeed: 1.0,
        repeatMode: 'none',
        selectedReciter: 'abdul_basit',
      });
    });

    it('should handle errors when retrieving preferences', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getPreferences();

      expect(result).toEqual({
        autoPlay: false,
        playbackSpeed: 1.0,
        repeatMode: 'none',
        selectedReciter: 'abdul_basit',
      });
    });
  });

  describe('saveDownloadedAudio', () => {
    it('should save downloaded audio information', async () => {
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const size = 1024;

      const existingData: DownloadedAudio = {
        'abdul_basit': {
          surahs: [2, 3],
          totalSize: 2048,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingData));

      await StorageService.saveDownloadedAudio(reciterId, surahId, size);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@quran_downloaded_audio',
        JSON.stringify({
          'abdul_basit': {
            surahs: [2, 3, 1],
            totalSize: 3072,
          },
        }),
      );
    });

    it('should create new entry when reciter does not exist', async () => {
      const reciterId = 'new_reciter';
      const surahId = 1;
      const size = 1024;

      mockAsyncStorage.getItem.mockResolvedValue(null);

      await StorageService.saveDownloadedAudio(reciterId, surahId, size);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@quran_downloaded_audio',
        JSON.stringify({
          'new_reciter': {
            surahs: [1],
            totalSize: 1024,
          },
        }),
      );
    });
  });

  describe('getDownloadedAudio', () => {
    it('should retrieve downloaded audio information', async () => {
      const mockData: DownloadedAudio = {
        'abdul_basit': {
          surahs: [1, 2, 3],
          totalSize: 3072,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.getDownloadedAudio();

      expect(result).toEqual(mockData);
    });

    it('should return empty object when no data is saved', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getDownloadedAudio();

      expect(result).toEqual({});
    });
  });

  describe('isSurahDownloaded', () => {
    it('should return true when surah is downloaded', async () => {
      const mockData: DownloadedAudio = {
        'abdul_basit': {
          surahs: [1, 2, 3],
          totalSize: 3072,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.isSurahDownloaded('abdul_basit', 2);

      expect(result).toBe(true);
    });

    it('should return false when surah is not downloaded', async () => {
      const mockData: DownloadedAudio = {
        'abdul_basit': {
          surahs: [1, 2, 3],
          totalSize: 3072,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.isSurahDownloaded('abdul_basit', 4);

      expect(result).toBe(false);
    });

    it('should return false when reciter does not exist', async () => {
      const mockData: DownloadedAudio = {
        'abdul_basit': {
          surahs: [1, 2, 3],
          totalSize: 3072,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.isSurahDownloaded('nonexistent_reciter', 1);

      expect(result).toBe(false);
    });
  });

  describe('getLocalAudioPath', () => {
    it('should return correct local audio path', async () => {
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;
      const expectedPath = '/mock/documents/audio/abdul_basit/001005.mp3';

      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);

      const result = await StorageService.getLocalAudioPath(reciterId, surahId, verseId);

      expect(result).toBe(expectedPath);
      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(expectedPath);
    });

    it('should return null when file does not exist', async () => {
      const reciterId = 'abdul_basit';
      const surahId = 1;
      const verseId = 5;

      mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);

      const result = await StorageService.getLocalAudioPath(reciterId, surahId, verseId);

      expect(result).toBeNull();
    });
  });

  describe('getUsedSpace', () => {
    it('should calculate total used space correctly', async () => {
      const mockData: DownloadedAudio = {
        'abdul_basit': {
          surahs: [1, 2, 3],
          totalSize: 3072,
        },
        'maher_almuaiqly': {
          surahs: [1, 2],
          totalSize: 2048,
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.getUsedSpace();

      expect(result).toBe(5120); // 3072 + 2048
    });

    it('should return 0 when no audio is downloaded', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{}');

      const result = await StorageService.getUsedSpace();

      expect(result).toBe(0);
    });
  });
});
