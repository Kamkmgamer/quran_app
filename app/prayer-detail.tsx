import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PrayerDetailParams {
  prayerName: string;
  prayerTime: string;
  prayerIcon: string;
  isNext: string;
}

export default function PrayerDetailScreen() {
  const params = useLocalSearchParams() as unknown as PrayerDetailParams;
  const { prayerName, prayerTime, prayerIcon, isNext } = params;
  const [timeLeft, setTimeLeft] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animation values wrapped in useMemo
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for next prayer
    if (isNext === 'true') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isNext, fadeAnim, scaleAnim, pulseAnim]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = prayerTime.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      // If prayer time has passed today, calculate for tomorrow
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      const difference = prayerDate.getTime() - now.getTime();

      if (difference > 0) {
        const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
        const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);

        if (hoursLeft > 0) {
          setTimeLeft(`${hoursLeft} ساعة ${minutesLeft} دقيقة ${secondsLeft} ثانية`);
        } else if (minutesLeft > 0) {
          setTimeLeft(`${minutesLeft} دقيقة ${secondsLeft} ثانية`);
        } else {
          setTimeLeft(`${secondsLeft} ثانية`);
        }
      } else {
        setTimeLeft('لقد حان وقت الصلاة');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTime]);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatPrayerTime = (time: string) => {
    const [hours, minutes] = time.split(':');
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

  const getPrayerColor = () => {
    return isNext === 'true' ? '#065F46' : '#10B981';
  };

  const getPrayerBgColor = () => {
    return isNext === 'true' ? '#ECFDF5' : '#F0FDF4';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={getPrayerColor()} />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: getPrayerColor() }]}>تفاصيل الصلاة</Text>
                <Text style={styles.headerSubtitle}>
                  {isNext === 'true' ? 'الصلاة التالية' : 'معلومات الصلاة'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Prayer Card */}
          <Animated.View
            style={[
              styles.prayerCard,
              {
                backgroundColor: getPrayerBgColor(),
                borderColor: getPrayerColor(),
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { scale: isNext === 'true' ? pulseAnim : new Animated.Value(1) },
                ],
              },
            ]}
          >
            <View style={styles.prayerIconContainer}>
              <Ionicons name={prayerIcon as any} size={48} color={getPrayerColor()} />
            </View>
            <Text style={[styles.prayerName, { color: getPrayerColor() }]}>{prayerName}</Text>
            <Text style={[styles.prayerTime, { color: getPrayerColor() }]}>
              {formatPrayerTime(prayerTime)}
            </Text>
            {isNext === 'true' && (
              <View style={styles.nextPrayerBadge}>
                <Text style={styles.nextPrayerBadgeText}>التالية</Text>
              </View>
            )}
          </Animated.View>

          {/* Time Left Card */}
          {isNext === 'true' && (
            <Animated.View style={[styles.timeLeftCard, { opacity: fadeAnim }]}>
              <View style={styles.timeLeftHeader}>
                <Ionicons name="time-outline" size={24} color="#D4AF37" />
                <Text style={styles.timeLeftTitle}>الوقت المتبقي</Text>
              </View>
              <Text style={styles.timeLeftText}>{timeLeft}</Text>
            </Animated.View>
          )}

          {/* Current Time Card */}
          <Animated.View style={[styles.currentTimeCard, { opacity: fadeAnim }]}>
            <View style={styles.currentTimeHeader}>
              <Ionicons name="time-outline" size={24} color="#6B7280" />
              <Text style={styles.currentTimeTitle}>الوقت الحالي</Text>
            </View>
            <Text style={styles.currentTimeText}>{formatCurrentTime()}</Text>
          </Animated.View>

          {/* Prayer Status */}
          <Animated.View style={[styles.statusCard, { opacity: fadeAnim }]}>
            <View style={styles.statusContent}>
              <Ionicons
                name={isNext === 'true' ? 'notifications' : 'checkmark-circle'}
                size={20}
                color={isNext === 'true' ? '#D4AF37' : '#10B981'}
              />
              <Text style={styles.statusText}>
                {isNext === 'true'
                  ? 'هذه هي الصلاة التالية، استعد لأداء الصلاة في وقتها'
                  : 'تم تحديد وقت هذه الصلاة بناءً على موقعك الحالي'}
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  prayerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  prayerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  prayerName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextPrayerBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextPrayerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeLeftCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  timeLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLeftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  timeLeftText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
  },
  currentTimeCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  currentTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  currentTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
