import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation } from '../contexts/LocationContext';
import { PrayerTimesData, PrayerInfo } from '../services/PrayerTimesService';

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
  icon: string;
}

export default function PrayerTimesScreen() {
  const locationContext = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // استخدام البيانات من السياق
  const prayerTimesData = locationContext.prayerTimes;
  const prayerConfig = locationContext.prayerConfig;
  const locationNotice = locationContext.locationNotice;
  const locationSource = locationContext.locationSource;
  const lastUpdated = locationContext.lastUpdated;

  const processPrayerTimes = useCallback((data: PrayerTimesData, prayers: PrayerInfo[]) => {
    try {
      if (!prayers || !Array.isArray(prayers)) {
        console.error('Prayers array is undefined or not an array');
        // Use fallback prayer data with icons that reflect actual prayer times
        const fallbackPrayers = [
          { arabic: 'الفجر', english: 'fajr', icon: 'moon-outline', order: 1 },
          { arabic: 'الشروق', english: 'sunrise', icon: 'sunny-outline', order: 2 },
          { arabic: 'الظهر', english: 'dhuhr', icon: 'sunny', order: 3 },
          { arabic: 'العصر', english: 'asr', icon: 'partly-sunny', order: 4 },
          { arabic: 'المغرب', english: 'maghrib', icon: 'partly-sunny-outline', order: 5 },
          { arabic: 'العشاء', english: 'isha', icon: 'moon', order: 6 },
        ];

        const fallbackTimes: PrayerTime[] = fallbackPrayers.map(prayer => ({
          name: prayer.arabic,
          time: '--:--',
          isNext: false,
          icon: prayer.icon,
        }));

        setPrayerTimes(fallbackTimes);
        return;
      }

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const timesWithMeta = prayers.map(prayer => {
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

        const [hoursStr, minutesStr] = timeString.split(':');
        const hours = Number(hoursStr);
        const minutes = Number(minutesStr);
        const isValidTime = Number.isFinite(hours) && Number.isFinite(minutes);
        const prayerTimeMinutes = isValidTime ? hours * 60 + minutes : null;

        return {
          name: prayer.arabic,
          time: timeString,
          icon: prayer.icon,
          minutesSinceMidnight: prayerTimeMinutes,
        };
      });

      const validTimes = timesWithMeta.filter(
        prayer => prayer.minutesSinceMidnight !== null,
      ) as ((typeof timesWithMeta)[number] & { minutesSinceMidnight: number })[];

      let nextPrayerMinutes: number | null = null;

      if (validTimes.length > 0) {
        const upcoming = validTimes.filter(prayer => prayer.minutesSinceMidnight > currentMinutes);

        if (upcoming.length > 0) {
          nextPrayerMinutes = upcoming.reduce(
            (min, prayer) => Math.min(min, prayer.minutesSinceMidnight),
            Number.POSITIVE_INFINITY,
          );
        } else {
          nextPrayerMinutes = validTimes.reduce(
            (min, prayer) => Math.min(min, prayer.minutesSinceMidnight),
            Number.POSITIVE_INFINITY,
          );
        }
      }

      const times: PrayerTime[] = timesWithMeta.map(prayer => ({
        name: prayer.name,
        time: prayer.time,
        icon: prayer.icon,
        isNext:
          nextPrayerMinutes !== null &&
          prayer.minutesSinceMidnight !== null &&
          prayer.minutesSinceMidnight === nextPrayerMinutes,
      }));

      setPrayerTimes(times);
    } catch (err) {
      console.error('خطأ في معالجة مواقيت الصلاة:', err);
      setError('فشل في معالجة مواقيت الصلاة');

      // Set fallback prayer times to prevent app crash
      const fallbackPrayers = [
        { arabic: 'الفجر', english: 'fajr', icon: 'moon-outline', order: 1 },
        { arabic: 'الشروق', english: 'sunrise', icon: 'sunny-outline', order: 2 },
        { arabic: 'الظهر', english: 'dhuhr', icon: 'sunny', order: 3 },
        { arabic: 'العصر', english: 'asr', icon: 'partly-sunny', order: 4 },
        { arabic: 'المغرب', english: 'maghrib', icon: 'partly-sunny-outline', order: 5 },
        { arabic: 'العشاء', english: 'isha', icon: 'moon', order: 6 },
      ];

      const fallbackTimes: PrayerTime[] = fallbackPrayers.map(prayer => ({
        name: prayer.arabic,
        time: '--:--',
        isNext: false,
        icon: prayer.icon,
      }));

      setPrayerTimes(fallbackTimes);
    }
  }, []);

  // استخدام البيانات من السياق المحمل مسبقاً عند بدء التطبيق
  useEffect(() => {
    // إذا كانت البيانات موجودة من السياق، استخدامها مباشرة
    if (locationContext.locationError) {
      setError(locationContext.locationError);
      setLoading(false);
    } else if (!locationContext.locationLoading && prayerTimesData && prayerConfig) {
      setLoading(false);
      setError(null);
    } else if (!locationContext.locationLoading) {
      setLoading(false);
    }
  }, [
    locationContext.locationLoading,
    locationContext.locationError,
    prayerTimesData,
    prayerConfig,
  ]);

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
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const baseTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
    return formatTime(baseTime);
  };

  const toArabicDigits = (value: string | number) => {
    const str = typeof value === 'number' ? value.toString() : value;
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/\d/g, digit => arabicDigits[Number(digit)]);
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === '--:--') {
      return '--:--';
    }

    const cleaned = timeString.trim();
    const numericOnly = cleaned.replace(/[^\d:]/g, '');
    const [hoursPart, minutesPart] = numericOnly.split(':');
    const hour = parseInt(hoursPart, 10);
    const minute = parseInt(minutesPart, 10);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      return '--:--';
    }

    const isPm = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = isPm ? 'م' : 'ص';

    const latinFormatted = `${displayHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')} ${period}`;

    return toArabicDigits(latinFormatted);
  };

  const getLastUpdatedLabel = () => {
    if (!lastUpdated) {
      return '—';
    }

    const date = new Date(lastUpdated);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const baseTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
    return formatTime(baseTime);
  };

  const getLocationSourceLabel = () => {
    switch (locationSource) {
      case 'gps':
        return 'الموقع من نظام GPS';
      case 'network':
        return 'الموقع عبر الشبكة';
      case 'default':
        return 'موقع افتراضي (الرياض)';
      default:
        return 'مصدر موقع غير معروف';
    }
  };

  const getLocationSourceBadgeStyle = () => {
    switch (locationSource) {
      case 'gps':
        return styles.locationSourceBadgeSuccess;
      case 'network':
        return styles.locationSourceBadgeInfo;
      case 'default':
      default:
        return styles.locationSourceBadgeNeutral;
    }
  };

  const getNextPrayer = () => {
    return prayerTimes.find(prayer => prayer.isNext);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await locationContext.refreshPrayerTimes();
    setRefreshing(false);
  };

  const handleManualRefresh = () => {
    if (!refreshing) {
      onRefresh();
    }
  };

  const renderStatusBanner = () => {
    if (!locationNotice) {
      return null;
    }

    const isDefault = locationSource === 'default';
    const iconName = isDefault ? 'alert-circle' : 'information-circle';
    const iconColor = isDefault ? '#B45309' : '#2563EB';

    return (
      <View
        style={[
          styles.statusBanner,
          isDefault ? styles.statusBannerWarning : styles.statusBannerInfo,
        ]}
      >
        <Ionicons
          name={iconName as any}
          size={18}
          color={iconColor}
          style={styles.statusBannerIcon}
        />
        <Text style={styles.statusBannerText}>{locationNotice}</Text>
      </View>
    );
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
      <TouchableOpacity
        style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
        onPress={handleManualRefresh}
        disabled={refreshing}
        activeOpacity={0.7}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color="#065F46" />
        ) : (
          <Ionicons name="refresh" size={22} color="#065F46" />
        )}
      </TouchableOpacity>
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
          <TouchableOpacity style={styles.retryButton} onPress={locationContext.refreshLocation}>
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
      {renderStatusBanner()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Current Time Card */}
        <View style={styles.currentTimeCard}>
          <View style={styles.currentTimeInfo}>
            <Text style={styles.currentTimeLabel}>الوقت الحالي</Text>
            <View style={styles.lastUpdatedRow}>
              <Ionicons name="time-outline" size={16} color="#047857" />
              <Text style={styles.lastUpdatedText}>آخر تحديث: {getLastUpdatedLabel()}</Text>
            </View>
          </View>
          <Text style={styles.currentTime}>{getCurrentTimeString()}</Text>
        </View>

        {/* Next Prayer Card */}
        {nextPrayer && (
          <View style={styles.nextPrayerCardMain}>
            <View style={styles.nextPrayerLeftSection}>
              <Text style={styles.nextPrayerLabel}>الصلاة التالية</Text>
              <Text style={styles.nextPrayerNameMain}>{nextPrayer.name}</Text>
            </View>
            <View style={styles.nextPrayerRightSection}>
              <Ionicons name={nextPrayer.icon as any} size={40} color="#FCD34D" />
              <Text style={styles.nextPrayerTimeMain}>{formatTime(nextPrayer.time)}</Text>
            </View>
          </View>
        )}

        {/* Prayer Times List */}
        <View style={styles.prayerTimesContainer}>
          <Text style={styles.sectionTitle}>جميع مواقيت الصلاة</Text>
          {prayerTimes.map((prayer, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.prayerCard, prayer.isNext && styles.nextPrayerCard]}
              onPress={() =>
                router.push({
                  pathname: './prayer-detail',
                  params: {
                    prayerName: prayer.name,
                    prayerTime: prayer.time,
                    prayerIcon: prayer.icon,
                    isNext: prayer.isNext.toString(),
                  },
                } as any)
              }
              activeOpacity={0.8}
            >
              <View style={styles.prayerInfo}>
                <View
                  style={[
                    styles.prayerIconContainer,
                    prayer.isNext && styles.nextPrayerIconContainer,
                  ]}
                >
                  <Ionicons
                    name={prayer.icon as any}
                    size={24}
                    color={prayer.isNext ? '#D4AF37' : '#10B981'}
                  />
                </View>
                <Text style={[styles.prayerName, prayer.isNext && styles.nextPrayerName]}>
                  {prayer.name}
                </Text>
              </View>
              <View style={styles.prayerTimeContainer}>
                <Text style={[styles.prayerTime, prayer.isNext && styles.nextPrayerTime]}>
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
            <View style={styles.locationDetails}>
              <Text style={styles.locationText}>
                الموقع: {prayerTimesData.location.name}
                {prayerTimesData.location.country && ` - ${prayerTimesData.location.country}`}
              </Text>
              <View style={styles.locationMetaRow}>
                <View style={[styles.locationSourceBadge, getLocationSourceBadgeStyle()]}>
                  <Ionicons
                    name={
                      locationSource === 'gps'
                        ? 'navigate'
                        : locationSource === 'network'
                          ? 'globe-outline'
                          : 'location-outline'
                    }
                    size={14}
                    color="#fff"
                    style={styles.locationSourceIcon}
                  />
                  <Text style={styles.locationSourceText}>{getLocationSourceLabel()}</Text>
                </View>
                <Text style={styles.locationUpdatedText}>آخر تحديث: {getLastUpdatedLabel()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Data Source Info */}
        <View style={styles.dataSourceCard}>
          <Text style={styles.dataSourceText}>
            مصدر البيانات: AlAdhan API • {prayerTimesData?.method?.name || 'المصرية العامة للمساحة'}
          </Text>
          <Text style={styles.dataSourceSubText}>
            {prayerTimesData?.date || ''} • زاوية الفجر:{' '}
            {prayerTimesData?.method?.params?.Fajr || '19.5'}° • العشاء:{' '}
            {prayerTimesData?.method?.params?.Isha || '17.5'}°
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  headerRow: {
    flexDirection: 'row-reverse',
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
  },
  refreshButtonDisabled: {
    opacity: 0.6,
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
  statusBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusBannerInfo: {
    backgroundColor: '#DBEAFE',
  },
  statusBannerWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusBannerIcon: {
    marginLeft: 8,
  },
  statusBannerText: {
    flex: 1,
    color: '#1F2937',
    fontSize: 13,
    lineHeight: 18,
  },
  currentTimeCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  currentTimeInfo: {
    flex: 1,
    paddingLeft: 16,
  },
  currentTimeLabel: {
    fontSize: 15,
    color: '#047857',
    fontWeight: '600',
    marginBottom: 4,
  },
  lastUpdatedRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  lastUpdatedText: {
    marginRight: 6,
    fontSize: 12,
    color: '#047857',
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
    fontSize: 32,
    color: '#065F46',
    fontWeight: '800',
    letterSpacing: 1,
  },
  nextPrayerCardMain: {
    backgroundColor: '#065F46',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    marginBottom: 28,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextPrayerLeftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  nextPrayerRightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPrayerLabel: {
    color: '#A7F3D0',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  nextPrayerNameMain: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  nextPrayerTimeMain: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: 2,
  },
  prayerTimesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 20,
    textAlign: 'center',
  },
  prayerCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nextPrayerCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
  },
  nextPrayerName: {
    color: '#065F46',
    fontSize: 18,
    fontWeight: '700',
  },
  nextPrayerTime: {
    color: '#047857',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nextPrayerIconContainer: {
    backgroundColor: '#10B981',
  },
  prayerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  prayerTimeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  chevronIcon: {
    opacity: 0.6,
  },
  locationCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationDetails: {
    marginLeft: 10,
    flex: 1,
  },
  locationText: {
    marginBottom: 4,
    fontSize: 13,
    color: '#6B7280',
    flexShrink: 1,
  },
  locationMetaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationSourceBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locationSourceBadgeSuccess: {
    backgroundColor: '#065F46',
  },
  locationSourceBadgeInfo: {
    backgroundColor: '#2563EB',
  },
  locationSourceBadgeNeutral: {
    backgroundColor: '#6B7280',
  },
  locationSourceIcon: {
    marginRight: 4,
  },
  locationSourceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  locationUpdatedText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 12,
  },
  dataSourceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataSourceText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
  },
  dataSourceSubText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
});
