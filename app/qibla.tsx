import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Magnetometer, Accelerometer, DeviceMotion } from 'expo-sensors';
import { useLocation } from '../contexts/LocationContext';

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
  const locationContext = useLocation();
  const [deviceOrientation, setDeviceOrientation] = useState(0); // اتجاه الجهاز بالنسبة للشمال بالدرجات
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [compassMethod, setCompassMethod] = useState<string>('initializing');
  const [magneticInterference, setMagneticInterference] = useState(false);
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(0);
  const [calibrationQuality, setCalibrationQuality] = useState(0);
  const previousAngles = React.useRef<number[]>([]);  // للتنعيم
  const magnetometerData = React.useRef({ x: 0, y: 0, z: 0 });
  const accelerometerData = React.useRef({ x: 0, y: 0, z: 0 });
  
  // استخدام البيانات من السياق المحمل مسبقاً
  const qiblaDirection = locationContext.qiblaDirection;
  const locationLoading = locationContext.locationLoading;
  const locationError = locationContext.locationError;
  const userLocation = locationContext.location ? {
    lat: locationContext.location.latitude,
    lng: locationContext.location.longitude
  } : {
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG
  };

  // دالة لتنعيم القراءات ومنع الاهتزاز (Kalman-inspired smoothing)
  const smoothAngle = (newAngle: number) => {
    previousAngles.current.push(newAngle);
    if (previousAngles.current.length > 10) {
      previousAngles.current.shift();
    }
    
    // حساب المتوسط مع مراعاة التفاف الزوايا (0-360)
    let sumSin = 0;
    let sumCos = 0;
    previousAngles.current.forEach((angle, index) => {
      // وزن أكبر للقراءات الأحدث
      const weight = (index + 1) / previousAngles.current.length;
      sumSin += Math.sin((angle * Math.PI) / 180) * weight;
      sumCos += Math.cos((angle * Math.PI) / 180) * weight;
    });
    
    const avgAngle = Math.atan2(sumSin, sumCos) * (180 / Math.PI);
    return (avgAngle + 360) % 360;
  };

  // كشف التداخل المغناطيسي
  const detectMagneticInterference = (x: number, y: number, z: number) => {
    // حساب قوة المجال المغناطيسي (μT)
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    setMagneticFieldStrength(magnitude);
    
    // المجال المغناطيسي للأرض: 25-65 μT
    // إذا كانت القيمة خارج هذا النطاق، هناك تداخل
    if (magnitude < 20 || magnitude > 70) {
      setMagneticInterference(true);
    } else {
      setMagneticInterference(false);
    }
    
    return magnitude;
  };

  // حساب الاتجاه مع تعويض الميل (3D tilt compensation)
  const calculateTiltCompensatedHeading = (
    mx: number, my: number, mz: number,  // magnetometer
    ax: number, ay: number, az: number   // accelerometer
  ) => {
    // تطبيع قراءات المقياس التسارعي
    const norm = Math.sqrt(ax * ax + ay * ay + az * az);
    if (norm === 0) return 0;
    
    ax /= norm;
    ay /= norm;
    az /= norm;
    
    // حساب pitch و roll
    const pitch = Math.asin(-ay);
    const roll = Math.asin(ax / Math.cos(pitch));
    
    // تطبيق تعويض الميل
    const xh = mx * Math.cos(pitch) + mz * Math.sin(pitch);
    const yh = mx * Math.sin(roll) * Math.sin(pitch) + 
               my * Math.cos(roll) - 
               mz * Math.sin(roll) * Math.cos(pitch);
    
    // حساب الاتجاه
    let heading = Math.atan2(yh, xh) * (180 / Math.PI);
    heading = (heading + 360) % 360;
    
    return heading;
  };

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
    
    // Test mode: Log detailed calculations
    if (__DEV__) {
      console.log('=== Qibla Bearing Calculation ===');
      console.log(`User Location: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`);
      console.log(`Kaaba Location: ${KAABA_LAT}, ${KAABA_LNG}`);
      console.log(`Calculated Bearing: ${bearing.toFixed(2)}°`);
      console.log(`Direction: ${getDirectionName(bearing)}`);
      
      // Verify against known cities
      const knownCities = getKnownCityExpectedBearing(userLat, userLng);
      if (knownCities) {
        console.log(`Expected for ${knownCities.name}: ${knownCities.expected}°`);
        console.log(`Difference: ${Math.abs(bearing - knownCities.expected).toFixed(2)}°`);
      }
    }
    
    return bearing;
  };

  // الحصول على اسم الاتجاه من الزاوية
  const getDirectionName = (angle: number) => {
    const directions = [
      'شمال', 'شمال شرق', 'شرق', 'جنوب شرق',
      'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'
    ];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  // التحقق من المواقع المعروفة
  const getKnownCityExpectedBearing = (lat: number, lng: number) => {
    const knownCities = [
      { name: 'الرياض', lat: 24.7136, lng: 46.6753, expected: 241 },
      { name: 'جدة', lat: 21.5433, lng: 39.1728, expected: 85 },
      { name: 'الدمام', lat: 26.4207, lng: 50.0888, expected: 253 },
      { name: 'أبها', lat: 18.2164, lng: 42.5053, expected: 340 },
      { name: 'حائل', lat: 27.5219, lng: 41.6901, expected: 178 },
      { name: 'القاهرة', lat: 30.0444, lng: 31.2357, expected: 135 },
      { name: 'دبي', lat: 25.2048, lng: 55.2708, expected: 258 },
      { name: 'إسطنبول', lat: 41.0082, lng: 28.9784, expected: 147 },
      { name: 'لندن', lat: 51.5074, lng: -0.1278, expected: 119 },
      { name: 'نيويورك', lat: 40.7128, lng: -74.006, expected: 58 },
    ];

    for (const city of knownCities) {
      // التحقق إذا كان الموقع قريباً من مدينة معروفة (ضمن 0.5 درجة)
      if (
        Math.abs(lat - city.lat) < 0.5 &&
        Math.abs(lng - city.lng) < 0.5
      ) {
        return city;
      }
    }
    return null;
  };

  // الموقع يتم جلبه تلقائياً من السياق عند بدء التطبيق
  // لا حاجة لجلبه مرة أخرى هنا

  // إعداد البوصلة مع تسلسل احتياطي متعدد المستويات
  useEffect(() => {
    let headingSubscription: Location.LocationSubscription | null = null;
    let deviceMotionSubscription: any = null;
    let magnetometerSubscription: any = null;
    let accelerometerSubscription: any = null;
    let isActive = true;

    const setupCompass = async () => {
      try {
        // الطريقة 1: استخدام Location Heading (الأكثر دقة - يستخدم دمج المستشعرات من النظام)
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            console.log('Attempting Location Heading method...');
            headingSubscription = await Location.watchHeadingAsync((headingData) => {
              if (!isActive) return;
              
              // استخدام الاتجاه الحقيقي (true north)
              const heading = headingData.trueHeading;
              const smoothed = smoothAngle(heading);
              setDeviceOrientation(smoothed);
              setCompassMethod('location-heading');
              setIsCalibrated(true);
              setCalibrationQuality(headingData.accuracy || 0);
            });
            
            console.log('Location Heading method active');
            return; // نجح - لا حاجة للطرق الاحتياطية
          } catch (headingError) {
            console.log('Location Heading failed, trying DeviceMotion...', headingError);
          }
        }

        // الطريقة 2: استخدام DeviceMotion (احتياطي 1 - دقة جيدة)
        const deviceMotionAvailable = await DeviceMotion.isAvailableAsync();
        if (deviceMotionAvailable) {
          try {
            console.log('Attempting DeviceMotion method...');
            deviceMotionSubscription = DeviceMotion.addListener((data) => {
              if (!isActive) return;
              
              if (data.rotation) {
                // حساب الاتجاه من مصفوفة الدوران
                const { alpha, beta, gamma } = data.rotation;
                // alpha هو الاتجاه حول المحور Z (البوصلة)
                let heading = alpha * (180 / Math.PI);
                heading = (heading + 360) % 360;
                
                const smoothed = smoothAngle(heading);
                setDeviceOrientation(smoothed);
                setCompassMethod('device-motion');
                setIsCalibrated(true);
                setCalibrationQuality(3);
              }
            });
            
            DeviceMotion.setUpdateInterval(100);
            console.log('DeviceMotion method active');
            return; // نجح - لا حاجة للطريقة الاحتياطية التالية
          } catch (motionError) {
            console.log('DeviceMotion failed, trying manual fusion...', motionError);
          }
        }

        // الطريقة 3: دمج يدوي للمستشعرات (احتياطي 2 - مع تعويض الميل)
        const magAvailable = await Magnetometer.isAvailableAsync();
        const accelAvailable = await Accelerometer.isAvailableAsync();
        
        if (magAvailable && accelAvailable) {
          console.log('Attempting Manual Sensor Fusion...');
          
          // الاشتراك في كلا المستشعرين
          magnetometerSubscription = Magnetometer.addListener((data) => {
            magnetometerData.current = data;
            detectMagneticInterference(data.x, data.y, data.z);
            updateHeadingFromFusion();
          });
          
          accelerometerSubscription = Accelerometer.addListener((data) => {
            accelerometerData.current = data;
            updateHeadingFromFusion();
          });
          
          const updateHeadingFromFusion = () => {
            if (!isActive) return;
            
            const mag = magnetometerData.current;
            const accel = accelerometerData.current;
            
            // حساب الاتجاه مع تعويض الميل الكامل
            const heading = calculateTiltCompensatedHeading(
              mag.x, mag.y, mag.z,
              accel.x, accel.y, accel.z
            );
            
            const smoothed = smoothAngle(heading);
            setDeviceOrientation(smoothed);
            setCompassMethod('manual-fusion');
            setIsCalibrated(true);
            setCalibrationQuality(2);
          };
          
          Magnetometer.setUpdateInterval(100);
          Accelerometer.setUpdateInterval(100);
          console.log('Manual Sensor Fusion active');
          return;
        }

        // الطريقة 4: مقياس المغناطيسية الخام فقط (الملاذ الأخير - تحذير!)
        if (magAvailable) {
          console.log('WARNING: Using raw magnetometer only (requires flat device)');
          magnetometerSubscription = Magnetometer.addListener((data) => {
            if (!isActive) return;
            
            detectMagneticInterference(data.x, data.y, data.z);
            
            // حساب بسيط - يعمل فقط عندما يكون الجهاز مسطحاً
            let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            
            const smoothed = smoothAngle(angle);
            setDeviceOrientation(smoothed);
            setCompassMethod('raw-magnetometer');
            setIsCalibrated(true);
            setCalibrationQuality(1);
          });
          
          Magnetometer.setUpdateInterval(100);
          console.log('Raw magnetometer method active (WARNING: hold device flat)');
        } else {
          console.error('No compass sensors available!');
          setCompassMethod('none');
        }
      } catch (error) {
        console.error('Error setting up compass:', error);
        setCompassMethod('error');
      }
    };

    setupCompass();

    return () => {
      isActive = false;
      if (headingSubscription) {
        headingSubscription.remove();
      }
      if (deviceMotionSubscription && deviceMotionSubscription.remove) {
        deviceMotionSubscription.remove();
      }
      if (magnetometerSubscription && magnetometerSubscription.remove) {
        magnetometerSubscription.remove();
      }
      if (accelerometerSubscription && accelerometerSubscription.remove) {
        accelerometerSubscription.remove();
      }
    };
  }, []);

  // اتجاه القبلة يتم حسابه تلقائياً في السياق
  // لا حاجة لإعادة حسابه هنا

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


  // Check if compass is ready
  const isQiblaReady = isCalibrated && !locationLoading && !locationError;

  // Loading Screen
  if (!isQiblaReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Image
              source={require('../assets/images/kaba.png')}
              style={styles.loadingKaaba}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#10B981" style={styles.loadingSpinner} />
            <Text style={styles.loadingTitle}>جاري تحضير البوصلة</Text>
            <Text style={styles.loadingSubtitle}>
              {locationLoading ? 'تحديد موقعك...' : 
               locationError ? locationError :
               !isCalibrated ? 'معايرة البوصلة...' : 'جاري التحميل...'}
            </Text>
            
            {!isCalibrated && !locationLoading && (
              <View style={styles.loadingHint}>
                <Ionicons name="information-circle" size={20} color="#10B981" />
                <Text style={styles.loadingHintText}>
                  قد تحتاج لتحريك جهازك بشكل رقم 8
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#10B981" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اتجاه القبلة</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.directionInfo}>
          <Text style={styles.directionText}>{getDirectionText()}</Text>
          <Text style={styles.angleText}>{getDisplayedAngle()}°</Text>
        </View>

        <View style={styles.pointerContainer}>
          <Image
            source={require('../assets/images/pointer to mekka.png')}
            style={[
              styles.pointerImage,
              { transform: [{ rotate: `${getRelativeAngle()}deg` }] },
            ]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.compassContainer}>
          <View style={styles.compass}>
            <Image
              source={require('../assets/images/north east south west.png')}
              style={[
                styles.directionsImage,
                { transform: [{ rotate: `${-deviceOrientation}deg` }] },
              ]}
              resizeMode="contain"
            />

            <View
              style={[
                styles.kaabaContainer,
                { transform: [{ rotate: `${getRelativeAngle()}deg` }] },
              ]}
            >
              <Image
                source={require('../assets/images/kaba.png')}
                style={styles.kaabaImage}
                resizeMode="contain"
              />
            </View>

            <View
              style={[
                styles.userIndicatorContainer,
                { transform: [{ rotate: `${getRelativeAngle()}deg` }] },
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

      </View>
    </SafeAreaView>
  );
}

// ======= Styles =======
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingKaaba: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  loadingHintText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
  },
});
