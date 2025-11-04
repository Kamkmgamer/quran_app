import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

const { width } = Dimensions.get('window');

// موقع الكعبة بالدقة التي قدمتها (من DMS -> عشري)
// 21°25'21" N = 21.4225
// 39°49'34" E = 39.82611111111111
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.82611111111111;

// موقع افتراضي (الرياض) حتى نحصل على صلاحية الموقع
const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

export default function QiblaCompass() {
  const [deviceOrientation, setDeviceOrientation] = useState(0); // اتجاه الجهاز بالنسبة للشمال بالدرجات
  const [qiblaDirection, setQiblaDirection] = useState(0); // اتجاه القبلة من الموقع بالدرجات (0..360, بالنسبة للشمال)
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // تحويل إحداثيات المستخدم و الكعبة إلى زاوية البوصلة تجاه الكعبة (bearing)
  const calculateQiblaDirection = (userLat: number, userLng: number) => {
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLng = ((KAABA_LNG - userLng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360; // 0..360 حيث 0 = شمال حقيقي
    return bearing;
  };

  // تطلب صلاحية الموقع وتحصل على الموقع الحالي
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('تم رفض إذن الموقع');
          setLocationLoading(false);
          return;
        }

        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
      } catch (error) {
        setLocationError('فشل في الحصول على الموقع');
        setLocationLoading(false);
      }
    })();
  }, []);

  // إعداد المستشعر المغناطيسي لقراءة اتجاه الجهاز بالنسبة للشمال
  useEffect(() => {
    let subscription: any;
    const setupMagnetometer = async () => {
      try {
        // Check if Magnetometer is available first
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (!isAvailable) {
          console.log('Magnetometer not available');
          return;
        }
        
        subscription = Magnetometer.addListener((data) => {
          // حساب heading من بيانات المغناطيسية
          const heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
          const normalized = (heading + 360) % 360; // 0..360
          setDeviceOrientation(normalized);
        });
        Magnetometer.setUpdateInterval(100);
      } catch (error) {
        console.log('Error setting up magnetometer:', error);
      }
    };
    setupMagnetometer();
    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  // إعادة حساب اتجاه القبلة كلما تغيّر موقع المستخدم
  useEffect(() => {
    const qiblaAngle = calculateQiblaDirection(userLocation.lat, userLocation.lng);
    setQiblaDirection(qiblaAngle);
  }, [userLocation]);

  const handleCalibrate = () => {
    Alert.alert(
      'معايرة البوصلة',
      'قم بتحريك الجهاز على شكل رقم 8 عدة مرات لمعايرة البوصلة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تم', onPress: () => setIsCalibrated(true) },
      ]
    );
  };

  // الحصول على الزاوية النسبية بين اتجاه القبلة واتجاه الجهاز
  // نتيجة: قيمة بين 0 و 360 تمثل الاتجاه الذي يجب تدوير العنصر إليه بالنسبة للعرض الأفقي (0 = أعلى الشاشة)
  const getRelativeAngle = () => {
    // نريد زاوية حيث 0 = للأعلى (الشمال بالنسبة للصورة) و القيمة هي مقدار دوران السهم ليشير للقبلة
    const rel = (qiblaDirection - deviceOrientation + 360) % 360;
    return rel;
  };

  // نزول إلى نطاق -180..180 لعرض الفرق رقمياً (أقصر دوران يمين/يسار)
  const normalizeToMinus180To180 = (angle: number) => {
    // تحويل إلى -180..180
    const a = ((angle + 540) % 360) - 180;
    return a;
  };

  const getDirectionText = () => {
    const rel = getRelativeAngle(); // 0..360
    const directions = [
      'شمال',
      'شمال شرق',
      'شرق',
      'جنوب شرق',
      'جنوب',
      'جنوب غرب',
      'غرب',
      'شمال غرب',
    ];
    const index = Math.round(rel / 45) % 8;
    return directions[index];
  };

  const getDisplayedAngle = () => {
    const rel = getRelativeAngle();
    const normalized = normalizeToMinus180To180(rel);
    return Math.round(Math.abs(normalized)); // عرض القيمة المطلقة للدوران المطلوبة
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اتجاه القبلة</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Direction Info */}
      <View style={styles.directionInfo}>
        <Text style={styles.directionText}>{getDirectionText()}</Text>
        <Text style={styles.angleText}>{getDisplayedAngle()}°</Text>
      </View>

      {/* Large Pointer Arrow - Points to Qibla */}
      <View style={styles.pointerContainer}>
        <Image
          source={require('../assets/images/pointer to mekka.png')}
          style={[
            styles.pointerImage,
            {
              transform: [{ rotate: `${getRelativeAngle()}deg` }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Compass */}
      <View style={styles.compassContainer}>
        <View style={styles.compass}>
          {/* صورة الاتجاهات - ثابتة (N دائماً للأعلى) */}
          <Image
            source={require('../assets/images/north east south west.png')}
            style={styles.directionsImage}
            resizeMode="contain"
          />

          {/* صورة الكعبة - تدور لتتجه نحو القبلة */}
          <View
            style={[
              styles.kaabaContainer,
              {
                transform: [{ rotate: `${getRelativeAngle()}deg` }],
              },
            ]}
          >
            <Image
              source={require('../assets/images/kaba.png')}
              style={styles.kaabaImage}
              resizeMode="contain"
            />
          </View>

          {/* مؤشر اتجاه القبلة - يشير نحو القبلة */}
          <View
            style={[
              styles.userIndicatorContainer,
              {
                transform: [{ rotate: `${getRelativeAngle()}deg` }],
              },
            ]}
          >
            <Image
              source={require('../assets/images/Vector.png')}
              style={styles.centerVector}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {locationLoading
            ? 'جاري الحصول على الموقع...'
            : locationError
            ? `خطأ: ${locationError}`
            : isCalibrated
            ? 'البوصلة جاهزة'
            : 'يرجى معايرة البوصلة'}
        </Text>
        <Text style={styles.locationText}>
          {locationLoading
            ? 'تحديد الموقع...'
            : locationError
            ? 'تعذر تحديد الموقع'
            : `الموقع: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`}
        </Text>
      </View>
    </View>
  );
}

// ======= Styles =======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
  },
  directionInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  directionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#065F46',
  },
  angleText: {
    fontSize: 28,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  pointerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  pointerImage: {
    width: 100,
    height: 100,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  compass: {
    width: width * 0.75,
    height: width * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  directionsImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  centerVector: {
    width: 50,
    height: 50,
  },
  userIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
  },
  kaabaContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 0,
    left: 0,
  },
  kaabaImage: {
    width: 50,
    height: 50,
    marginTop: '15%',
  },
  statusContainer: {
    display: 'none',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 6,
  },
});
