import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import PrayerTimesService, { PrayerTimesData, Coordinates, CalculationMethods, PrayerConfig, PrayerInfo } from '../services/PrayerTimesService';

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
  icon: string;
}

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [prayerTimesData, setPrayerTimesData] = useState<PrayerTimesData | null>(null);
  const [prayerConfig, setPrayerConfig] = useState<PrayerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calculationMethod, setCalculationMethod] = useState<number>(CalculationMethods.EGYPT);

  const processPrayerTimes = useCallback((data: PrayerTimesData, prayers: PrayerInfo[]) => {
    try {
      if (!prayers || !Array.isArray(prayers)) {
        console.error('Prayers array is undefined or not an array');
        // Use fallback prayer data
        const fallbackPrayers = [
          { arabic: 'الفجر', english: 'fajr', icon: 'sunny-outline', order: 1 },
          { arabic: 'الشروق', english: 'sunrise', icon: 'sunny', order: 2 },
          { arabic: 'الظهر', english: 'dhuhr', icon: 'partly-sunny', order: 3 },
          { arabic: 'العصر', english: 'asr', icon: 'cloudy-outline', order: 4 },
          { arabic: 'المغرب', english: 'maghrib', icon: 'moon-outline', order: 5 },
          { arabic: 'العشاء', english: 'isha', icon: 'moon', order: 6 }
        ];
        
        const fallbackTimes: PrayerTime[] = fallbackPrayers.map((prayer) => ({
          name: prayer.arabic,
          time: '--:--',
          isNext: false,
          icon: prayer.icon,
        }));
        
        setPrayerTimes(fallbackTimes);
        return;
      }
      
      const now = new Date();
      const times: PrayerTime[] = prayers.map((prayer) => {
        let timeString: string;
        
        switch (prayer.english) {
          case 'fajr':
            timeString = data.fajr || '--:--';
            break;
          case 'sunrise':
            timeString = data.sunrise || '--:--';
            break;
          case 'dhuhr':
            timeString = data.dhuhr || '--:--';
            break;
          case 'asr':
            timeString = data.asr || '--:--';
            break;
          case 'maghrib':
            timeString = data.maghrib || '--:--';
            break;
          case 'isha':
            timeString = data.isha || '--:--';
            break;
          default:
            timeString = '--:--';
        }

        // تحديد الصلاة التالية
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [hours, minutes] = timeString.split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        
        const isNext = prayerTime > currentTime;

        return {
          name: prayer.arabic,
          time: timeString,
          isNext,
          icon: prayer.icon,
        };
      });

      setPrayerTimes(times);
    } catch (err) {
      console.error('خطأ في معالجة مواقيت الصلاة:', err);
      setError('فشل في معالجة مواقيت الصلاة');
      
      // Set fallback prayer times to prevent app crash
      const fallbackPrayers = [
        { arabic: 'الفجر', english: 'fajr', icon: 'sunny-outline', order: 1 },
        { arabic: 'الشروق', english: 'sunrise', icon: 'sunny', order: 2 },
        { arabic: 'الظهر', english: 'dhuhr', icon: 'partly-sunny', order: 3 },
        { arabic: 'العصر', english: 'asr', icon: 'cloudy-outline', order: 4 },
        { arabic: 'المغرب', english: 'maghrib', icon: 'moon-outline', order: 5 },
        { arabic: 'العشاء', english: 'isha', icon: 'moon', order: 6 }
      ];
      
      const fallbackTimes: PrayerTime[] = fallbackPrayers.map((prayer) => ({
        name: prayer.arabic,
        time: '--:--',
        isNext: false,
        icon: prayer.icon,
      }));
      
      setPrayerTimes(fallbackTimes);
    }
  }, []);

  const getLocationAndFetchPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // طلب إذن الوصول للموقع
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('يجب السماح بالوصول للموقع للحصول على مواقيت الصلاة');
        setLoading(false);
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

      // جلب إعدادات الصلوات ومواقيت الصلاة من API
      try {
        const config = await PrayerTimesService.getPrayerConfig(calculationMethod);
        setPrayerConfig(config);
        
        const prayerData = await PrayerTimesService.getPrayerTimes(coords, calculationMethod);
        setPrayerTimesData(prayerData);
        // processPrayerTimes will be called by the useEffect when data is set
      } catch (apiError) {
        console.error('API Error:', apiError);
        setError('فشل في جلب البيانات من الخادم. يرجى المحاولة مرة أخرى.');
        
        // Set fallback data to prevent app crash
        const fallbackConfig = await PrayerTimesService.getPrayerConfig(calculationMethod);
        setPrayerConfig(fallbackConfig);
        
        const fallbackData: PrayerTimesData = {
          fajr: '--:--',
          sunrise: '--:--',
          dhuhr: '--:--',
          asr: '--:--',
          maghrib: '--:--',
          isha: '--:--',
          date: new Date().toLocaleDateString('ar-SA'),
          timestamp: Date.now(),
          method: {
            id: 5,
            name: 'Egyptian General Authority of Survey',
            params: { Fajr: 19.5, Isha: 17.5 },
          },
          location: {
            name: 'موقع غير معروف',
            country: '',
            coordinates: coords,
          },
        };
        setPrayerTimesData(fallbackData);
      }
    } catch (err) {
      console.error('خطأ في جلب مواقيت الصلاة:', err);
      setError('فشل في جلب مواقيت الصلاة. تأكد من اتصال الإنترنت وحاول مرة أخرى.');
      
      // Set minimal fallback data
      const minimalFallback: PrayerTimesData = {
        fajr: '--:--',
        sunrise: '--:--',
        dhuhr: '--:--',
        asr: '--:--',
        maghrib: '--:--',
        isha: '--:--',
        date: new Date().toLocaleDateString('ar-SA'),
        timestamp: Date.now(),
        method: {
          id: 5,
          name: 'Egyptian General Authority of Survey',
          params: { Fajr: 19.5, Isha: 17.5 },
        },
        location: {
          name: 'موقع غير معروف',
          country: '',
          coordinates: { latitude: 0, longitude: 0 },
        },
      };
      setPrayerTimesData(minimalFallback);
    } finally {
      setLoading(false);
    }
  }, [calculationMethod]);

  // جلب مواقيت الصلاة عند تحميل المكون
  useEffect(() => {
    getLocationAndFetchPrayerTimes();
  }, []); // Empty dependency array - only run once on mount

  // تحديث الوقت كل دقيقة وإعادة حساب الصلاة التالية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // إعادة حساب الصلاة التالية عند تغير البيانات
  useEffect(() => {
    if (prayerTimesData && prayerConfig) {
      processPrayerTimes(prayerTimesData, prayerConfig.prayers);
    }
  }, [prayerTimesData, prayerConfig, processPrayerTimes]);

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatTime = (timeString: string) => {
    // If the time is already in HH:MM format, just return it
    if (timeString.includes(':') && !timeString.includes('ص') && !timeString.includes('م')) {
      return timeString;
    }
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    if (hour >= 12) {
      const displayHour = hour === 12 ? 12 : hour - 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'م' : 'ص'}`;
    } else {
      const displayHour = hour === 0 ? 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'م' : 'ص'}`;
    }
  };

  const getNextPrayer = () => {
    return prayerTimes.find(prayer => prayer.isNext);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await PrayerTimesService.clearCache(); // Clear cache to force fresh data
    await getLocationAndFetchPrayerTimes();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#065F46" />
      </TouchableOpacity>
      <View style={styles.headerDetails}>
        <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
        <Text style={styles.headerSubtitle}>تحديث لحظي حسب موقعك الحالي</Text>
      </View>
      <View style={styles.backButton} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>جاري تحديد الموقع وجلب مواقيت الصلاة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>خطأ في الموقع</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getLocationAndFetchPrayerTimes}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextPrayer = getNextPrayer();

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Info */}
        <View style={styles.headerInfoCard}>
          <Text style={styles.headerInfoLabel}>الوقت الحالي</Text>
          <Text style={styles.currentTime}>{getCurrentTimeString()}</Text>
        </View>

        {/* Next Prayer Card */}
        {nextPrayer && (
          <View style={styles.nextPrayerCard}>
            <View style={styles.nextPrayerContent}>
              <Ionicons name={nextPrayer.icon as any} size={32} color="#D4AF37" />
              <View style={styles.nextPrayerText}>
                <Text style={styles.nextPrayerLabel}>الصلاة التالية</Text>
                <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
                <Text style={styles.nextPrayerTime}>{formatTime(nextPrayer.time)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Prayer Times List */}
        <View style={styles.prayerTimesContainer}>
          <Text style={styles.sectionTitle}>جميع مواقيت الصلاة</Text>
          {prayerTimes.map((prayer, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.prayerCard,
                prayer.isNext && styles.nextPrayerCard,
              ]}
              onPress={() => router.push({
                pathname: './prayer-detail',
                params: {
                  prayerName: prayer.name,
                  prayerTime: prayer.time,
                  prayerIcon: prayer.icon,
                  isNext: prayer.isNext.toString(),
                }
              } as any)}
              activeOpacity={0.8}
            >
              <View style={styles.prayerInfo}>
                <View style={[
                  styles.prayerIconContainer,
                  prayer.isNext && styles.nextPrayerIconContainer
                ]}>
                  <Ionicons 
                    name={prayer.icon as any} 
                    size={24} 
                    color={prayer.isNext ? '#D4AF37' : '#10B981'} 
                  />
                </View>
                <Text
                  style={[
                    styles.prayerName,
                    prayer.isNext && styles.nextPrayerName,
                  ]}
                >
                  {prayer.name}
                </Text>
              </View>
              <View style={styles.prayerTimeContainer}>
                <Text
                  style={[
                    styles.prayerTime,
                    prayer.isNext && styles.nextPrayerTime,
                  ]}
                >
                  {formatTime(prayer.time)}
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color={prayer.isNext ? '#D4AF37' : '#9CA3AF'} 
                  style={styles.chevronIcon}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Info */}
        {prayerTimesData?.location && (
          <View style={styles.locationCard}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={styles.locationText}>
              الموقع: {prayerTimesData.location.name} {prayerTimesData.location.country && `- ${prayerTimesData.location.country}`}
            </Text>
          </View>
        )}

        {/* Data Source Info */}
        <View style={styles.dataSourceCard}>
          <Ionicons name="cloud-outline" size={16} color="#6B7280" />
          <Text style={styles.dataSourceText}>
            مصدر البيانات: AlAdhan API • {prayerTimesData?.method?.name || 'المصرية العامة للمساحة'} • {prayerTimesData?.date || ''}
          </Text>
          <Text style={styles.dataSourceSubText}>
            زاوية الفجر: {prayerTimesData?.method?.params?.Fajr || '19.5'}° • زاوية العشاء: {prayerTimesData?.method?.params?.Isha || '17.5'}°
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDetails: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerInfoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerInfoLabel: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#065F46',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#065F46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentTime: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '500',
  },
  nextPrayerCardOld: {
    backgroundColor: '#065F46',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  nextPrayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextPrayerText: {
    marginLeft: 16,
    flex: 1,
  },
  nextPrayerLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 4,
  },
  prayerTimesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12,
  },
  prayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nextPrayerCard: {
    backgroundColor: '#065F46',
    borderColor: '#047857',
    elevation: 4,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  nextPrayerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextPrayerTime: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nextPrayerIconContainer: {
    backgroundColor: '#064E3B',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  prayerTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginRight: 8,
  },
  chevronIcon: {
    opacity: 0.6,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  dataSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataSourceText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dataSourceSubText: {
    marginLeft: 22,
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
});