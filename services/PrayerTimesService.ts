import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  timestamp: number;
  method: {
    id: number;
    name: string;
    params: {
      Fajr: number | string;
      Isha: number | string;
      Maghrib?: number | string;
    };
  };
  location?: {
    name: string;
    country: string;
    coordinates: Coordinates;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CalculationMethod {
  id: number;
  name: string;
  params: {
    Fajr: number | string;
    Isha: number | string;
    Maghrib?: number | string;
  };
}

export interface PrayerInfo {
  arabic: string;
  english: string;
  icon: string;
  order: number;
}

export interface PrayerConfig {
  prayers: PrayerInfo[];
  method: {
    id: number;
    name: string;
    params: {
      Fajr: number | string;
      Isha: number | string;
      Maghrib?: number | string;
    };
  };
}

export enum CalculationMethods {
  EGYPT = 5,
  MAKKAH = 4,
  MUSLIM_WORLD_LEAGUE = 3,
  ISNA = 2,
  KARACHI = 1,
  GULF = 8,
  KUWAIT = 9,
  MOONSIGHTING = 15,
  DUBAI = 16,
}

class PrayerTimesService {
  private readonly API_BASE_URL = 'https://api.aladhan.com/v1';
  private readonly CACHE_KEY = 'prayer_times_cache';
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  private async getLocationName(coordinates: Coordinates): Promise<{ name: string; country: string }> {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&accept-language=ar`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || '';
        const country = data.address.country || '';
        return {
          name: city || 'موقع غير معروف',
          country: country || '',
        };
      }

      return { name: 'موقع غير معروف', country: '' };
    } catch (error) {
      console.error('Error getting location name:', error);
      return { name: 'موقع غير معروف', country: '' };
    }
  }

  async getPrayerConfig(method: number = CalculationMethods.EGYPT): Promise<PrayerConfig> {
    try {
      // Dynamic prayer configuration based on Islamic standards
      // Icons reflect the actual time of day for each prayer
      const prayers: PrayerInfo[] = [
        { arabic: 'الفجر', english: 'fajr', icon: 'moon-outline', order: 1 },        // Pre-dawn (still dark)
        { arabic: 'الشروق', english: 'sunrise', icon: 'sunny-outline', order: 2 },   // Sunrise (sun emerging)
        { arabic: 'الظهر', english: 'dhuhr', icon: 'sunny', order: 3 },              // Noon (sun at peak)
        { arabic: 'العصر', english: 'asr', icon: 'partly-sunny', order: 4 },         // Afternoon (sun descending)
        { arabic: 'المغرب', english: 'maghrib', icon: 'partly-sunny-outline', order: 5 }, // Sunset/Dusk
        { arabic: 'العشاء', english: 'isha', icon: 'moon', order: 6 },                // Night (darkness)
      ];

      // Get method info with fallback
      let methodInfo;
      try {
        methodInfo = await this.getMethodInfo(method);
      } catch (error) {
        console.warn('Failed to get method info, using fallback:', error);
        methodInfo = {
          id: 5,
          name: 'Egyptian General Authority of Survey',
          params: { Fajr: 19.5, Isha: 17.5 },
        };
      }

      return {
        prayers,
        method: methodInfo,
      };
    } catch (error) {
      console.error('Error getting prayer config:', error);
      // Return fallback configuration
      return {
        prayers: [
          { arabic: 'الفجر', english: 'fajr', icon: 'moon-outline', order: 1 },
          { arabic: 'الشروق', english: 'sunrise', icon: 'sunny-outline', order: 2 },
          { arabic: 'الظهر', english: 'dhuhr', icon: 'sunny', order: 3 },
          { arabic: 'العصر', english: 'asr', icon: 'partly-sunny', order: 4 },
          { arabic: 'المغرب', english: 'maghrib', icon: 'partly-sunny-outline', order: 5 },
          { arabic: 'العشاء', english: 'isha', icon: 'moon', order: 6 },
        ],
        method: {
          id: 5,
          name: 'Egyptian General Authority of Survey',
          params: { Fajr: 19.5, Isha: 17.5 },
        },
      };
    }
  }

  async getPrayerTimes(coordinates: Coordinates, method: number = CalculationMethods.EGYPT): Promise<PrayerTimesData> {
    try {
      // Check cache first
      const cachedData = await this.getCachedData(coordinates, method);
      if (cachedData) {
        return cachedData;
      }

      // Fetch from API with specified method for more accurate Fajr and Isha times
      const response = await fetch(
        `${this.API_BASE_URL}/timings/${this.getTodayDate()}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${method}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 200 || data.status !== 'OK') {
        throw new Error(`API returned error: ${data.data || 'Unknown error'}`);
      }

      const timings = data.data.timings;
      const methodInfo = await this.getMethodInfo(method);
      const locationInfo = await this.getLocationName(coordinates);
      const prayerTimes: PrayerTimesData = {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        date: data.data.date.readable,
        timestamp: Date.now(),
        method: methodInfo,
        location: {
          name: locationInfo.name,
          country: locationInfo.country,
          coordinates: coordinates,
        },
      };

      // Cache the data
      await this.cacheData(coordinates, prayerTimes, method);

      return prayerTimes;
    } catch (error) {
      console.error('Error fetching prayer times:', error);

      // Try to return stale cache if available
      const staleData = await this.getStaleCache(coordinates);
      if (staleData) {
        console.warn('Using stale cache data due to API failure');
        return staleData;
      }

      throw error;
    }
  }

  private async getCachedData(coordinates: Coordinates, method: number = CalculationMethods.EGYPT): Promise<PrayerTimesData | null> {
    try {
      const cacheString = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cacheString) return null;

      const cache = JSON.parse(cacheString);
      const locationKey = this.getLocationKey(coordinates, method);
      const locationCache = cache[locationKey];

      if (!locationCache) return null;

      // Check if cache is still valid
      const isExpired = Date.now() - locationCache.timestamp > this.CACHE_DURATION;
      if (isExpired) return null;

      return locationCache.data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  private async getStaleCache(coordinates: Coordinates): Promise<PrayerTimesData | null> {
    try {
      const cacheString = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cacheString) return null;

      const cache = JSON.parse(cacheString);
      const locationKey = this.getLocationKey(coordinates);
      const locationCache = cache[locationKey];

      if (!locationCache) return null;

      return locationCache.data;
    } catch (error) {
      console.error('Error reading stale cache:', error);
      return null;
    }
  }

  private async cacheData(coordinates: Coordinates, data: PrayerTimesData, method: number = CalculationMethods.EGYPT): Promise<void> {
    try {
      const cacheString = await AsyncStorage.getItem(this.CACHE_KEY);
      const cache = cacheString ? JSON.parse(cacheString) : {};

      const locationKey = this.getLocationKey(coordinates, method);
      cache[locationKey] = {
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  private getLocationKey(coordinates: Coordinates, method: number = CalculationMethods.EGYPT): string {
    // Round coordinates to 4 decimal places for cache key
    const lat = Math.round(coordinates.latitude * 10000) / 10000;
    const lng = Math.round(coordinates.longitude * 10000) / 10000;
    return `${lat},${lng},method_${method}`;
  }

  private getTodayDate(): string {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private async getMethodInfo(methodId: number): Promise<{ id: number; name: string; params: any }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/methods`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 200 || data.status !== 'OK') {
        throw new Error(`API returned error: ${data.data || 'Unknown error'}`);
      }

      const methods = data.data;
      const methodKey = Object.keys(methods).find(key => methods[key].id === methodId);

      if (methodKey && methods[methodKey]) {
        return {
          id: methods[methodKey].id,
          name: methods[methodKey].name,
          params: methods[methodKey].params,
        };
      }

      // Fallback to Egyptian method if not found
      return {
        id: 5,
        name: 'Egyptian General Authority of Survey',
        params: { Fajr: 19.5, Isha: 17.5 },
      };
    } catch (error) {
      console.error('Error fetching method info:', error);
      // Return fallback method info
      return {
        id: 5,
        name: 'Egyptian General Authority of Survey',
        params: { Fajr: 19.5, Isha: 17.5 },
      };
    }
  }

  async getAvailableCalculationMethods(): Promise<CalculationMethod[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/methods`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 200 || data.status !== 'OK') {
        throw new Error(`API returned error: ${data.data || 'Unknown error'}`);
      }

      const methods = Object.entries(data.data).map(([key, value]: [string, any]) => ({
        id: value.id,
        name: value.name,
        params: value.params,
      }));

      return methods;
    } catch (error) {
      console.error('Error fetching calculation methods:', error);
      // Return fallback methods
      return [
        { id: 5, name: 'Egyptian General Authority of Survey', params: { Fajr: 19.5, Isha: 17.5 } },
        { id: 4, name: 'Umm Al-Qura University, Makkah', params: { Fajr: 18.5, Isha: '90 min' } },
        { id: 3, name: 'Muslim World League', params: { Fajr: 18, Isha: 17 } },
        { id: 2, name: 'Islamic Society of North America', params: { Fajr: 15, Isha: 15 } },
      ];
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get prayer times for a specific date (useful for testing or future features)
  async getPrayerTimesForDate(coordinates: Coordinates, date: Date): Promise<PrayerTimesData> {
    try {
      const dateString = this.formatDate(date);
      const response = await fetch(
        `${this.API_BASE_URL}/timings/${dateString}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=5`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 200 || data.status !== 'OK') {
        throw new Error(`API returned error: ${data.data || 'Unknown error'}`);
      }

      const timings = data.data.timings;
      const methodInfo = await this.getMethodInfo(5);
      const locationInfo = await this.getLocationName(coordinates);
      return {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        date: data.data.date.readable,
        timestamp: Date.now(),
        method: methodInfo,
        location: {
          name: locationInfo.name,
          country: locationInfo.country,
          coordinates: coordinates,
        },
      };
    } catch (error) {
      console.error('Error fetching prayer times for specific date:', error);
      throw error;
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

export default new PrayerTimesService();
