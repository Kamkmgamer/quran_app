import AsyncStorage from '@react-native-async-storage/async-storage';

import PrayerTimesService from '../PrayerTimesService';

// Mock fetch
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('PrayerTimesService', () => {
  const mockCoordinates = {
    latitude: 24.7136,
    longitude: 46.6753,
  };

  const mockPrayerTimesResponse = {
    code: 200,
    status: 'OK',
    data: {
      timings: {
        Fajr: '05:30',
        Sunrise: '06:45',
        Dhuhr: '12:00',
        Asr: '15:30',
        Maghrib: '18:15',
        Isha: '19:45',
      },
      date: {
        readable: '04 Nov 2025',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrayerTimes', () => {
    it('should fetch prayer times from API when cache is empty', async () => {
      // Mock empty cache
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      });

      const result = await PrayerTimesService.getPrayerTimes(mockCoordinates);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.aladhan.com/v1/timings/'),
      );
      expect(result).toEqual({
        fajr: '05:30',
        sunrise: '06:45',
        dhuhr: '12:00',
        asr: '15:30',
        maghrib: '18:15',
        isha: '19:45',
        date: '04 Nov 2025',
        timestamp: expect.any(Number),
      });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return cached data when cache is valid', async () => {
      const cachedData = {
        '24.7136,46.6753,method_5': {
          data: {
            fajr: '05:30',
            sunrise: '06:45',
            dhuhr: '12:00',
            asr: '15:30',
            maghrib: '18:15',
            isha: '19:45',
            date: '04 Nov 2025',
            timestamp: Date.now() - 1000000, // 1 hour ago (within cache duration)
          },
          timestamp: Date.now() - 1000000,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const result = await PrayerTimesService.getPrayerTimes(mockCoordinates);

      expect(fetch).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData['24.7136,46.6753,method_5'].data);
    });

    it('should fetch from API when cache is expired', async () => {
      const expiredCache = {
        '24.7136,46.6753,method_5': {
          data: {
            fajr: '05:30',
            sunrise: '06:45',
            dhuhr: '12:00',
            asr: '15:30',
            maghrib: '18:15',
            isha: '19:45',
            date: '04 Nov 2025',
            timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago (expired)
          },
          timestamp: Date.now() - 3 * 60 * 60 * 1000,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredCache));

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      });

      const result = await PrayerTimesService.getPrayerTimes(mockCoordinates);

      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual({
        fajr: '05:30',
        sunrise: '06:45',
        dhuhr: '12:00',
        asr: '15:30',
        maghrib: '18:15',
        isha: '19:45',
        date: '04 Nov 2025',
        timestamp: expect.any(Number),
      });
    });

    it('should return stale cache when API fails', async () => {
      const staleCache = {
        '24.7136,46.6753,method_5': {
          data: {
            fajr: '05:30',
            sunrise: '06:45',
            dhuhr: '12:00',
            asr: '15:30',
            maghrib: '18:15',
            isha: '19:45',
            date: '04 Nov 2025',
            timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago (stale)
          },
          timestamp: Date.now() - 3 * 60 * 60 * 1000,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(staleCache));

      // Mock API failure
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await PrayerTimesService.getPrayerTimes(mockCoordinates);

      expect(result).toEqual(staleCache['24.7136,46.6753,method_5'].data);
    });

    it('should throw error when both API and cache fail', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(PrayerTimesService.getPrayerTimes(mockCoordinates))
        .rejects.toThrow('Network error');
    });

    it('should handle API error responses', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const errorResponse = {
        code: 400,
        status: 'Bad Request',
        data: 'Invalid coordinates',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(PrayerTimesService.getPrayerTimes(mockCoordinates))
        .rejects.toThrow('API returned error: Invalid coordinates');
    });
  });

  describe('getPrayerTimesForDate', () => {
    it('should fetch prayer times for specific date', async () => {
      const specificDate = new Date('2025-12-25');

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      });

      const result = await PrayerTimesService.getPrayerTimesForDate(mockCoordinates, specificDate);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('timings/25-12-2025'),
      );
      expect(result.date).toBe('04 Nov 2025');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      await PrayerTimesService.clearCache();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('prayer_times_cache');
    });
  });

  describe('cache key generation', () => {
    it('should generate consistent cache keys for similar coordinates', async () => {
      const coords1 = { latitude: 24.713551, longitude: 46.675299 };
      const coords2 = { latitude: 24.7136, longitude: 46.6753 };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      });

      await PrayerTimesService.getPrayerTimes(coords1);
      const firstCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await PrayerTimesService.getPrayerTimes(coords2);
      const secondCall = (AsyncStorage.setItem as jest.Mock).mock.calls[1];

      // Both should use the same cache key due to rounding and method
      expect(firstCall[0]).toBe(secondCall[0]);
      expect(firstCall[0]).toBe('prayer_times_cache');
      // The cache key should include method_5 by default
      expect(JSON.parse(firstCall[1])).toHaveProperty('24.7136,46.6753,method_5');
    });
  });
});
