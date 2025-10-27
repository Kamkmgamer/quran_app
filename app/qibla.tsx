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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Kaaba coordinates (Mecca)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Default location (you can replace with actual GPS coordinates)
const DEFAULT_LAT = 24.7136; // Riyadh coordinates as default
const DEFAULT_LNG = 46.6753;

export default function QiblaCompass() {
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });

  // Calculate Qibla direction based on user location
  const calculateQiblaDirection = (userLat: number, userLng: number) => {
    const lat1 = (userLat * Math.PI) / 180;
    const lat2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLng = ((KAABA_LNG - userLng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  useEffect(() => {
    // Calculate initial Qibla direction
    const qiblaAngle = calculateQiblaDirection(userLocation.lat, userLocation.lng);
    setQiblaDirection(qiblaAngle);
  }, [userLocation]);

  const handleCalibrate = () => {
    Alert.alert(
      'معايرة البوصلة',
      'قم بتدوير الجهاز في شكل رقم 8 عدة مرات لمعايرة البوصلة',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تم',
          onPress: () => setIsCalibrated(true),
        },
      ]
    );
  };

  const handleManualRotate = () => {
    setDeviceOrientation(prev => (prev + 45) % 360);
  };

  const getDirectionText = (angle: number) => {
    const directions = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  const getDirectionAngle = () => {
    return Math.round(qiblaDirection - deviceOrientation);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اتجاه القبلة</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleManualRotate}
          >
            <Ionicons name="refresh-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCalibrate}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Direction Info */}
      <View style={styles.directionInfo}>
        <Text style={styles.directionText}>
          {getDirectionText(getDirectionAngle())}
        </Text>
        <Text style={styles.angleText}>
          {Math.abs(getDirectionAngle())}°
        </Text>
      </View>

      {/* Qibla Arrow */}
      <View style={styles.arrowContainer}>
        <Image
          source={require('../assets/images/pointer to mekka.png')}
          style={[
            styles.qiblaArrow,
            {
              transform: [
                { rotate: `${getDirectionAngle() + 180}deg` }
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Compass */}
      <View style={styles.compassContainer}>
        <View style={styles.compass}>
          {/* Compass Background */}
          <Image
            source={require('../assets/images/north east south west.png')}
            style={[
              styles.compassBackground,
              {
                transform: [
                  { rotate: `${deviceOrientation}deg` }
                ],
              },
            ]}
            resizeMode="contain"
          />

          {/* Kaaba Image */}
          <View style={styles.kaabaContainer}>
            <Image
              source={require('../assets/images/kaba.png')}
              style={[
                styles.kaabaImage,
                {
                  transform: [
                    { rotate: `${-deviceOrientation}deg` }
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* User Position Indicator */}
          <View style={styles.userIndicator}>
            <View style={styles.userDot} />
            <View style={styles.userArrow} />
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isCalibrated ? 'البوصلة معايرة' : 'قم بمعايرة البوصلة'}
        </Text>
        <Text style={styles.locationText}>
          الموقع: الرياض، المملكة العربية السعودية
        </Text>
        <Text style={styles.instructionText}>
          اضغط على زر التدوير لاختبار البوصلة
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#065F46',
    height: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  directionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  directionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  angleText: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  qiblaArrow: {
    width: 80,
    height: 80,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#E8F5E8',
  },
  compass: {
    width: width * 0.85,
    height: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compassBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  kaabaContainer: {
    position: 'absolute',
    top: '12%',
    alignItems: 'center',
  },
  kaabaImage: {
    width: 50,
    height: 50,
  },
  userIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D4AF37',
    marginBottom: 6,
  },
  userArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D4AF37',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    fontSize: 18,
    color: '#065F46',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});