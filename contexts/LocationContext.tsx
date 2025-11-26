import * as Location from 'expo-location';
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

import PrayerTimesService, {
  PrayerTimesData,
  Coordinates,
  CalculationMethods,
  PrayerConfig,
} from '../services/PrayerTimesService';

// موقع الكعبة بالدقة
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.82611111111111;

// موقع افتراضي (الرياض)
const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

type LocationSource = 'gps' | 'network' | 'default';

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  qiblaDirection: number;
  prayerTimes: PrayerTimesData | null;
  prayerConfig: PrayerConfig | null;
  locationLoading: boolean;
  locationError: string | null;
  locationSource: LocationSource;
  locationNotice: string | null;
  lastUpdated: number | null;
  refreshLocation: () => Promise<void>;
  refreshPrayerTimes: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [prayerConfig, setPrayerConfig] = useState<PrayerConfig | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>('gps');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [calculationMethod] = useState<number>(CalculationMethods.EGYPT);

  // حساب اتجاه القبلة بناءً على موقع المستخدم
  const calculateQiblaDirection = (userLat: number, userLng: number): number => {
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLng = ((KAABA_LNG - userLng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  const loadPrayerData = async (coords: Coordinates) => {
    const config = await PrayerTimesService.getPrayerConfig(calculationMethod);
    setPrayerConfig(config);

    const prayerData = await PrayerTimesService.getPrayerTimes(coords, calculationMethod);
    setPrayerTimes(prayerData);
    setLastUpdated(Date.now());
    setLocationError(null);
  };

  const NETWORK_LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const networkLocationCacheRef = useRef<{ coords: Coordinates; timestamp: number } | null>(null);

  const getNetworkLocation = async (): Promise<Coordinates | null> => {
    if (
      networkLocationCacheRef.current &&
      Date.now() - networkLocationCacheRef.current.timestamp < NETWORK_LOCATION_CACHE_DURATION
    ) {
      return networkLocationCacheRef.current.coords;
    }

    try {
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': 'QuranApp/1.0 (contact@quranapp.local)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        const coords = { latitude, longitude };
        networkLocationCacheRef.current = {
          coords,
          timestamp: Date.now(),
        };
        return coords;
      }

      return null;
    } catch (error) {
      console.error('Network location fetch error:', error);
      return null;
    }
  };

  const applyFallbackLocation = async (
    coords: Coordinates,
    errorMessage: string,
    source: LocationSource,
  ) => {
    setLocation(coords);
    setLocationSource(source);
    const qibla = calculateQiblaDirection(coords.latitude, coords.longitude);
    setQiblaDirection(qibla);
    setLocationNotice(errorMessage);
    setLocationError(null);

    try {
      await loadPrayerData(coords);
    } catch (err) {
      console.error('Failed to fetch prayer times for fallback location:', err);
    }
  };

  // جلب الموقع ومواقيت الصلاة
  const fetchLocationAndPrayerTimes = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      setLocationNotice(null);
      setLocationSource('gps');

      // طلب إذن الوصول للموقع
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied, attempting network-based location');

        const networkCoords = await getNetworkLocation();

        if (networkCoords) {
          await applyFallbackLocation(
            networkCoords,
            'لم يتم منح إذن الموقع. تم استخدام تقدير الموقع عبر الشبكة',
            'network',
          );
        } else {
          console.log('Network-based location unavailable, using default location');
          await applyFallbackLocation(
            { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG },
            'لم يتم منح إذن الموقع. يتم استخدام الموقع الافتراضي (الرياض)',
            'default',
          );
        }

        setLocationLoading(false);
        return;
      }

      // الحصول على الموقع الحالي
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setLocation(coords);
      setLocationSource('gps');
      setLocationNotice(null);

      // حساب اتجاه القبلة
      const qibla = calculateQiblaDirection(coords.latitude, coords.longitude);
      setQiblaDirection(qibla);

      // جلب مواقيت الصلاة
      try {
        await loadPrayerData(coords);
        console.log('Location and prayer times fetched successfully on app launch');
      } catch (apiError) {
        console.error('Prayer times API error:', apiError);
        setLocationError('تم تحديد الموقع بنجاح، لكن فشل جلب مواقيت الصلاة');
      }
    } catch (err) {
      console.error('Location fetch error:', err);

      const networkCoords = await getNetworkLocation();

      if (networkCoords) {
        await applyFallbackLocation(
          networkCoords,
          'تعذر الحصول على الموقع الدقيق. تم استخدام تقدير الموقع عبر الشبكة',
          'network',
        );
      } else {
        await applyFallbackLocation(
          { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG },
          'تعذر الحصول على الموقع. يتم استخدام الموقع الافتراضي (الرياض)',
          'default',
        );
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // جلب البيانات عند تحميل التطبيق
  useEffect(() => {
    fetchLocationAndPrayerTimes();
  }, []);

  // دالة لإعادة جلب الموقع
  const refreshLocation = async () => {
    await fetchLocationAndPrayerTimes();
  };

  // دالة لإعادة جلب مواقيت الصلاة
  const refreshPrayerTimes = async () => {
    if (location) {
      try {
        await PrayerTimesService.clearCache();
        await loadPrayerData(location);
      } catch (err) {
        console.error('Failed to refresh prayer times:', err);
      }
    }
  };

  const value: LocationContextType = {
    location,
    qiblaDirection,
    prayerTimes,
    prayerConfig,
    locationLoading,
    locationError,
    locationSource,
    locationNotice,
    lastUpdated,
    refreshLocation,
    refreshPrayerTimes,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
