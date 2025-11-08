import * as Location from 'expo-location';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import PrayerTimesService, { PrayerTimesData, Coordinates, CalculationMethods, PrayerConfig } from '../services/PrayerTimesService';

// موقع الكعبة بالدقة
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.82611111111111;

// موقع افتراضي (الرياض)
const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  qiblaDirection: number;
  prayerTimes: PrayerTimesData | null;
  prayerConfig: PrayerConfig | null;
  locationLoading: boolean;
  locationError: string | null;
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
  const [calculationMethod] = useState<number>(CalculationMethods.EGYPT);

  // حساب اتجاه القبلة بناءً على موقع المستخدم
  const calculateQiblaDirection = (userLat: number, userLng: number): number => {
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLng = ((KAABA_LNG - userLng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  // جلب الموقع ومواقيت الصلاة
  const fetchLocationAndPrayerTimes = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      // طلب إذن الوصول للموقع
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        // استخدام الموقع الافتراضي (الرياض)
        setLocation({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG });
        const qibla = calculateQiblaDirection(DEFAULT_LAT, DEFAULT_LNG);
        setQiblaDirection(qibla);
        setLocationError('لم يتم منح إذن الموقع. يتم استخدام الموقع الافتراضي (الرياض)');

        // جلب مواقيت الصلاة للموقع الافتراضي
        try {
          const config = await PrayerTimesService.getPrayerConfig(calculationMethod);
          setPrayerConfig(config);

          const coords: Coordinates = {
            latitude: DEFAULT_LAT,
            longitude: DEFAULT_LNG,
          };
          const prayerData = await PrayerTimesService.getPrayerTimes(coords, calculationMethod);
          setPrayerTimes(prayerData);
        } catch (err) {
          console.error('Failed to fetch prayer times with default location:', err);
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

      // حساب اتجاه القبلة
      const qibla = calculateQiblaDirection(coords.latitude, coords.longitude);
      setQiblaDirection(qibla);

      // جلب مواقيت الصلاة
      try {
        const config = await PrayerTimesService.getPrayerConfig(calculationMethod);
        setPrayerConfig(config);

        const prayerData = await PrayerTimesService.getPrayerTimes(coords, calculationMethod);
        setPrayerTimes(prayerData);

        console.log('Location and prayer times fetched successfully on app launch');
      } catch (apiError) {
        console.error('Prayer times API error:', apiError);
        setLocationError('تم تحديد الموقع بنجاح، لكن فشل جلب مواقيت الصلاة');
      }
    } catch (err) {
      console.error('Location fetch error:', err);
      setLocationError('فشل في الحصول على الموقع');

      // استخدام الموقع الافتراضي في حالة الخطأ
      setLocation({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG });
      const qibla = calculateQiblaDirection(DEFAULT_LAT, DEFAULT_LNG);
      setQiblaDirection(qibla);
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
        const config = await PrayerTimesService.getPrayerConfig(calculationMethod);
        setPrayerConfig(config);

        const prayerData = await PrayerTimesService.getPrayerTimes(location, calculationMethod);
        setPrayerTimes(prayerData);
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
    refreshLocation,
    refreshPrayerTimes,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

