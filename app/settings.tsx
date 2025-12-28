import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useLocation } from '../contexts/LocationContext';

interface SettingsState {
  notifications: boolean;
  autoPlayNext: boolean;
  downloadOnWiFiOnly: boolean;
  keepScreenOn: boolean;
  showTranslation: boolean;
  nightMode: boolean;
}

export default function Settings() {
  const { prayerTimes, calculationMethod } = useLocation();
  const [methodName, setMethodName] = useState('');

  useEffect(() => {
    if (calculationMethod === null) {
      setMethodName('تلقائي (مستحسن)');
    } else if (prayerTimes?.method?.name) {
      // Shorten long names if needed
      let name = prayerTimes.method.name;
      if (name.includes('Makkah')) name = 'Umm Al-Qura, Makkah';
      else if (name.includes('Egypt')) name = 'Egyptian General Authority';
      else if (name.includes('Karachi')) name = 'Univ. of Islamic Sciences, Karachi';
      else if (name.includes('America')) name = 'Islamic Society of North America';
      else if (name.includes('Dubai')) name = 'Dubai';
      else if (name.includes('Kuwait')) name = 'Kuwait';

      setMethodName(name);
    }
  }, [calculationMethod, prayerTimes]);

  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    autoPlayNext: true,
    downloadOnWiFiOnly: true,
    keepScreenOn: false,
    showTranslation: false,
    nightMode: false,
  });

  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: keyof SettingsState, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const showSoonToast = () => {
    if (toastVisible) return;
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastVisible(false));
  };

  const clearCache = () => {
    showSoonToast();
    /*
    Alert.alert('مسح الذاكرة المؤقتة', 'هل تريد مسح جميع الملفات المؤقتة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'مسح',
        style: 'destructive',
        onPress: () => {
          // يمكن إضافة منطق مسح الملفات المؤقتة هنا
          Alert.alert('تم', 'تم مسح الذاكرة المؤقتة بنجاح');
        },
      },
    ]);
    */
  };

  const resetSettings = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل تريد إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            const defaultSettings: SettingsState = {
              notifications: true,
              autoPlayNext: true,
              downloadOnWiFiOnly: true,
              keepScreenOn: false,
              showTranslation: false,
              nightMode: false,
            };
            setSettings(defaultSettings);
            await AsyncStorage.setItem('appSettings', JSON.stringify(defaultSettings));
            Alert.alert('تم', 'تم إعادة تعيين الإعدادات بنجاح');
          },
        },
      ],
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    settingKey: keyof SettingsState,
    isUnimplemented: boolean = false,
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#065F46" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={value => {
          if (isUnimplemented) {
            showSoonToast();
          } else {
            saveSetting(settingKey, value);
          }
        }}
        trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
        thumbColor={settings[settingKey] ? '#065F46' : '#F3F4F6'}
      />
    </View>
  );

  const renderActionItem = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    danger?: boolean,
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons name={icon as any} size={24} color={danger ? '#DC2626' : '#065F46'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Svg width="9" height="19" viewBox="0 0 9 19" fill="none">
              <Path
                d="M7.75 17.75L4.6648 14.7796C2.20442 12.4107 0.974227 11.2263 0.784807 9.78267C0.738398 9.42896 0.738398 9.07104 0.784807 8.71733C0.974227 7.27371 2.20442 6.08928 4.6648 3.72042L7.75 0.75"
                stroke="#065F46"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
          <View style={styles.headerDetails}>
            <Text style={styles.headerTitle}>الإعدادات</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <ImageBackground
        source={require('../assets/images/Mosque.png')}
        style={styles.backgroundPattern}
        imageStyle={styles.backgroundPatternImage}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Prayer Times Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مواقيت الصلاة</Text>
            <View style={styles.card}>
              {renderActionItem('time', 'طريقة الحساب', methodName || 'تحميل...', () => {
                router.push('/calculation-method' as any);
              })}
            </View>
          </View>

          {/* Audio Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إعدادات الصوت</Text>
            <View style={styles.card}>
              {renderSettingItem(
                'notifications',
                'الإشعارات',
                'تفعيل إشعارات التطبيق',
                'notifications',
                true,
              )}
              {renderSettingItem(
                'play-skip-forward',
                'التشغيل التلقائي',
                'تشغيل الآية التالية تلقائياً',
                'autoPlayNext',
                true,
              )}
            </View>
          </View>

          {/* Display Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إعدادات العرض</Text>
            <View style={styles.card}>
              {renderSettingItem(
                'sunny',
                'إبقاء الشاشة مضاءة',
                'منع الشاشة من الإطفاء أثناء القراءة',
                'keepScreenOn',
                true,
              )}
              {renderSettingItem(
                'language',
                'عرض الترجمة',
                'إظهار ترجمة معاني القرآن',
                'showTranslation',
                true,
              )}
              {renderSettingItem('moon', 'الوضع الليلي', 'استخدام الثيم الداكن', 'nightMode', true)}
            </View>
          </View>

          {/* Download Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إعدادات التحميل</Text>
            <View style={styles.card}>
              {renderSettingItem(
                'wifi',
                'التحميل عبر WiFi فقط',
                'تحميل التلاوات عند الاتصال بشبكة WiFi فقط',
                'downloadOnWiFiOnly',
                true,
              )}
            </View>
          </View>

          {/* Quick Access */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوصول السريع</Text>
            <View style={styles.card}>
              {renderActionItem('text', 'حجم الخط', 'تغيير حجم خط القرآن', () => {
                router.push('/font-size');
              })}
              {renderActionItem('person', 'القراء', 'اختيار القارئ المفضل', () => {
                router.push('/reciters');
              })}
              {renderActionItem('bookmark', 'العلامات المرجعية', 'إدارة الآيات المحفوظة', () => {
                router.push('/bookmarks');
              })}
            </View>
          </View>

          {/* App Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إدارة التطبيق</Text>
            <View style={styles.card}>
              {renderActionItem(
                'trash-bin',
                'مسح الذاكرة المؤقتة',
                'حذف الملفات المؤقتة لتوفير المساحة',
                clearCache,
              )}
              {renderActionItem(
                'refresh',
                'إعادة تعيين الإعدادات',
                'استعادة الإعدادات الافتراضية',
                resetSettings,
                true,
              )}
            </View>
          </View>

          {/* App Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#065F46" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>تطبيق القرآن الكريم</Text>
              <Text style={styles.infoVersion}>الإصدار 0.3.9</Text>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]} pointerEvents="none">
          <View style={styles.toastContent}>
            <Text style={styles.toastText}>قريباً</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1F3E5',
  },
  headerSafeArea: {
    backgroundColor: '#D1F3E5',
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
  headerDetails: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
  },
  headerSpacer: {
    width: 40,
  },
  backgroundPattern: {
    flex: 1,
  },
  backgroundPatternImage: {
    opacity: 0.03,
    resizeMode: 'repeat',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 12,
    marginRight: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconContainerDanger: {
    backgroundColor: '#FEF2F2',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  dangerText: {
    color: '#DC2626',
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  infoVersion: {
    fontSize: 14,
    color: '#059669',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
