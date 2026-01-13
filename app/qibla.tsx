import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Magnetometer, Accelerometer, DeviceMotion } from 'expo-sensors';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PointerToMekka from '../assets/images/pointer to mekka.svg';
import { useLocation } from '../contexts/LocationContext';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedSvg = Animated.createAnimatedComponent(PointerToMekka);

type HeadingStabilizerState = {
  lastRawAngle?: number;
  lastAcceptedTime: number;
  jitterScore: number;
  holdUntil: number;
};

// موقع الكعبة بالدقة التي قدمتها (من DMS -> عشري)

type SensorSubscription = {
  remove: () => void;
};

export default function QiblaCompass() {
  const locationContext = useLocation();
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  // اتجاه الجهاز بالنسبة للشمال بالدرجات
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [magneticInterference] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const magnetometerData = React.useRef({ x: 0, y: 0, z: 0 });
  const accelerometerData = React.useRef({ x: 0, y: 0, z: 0 });
  const pointerRotation = React.useRef(new Animated.Value(0)).current;
  const compassRotation = React.useRef(new Animated.Value(0)).current;
  const kaabaRotation = React.useRef(new Animated.Value(0)).current;
  const pointerAngleRef = React.useRef<number | undefined>(undefined);
  const compassAngleRef = React.useRef<number | undefined>(undefined);
  const kaabaAngleRef = React.useRef<number | undefined>(undefined);
  const magneticInterferenceRef = React.useRef(false);
  const headingStabilizerRef = React.useRef<HeadingStabilizerState>({
    lastRawAngle: undefined,
    lastAcceptedTime: 0,
    jitterScore: 0,
    holdUntil: 0,
  });

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  const shortestSide = Math.min(screenWidth, screenHeight);
  const compassSize = shortestSide * (isLandscape ? 0.65 : 0.75);
  const pointerIconSize = Math.max(Math.min(shortestSide * 0.16, 110), 70);
  // Kaaba offset is ~15% of compass size;
  // use ~4x that (0.6 * compassSize) so pointer orbits well outside the circle
  const pointerOrbitRadius = compassSize * 0.6;

  // استخدام البيانات من السياق المحمل مسبقاً
  const qiblaDirection = locationContext.qiblaDirection;
  const locationLoading = locationContext.locationLoading;
  const locationError = locationContext.locationError;

  useEffect(() => {
    magneticInterferenceRef.current = magneticInterference;
  }, [magneticInterference]);

  // حساب الاتجاه مع تعويض الميل (3D tilt compensation)
  const calculateTiltCompensatedHeading = (
    mx: number,
    my: number,
    mz: number,
    ax: number,
    ay: number,
    az: number,
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
    const yh =
      mx * Math.sin(roll) * Math.sin(pitch) +
      my * Math.cos(roll) -
      mz * Math.sin(roll) * Math.cos(pitch);

    // حساب الاتجاه
    let heading = Math.atan2(yh, xh) * (180 / Math.PI);
    heading = (heading + 360) % 360;

    return heading;
  };

  // Helper functions that are still used
  const detectMagneticInterference = (x: number, y: number, z: number) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    return magnitude > 100 || magnitude < 20;
  };

  const handleHeadingUpdate = (heading: number) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - headingStabilizerRef.current.lastAcceptedTime;

    // Calculate jitter score
    let jitterScore = 0;
    if (headingStabilizerRef.current.lastRawAngle !== undefined) {
      const angleDiff = Math.abs(heading - headingStabilizerRef.current.lastRawAngle);
      const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
      jitterScore = normalizedDiff;
    }

    headingStabilizerRef.current.lastRawAngle = heading;

    if (timeSinceLastUpdate > 16) {
      // اعتمد مباشرة على قيمة المستشعر ودع Animation يتكفل بالتنعيم البصري
      setDeviceOrientation(heading);
      headingStabilizerRef.current.lastAcceptedTime = now;
      headingStabilizerRef.current.jitterScore = jitterScore;
    }
  };

  // الموقع يتم جلبه تلقائياً من السياق عند بدء التطبيق
  // لا حاجة لجلبه مرة أخرى هنا

  // إعداد البوصلة مع تسلسل احتياطي متعدد المستويات
  useEffect(() => {
    let headingSubscription: Location.LocationSubscription | null = null;
    let deviceMotionSubscription: SensorSubscription | null = null;
    let magnetometerSubscription: SensorSubscription | null = null;
    let accelerometerSubscription: SensorSubscription | null = null;
    let isActive = true;

    const setupCompass = async () => {
      try {
        // الطريقة 1: استخدام Location Heading (الأكثر دقة - يستخدم دمج المستشعرات من النظام)
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            // console.log('Attempting Location Heading method...');
            headingSubscription = await Location.watchHeadingAsync(headingData => {
              if (!isActive) return;

              // استخدام الاتجاه الحقيقي (true north) إن كان متوفراً، وإلا استخدام المغناطيسي
              let heading = headingData.trueHeading;

              if (!Number.isFinite(heading) || heading < 0) {
                heading = headingData.magHeading;
              }

              if (!Number.isFinite(heading) || heading < 0) {
                return;
              }

              handleHeadingUpdate(heading);
              setIsCalibrated(true);
            });

            // console.log('Location Heading method active');
            return; // نجح - لا حاجة للطرق الاحتياطية
          } catch (headingError) {
            // console.log('Location Heading failed, trying DeviceMotion...', headingError);
          }
        }

        // الطريقة 2: استخدام DeviceMotion (احتياطي 1 - دقة جيدة)
        const deviceMotionAvailable = await DeviceMotion.isAvailableAsync();
        if (deviceMotionAvailable) {
          try {
            // console.log('Attempting DeviceMotion method...');
            deviceMotionSubscription = DeviceMotion.addListener(data => {
              if (!isActive) return;

              if (data.rotation) {
                // حساب الاتجاه من مصفوفة الدوران
                const { alpha } = data.rotation;
                // alpha هو الاتجاه حول المحور Z (البوصلة)
                let heading = alpha * (180 / Math.PI);
                heading = (heading + 360) % 360;

                handleHeadingUpdate(heading);
                setIsCalibrated(true);
              }
            });

            DeviceMotion.setUpdateInterval(20);
            // console.log('DeviceMotion method active');
            return;
          } catch (motionError) {
            // console.log('DeviceMotion failed, trying manual fusion...', motionError);
          }
        }

        // الطريقة 3: دمج يدوي للمستشعرات (احتياطي 2 - مع تعويض الميل)
        const magAvailable = await Magnetometer.isAvailableAsync();
        const accelAvailable = await Accelerometer.isAvailableAsync();

        if (magAvailable && accelAvailable) {
          // console.log('Attempting Manual Sensor Fusion...');

          // الاشتراك في كلا المستشعرين
          magnetometerSubscription = Magnetometer.addListener(data => {
            magnetometerData.current = data;
            detectMagneticInterference(data.x, data.y, data.z);
            updateHeadingFromFusion();
          });

          accelerometerSubscription = Accelerometer.addListener(data => {
            accelerometerData.current = data;
            updateHeadingFromFusion();
          });

          const updateHeadingFromFusion = () => {
            if (!isActive) return;

            const mag = magnetometerData.current;
            const accel = accelerometerData.current;

            // حساب الاتجاه مع تعويض الميل الكامل
            const heading = calculateTiltCompensatedHeading(
              mag.x,
              mag.y,
              mag.z,
              accel.x,
              accel.y,
              accel.z,
            );

            handleHeadingUpdate(heading);
            setIsCalibrated(true);
          };

          Magnetometer.setUpdateInterval(20);
          Accelerometer.setUpdateInterval(20);
          // console.log('Manual Sensor Fusion active');
          return;
        }

        // الطريقة 4: مقياس المغناطيسية الخام فقط (الملاذ الأخير - تحذير!)
        if (magAvailable) {
          // console.log('WARNING: Using raw magnetometer only (requires flat device)');
          magnetometerSubscription = Magnetometer.addListener(data => {
            if (!isActive) return;

            detectMagneticInterference(data.x, data.y, data.z);

            // حساب بسيط - يعمل فقط عندما يكون الجهاز مسطحاً
            let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
            angle = (angle + 360) % 360;

            handleHeadingUpdate(angle);
            setIsCalibrated(true);
          });

          Magnetometer.setUpdateInterval(20);
          // console.log('Raw magnetometer method active (WARNING: hold device flat)');
        } else {
          // console.error('No compass sensors available!');
          setIsCalibrated(false);
        }
      } catch (error) {
        // console.error('Error setting up compass:', error);
        setIsCalibrated(false);
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

  // الحصول على الزاوية النسبية بين اتجاه القبلة واتجاه الجهاز
  const getRelativeAngle = React.useCallback(() => {
    const rel = (qiblaDirection - deviceOrientation + 360) % 360;
    return rel;
  }, [qiblaDirection, deviceOrientation]);

  // نزول إلى نطاق -180..180 لعرض الفرق رقمياً (أقصر دوران يمين/يسار)
  const normalizeToMinus180To180 = (angle: number) => {
    // تحويل إلى -180..180
    const a = ((angle + 540) % 360) - 180;
    return a;
  };

  const getDirectionText = () => {
    const rel = getRelativeAngle(); // 0..360
    const normalized = normalizeToMinus180To180(rel); // -180..180

    // Aligned within 5 degrees
    if (Math.abs(normalized) < 5) return 'القبلة أمامك';

    // Right side (positive)
    if (normalized > 0) {
      if (normalized < 45) return 'يمين قليلاً';
      if (normalized < 135) return 'يمين';
      return 'خلفك';
    }
    // Left side (negative)
    else {
      if (normalized > -45) return 'يسار قليلاً';
      if (normalized > -135) return 'يسار';
      return 'خلفك';
    }
  };

  const getDisplayedAngle = () => {
    const rel = getRelativeAngle();
    const normalized = normalizeToMinus180To180(rel);
    return Math.round(Math.abs(normalized)); // عرض القيمة المطلقة للدوران المطلوبة
  };

  const isQiblaReady = isCalibrated && !locationLoading && !locationError;

  // Haptic Feedback Logic
  useEffect(() => {
    if (!isQiblaReady) return;

    const rel = getRelativeAngle();
    const normalized = normalizeToMinus180To180(rel);
    const aligned = Math.abs(normalized) < 5;

    if (aligned && !isAligned) {
      // Just entered alignment
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsAligned(true);
    } else if (!aligned && isAligned) {
      // Just left alignment
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsAligned(false);
    }
  }, [getRelativeAngle, isQiblaReady, isAligned]);

  const animateRotation = React.useCallback(
    (
      animatedValue: Animated.Value,
      angleRef: React.MutableRefObject<number | undefined>,
      targetAngle: number,
    ) => {
      if (!Number.isFinite(targetAngle)) {
        return;
      }

      const normalizedTarget = ((targetAngle % 360) + 360) % 360;

      if (angleRef.current === undefined) {
        angleRef.current = normalizedTarget;
        animatedValue.setValue(normalizedTarget);
        return;
      }

      const currentAbsolute = angleRef.current;
      const currentNormalized = ((currentAbsolute % 360) + 360) % 360;
      let delta = normalizedTarget - currentNormalized;
      delta = ((delta + 540) % 360) - 180;
      const nextAbsolute = currentAbsolute + delta;
      angleRef.current = nextAbsolute;

      const magnitude = Math.abs(delta);
      const stiffness = magnitude > 60 ? 200 : magnitude > 30 ? 170 : 140;
      const damping = magnitude > 60 ? 18 : magnitude > 30 ? 15 : 12;

      Animated.spring(animatedValue, {
        toValue: nextAbsolute,
        stiffness,
        damping,
        mass: 0.6,
        useNativeDriver: true,
      }).start();
    },
    [],
  );

  useEffect(() => {
    if (!isCalibrated) {
      return;
    }

    const heading = ((-deviceOrientation % 360) + 360) % 360;
    animateRotation(compassRotation, compassAngleRef, heading);
  }, [animateRotation, compassRotation, deviceOrientation, isCalibrated]);

  useEffect(() => {
    if (!isQiblaReady) {
      return;
    }

    const relative = getRelativeAngle();
    animateRotation(pointerRotation, pointerAngleRef, relative);
    animateRotation(kaabaRotation, kaabaAngleRef, relative);
  }, [
    animateRotation,
    deviceOrientation,
    getRelativeAngle,
    isQiblaReady,
    kaabaRotation,
    pointerRotation,
    qiblaDirection,
  ]);

  const pointerRotate = React.useMemo(
    () =>
      pointerRotation.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
        extrapolate: 'extend',
      }),
    [pointerRotation],
  );

  const compassRotate = React.useMemo(
    () =>
      compassRotation.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
        extrapolate: 'extend',
      }),
    [compassRotation],
  );

  const relativeRotate = React.useMemo(
    () =>
      kaabaRotation.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
        extrapolate: 'extend',
      }),
    [kaabaRotation],
  );

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
              {locationLoading
                ? 'تحديد موقعك...'
                : locationError
                  ? locationError
                  : !isCalibrated
                    ? 'معايرة البوصلة...'
                    : 'جاري التحميل...'}
            </Text>

            {!isCalibrated && !locationLoading && (
              <View style={styles.loadingHint}>
                <Ionicons name="information-circle" size={20} color="#10B981" />
                <Text style={styles.loadingHintText}>قد تحتاج لتحريك جهازك بشكل رقم 8</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isLandscape && styles.containerLandscape]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#10B981" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اتجاه القبلة</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={[styles.contentWrapper, isLandscape && styles.contentWrapperLandscape]}>
          <View style={[styles.infoPanel, isLandscape && styles.infoPanelLandscape]}>
            <View style={[styles.directionInfo, isLandscape && styles.directionInfoLandscape]}>
              <Text style={[styles.directionText, isAligned && styles.directionTextAligned]}>
                {getDirectionText()}
              </Text>
              <Text style={[styles.angleText, isAligned && styles.angleTextAligned]}>
                {getDisplayedAngle()}°
              </Text>
            </View>
          </View>

          <View style={[styles.compassContainer, isLandscape && styles.compassContainerLandscape]}>
            <View style={[styles.compass, { width: compassSize, height: compassSize }]}>
              <AnimatedImage
                source={require('../assets/images/north east south west.png')}
                style={[styles.directionsImage, { transform: [{ rotate: compassRotate }] }]}
                resizeMode="contain"
              />

              <AnimatedView
                style={[styles.kaabaContainer, { transform: [{ rotate: relativeRotate }] }]}
              >
                <Image
                  source={require('../assets/images/kaba.png')}
                  style={styles.kaabaImage}
                  resizeMode="contain"
                />
              </AnimatedView>

              <AnimatedView
                style={[styles.pointerOrbitContainer, { transform: [{ rotate: pointerRotate }] }]}
              >
                <AnimatedSvg
                  width={pointerIconSize}
                  height={pointerIconSize}
                  style={[
                    styles.pointerImage,
                    {
                      transform: [{ translateY: -pointerOrbitRadius }],
                    },
                    isAligned && styles.pointerImageAligned,
                  ]}
                />
              </AnimatedView>

              <AnimatedView
                style={[styles.userIndicatorContainer, { transform: [{ rotate: pointerRotate }] }]}
              >
                <Image
                  source={require('../assets/images/Vector.png')}
                  style={[styles.centerVector, isAligned && styles.centerVectorAligned]}
                  resizeMode="contain"
                />
              </AnimatedView>
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
  containerLandscape: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row-reverse',
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
  directionTextAligned: {
    color: '#10B981',
  },
  angleText: {
    fontSize: 28,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  angleTextAligned: {
    color: '#10B981',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pointerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  pointerContainerLandscape: {
    marginVertical: 12,
  },
  pointerImage: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  pointerImageAligned: {
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  compassContainerLandscape: {
    flex: 1,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  compass: {
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
    width: '15%',
    height: '15%',
    opacity: 0.8,
  },
  centerVectorAligned: {
    opacity: 1,
    tintColor: '#10B981',
  },
  userIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  pointerOrbitContainer: {
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
    width: '15%',
    height: '15%',
    marginTop: '15%',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentWrapperLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoPanel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPanelLandscape: {
    flex: 1,
    paddingRight: 24,
  },
  directionInfoLandscape: {
    paddingVertical: 0,
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
    width: 150,
    height: 150,
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  loadingHintText: {
    fontSize: 14,
    color: '#065F46',
    marginRight: 8,
  },
});
