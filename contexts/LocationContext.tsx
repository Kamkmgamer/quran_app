import AsyncStorage from '@react-native-async-storage/async-storage';
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

type LocationSource = 'gps' | 'network' | 'default' | 'manual';

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
  calculationMethod: number | null;
  setCalculationMethod: (method: number | null) => Promise<void>;
  setManualLocation: (data: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }) => Promise<void>;
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
  const [calculationMethod, setCalculationMethodState] = useState<number | null>(null); // null means Auto

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

  const loadPrayerData = async (coords: Coordinates, methodId?: number) => {
    // Determine which method to use
    let methodToUse = methodId;

    // If no method specified (or passed as null/undefined), check state
    if (methodToUse === undefined || methodToUse === null) {
      if (calculationMethod !== null) {
        methodToUse = calculationMethod;
      } else {
        // Auto mode - try to detect based on country if we have location info
        // We'll rely on the service to get location name first if needed,
        // effectively doing a double hop if we don't have country yet.
        // For simplicity, we use EGYPT as safe default until we know better
        methodToUse = CalculationMethods.EGYPT;
      }
    }

    const config = await PrayerTimesService.getPrayerConfig(methodToUse);
    setPrayerConfig(config);

    const prayerData = await PrayerTimesService.getPrayerTimes(coords, methodToUse);
    setPrayerTimes(prayerData);
    setLastUpdated(Date.now());
    setLocationError(null);

    // Update auto-detected method if we are in auto mode
    if (calculationMethod === null && prayerData.location?.country) {
      const recommended = PrayerTimesService.getRecommendedMethodId(prayerData.location.country);
      if (recommended !== methodToUse) {
        // silently reload with better method if we just found out where we are
        const betterConfig = await PrayerTimesService.getPrayerConfig(recommended);
        const betterData = await PrayerTimesService.getPrayerTimes(coords, recommended);
        setPrayerConfig(betterConfig);
        setPrayerTimes(betterData);
      }
    }
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

  // Change Calculation Method
  const setCalculationMethod = async (method: number | null) => {
    try {
      setCalculationMethodState(method);
      if (method === null) {
        await AsyncStorage.removeItem('prayer_calculation_method');
      } else {
        await AsyncStorage.setItem('prayer_calculation_method', method.toString());
      }

      // Refresh if we have location
      if (location) {
        await loadPrayerData(location, method === null ? undefined : method);
      }
    } catch (error) {
      console.error('Error changing calculation method:', error);
    }
  };

  const setManualLocation = async (data: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }) => {
    const coords = { latitude: data.latitude, longitude: data.longitude };

    // Update State
    setLocation(coords);
    setLocationSource('manual'); // We need to update LocationSource type too, handle that next
    setLocationNotice(null);
    setLocationError(null);

    // Calculate Qibla
    const qibla = calculateQiblaDirection(data.latitude, data.longitude);
    setQiblaDirection(qibla);

    // Update Prayer Data
    // We can inject the location name into the prayer data to avoid reverse geocoding 'manual' coords again if possible,
    // or just rely on the service. For now, let's load normally.
    try {
      // Create a temporary "manual" location cache or override?
      // Actually, loadPrayerData fetches again. Ideally we'd pass the name in.
      // For now, let's just load.
      await loadPrayerData(coords);

      // Persist this manual choice? The requirement implies "if location isn't found Manually configer it".
      // Persistence is good practice.
      await AsyncStorage.setItem('manual_location', JSON.stringify(data));
      await AsyncStorage.setItem('location_source', 'manual');
    } catch (error) {
      console.error('Error setting manual location:', error);
    }
  };

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMethod = await AsyncStorage.getItem('prayer_calculation_method');
        if (savedMethod) {
          setCalculationMethodState(parseInt(savedMethod, 10));
        } else {
          setCalculationMethodState(null); // Default to Auto
        }
      } catch (error) {
        console.error('Error loading location context settings:', error);
      }
    };
    loadSettings();
  }, []);

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
        await loadPrayerData(location, calculationMethod === null ? undefined : calculationMethod);
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
    calculationMethod,
    setCalculationMethod,
    setManualLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
