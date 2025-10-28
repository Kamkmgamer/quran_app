import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
  icon: string;
}

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const prayerNames = [
    { arabic: 'الفجر', english: 'fajr', icon: 'sunny-outline' },
    { arabic: 'الشروق', english: 'sunrise', icon: 'sunny' },
    { arabic: 'الظهر', english: 'dhuhr', icon: 'partly-sunny' },
    { arabic: 'العصر', english: 'asr', icon: 'cloudy-outline' },
    { arabic: 'المغرب', english: 'maghrib', icon: 'moon-outline' },
    { arabic: 'العشاء', english: 'isha', icon: 'moon' }
  ];

  useEffect(() => {
    getLocationAndCalculatePrayerTimes();
    
    // تحديث الوقت كل دقيقة
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getLocationAndCalculatePrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      // طلب إذن الوصول للموقع
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('يجب السماح بالوصول للموقع لحساب مواقيت الصلاة');
        return;
      }

      // الحصول على الموقع الحالي
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setLocation(coords);
      calculatePrayerTimes(coords);
    } catch (err) {
      console.error('خطأ في الحصول على الموقع:', err);
      setError('فشل في الحصول على الموقع. تأكد من تفعيل خدمات الموقع.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrayerTimes = (coords: {latitude: number, longitude: number}) => {
    try {
      // حساب مبسط لمواقيت الصلاة
      const now = new Date();
      const times: PrayerTime[] = prayerNames.map((prayer, index) => {
        // حساب مبسط للمواقيت (يمكن تحسينه لاحقاً)
        let timeString: string;
        
        switch (prayer.english) {
          case 'fajr':
            timeString = '05:30';
            break;
          case 'sunrise':
            timeString = '06:45';
            break;
          case 'dhuhr':
            timeString = '12:00';
            break;
          case 'asr':
            timeString = '15:30';
            break;
          case 'maghrib':
            timeString = '18:15';
            break;
          case 'isha':
            timeString = '19:45';
            break;
          default:
            timeString = '00:00';
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
      console.error('خطأ في حساب مواقيت الصلاة:', err);
      setError('فشل في حساب مواقيت الصلاة');
    }
  };

  const formatTime = (timeString: string) => {
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

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationAndCalculatePrayerTimes();
    setRefreshing(false);
  };

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getNextPrayer = () => {
    return prayerTimes.find(prayer => prayer.isNext);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={styles.loadingText}>جاري تحديد الموقع وحساب مواقيت الصلاة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>خطأ في الموقع</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getLocationAndCalculatePrayerTimes}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextPrayer = getNextPrayer();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
          <Text style={styles.currentTime}>{formatTime(getCurrentTimeString())}</Text>
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
            <View
              key={index}
              style={[
                styles.prayerTimeRow,
                prayer.isNext && styles.nextPrayerRow,
              ]}
            >
              <View style={styles.prayerInfo}>
                <Ionicons 
                  name={prayer.icon as any} 
                  size={24} 
                  color={prayer.isNext ? '#D4AF37' : '#10B981'} 
                />
                <Text
                  style={[
                    styles.prayerName,
                    prayer.isNext && styles.nextPrayerName,
                  ]}
                >
                  {prayer.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.prayerTime,
                  prayer.isNext && styles.nextPrayerTime,
                ]}
              >
                {formatTime(prayer.time)}
              </Text>
            </View>
          ))}
        </View>

        {/* Location Info */}
        {location && (
          <View style={styles.locationCard}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={styles.locationText}>
              الموقع: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
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
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '500',
  },
  nextPrayerCard: {
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
  nextPrayerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextPrayerTime: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '600',
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
  prayerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextPrayerRow: {
    backgroundColor: '#065F46',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 12,
  },
  nextPrayerName: {
    color: '#fff',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  nextPrayerTime: {
    color: '#D4AF37',
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
});