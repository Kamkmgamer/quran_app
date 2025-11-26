import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

interface FontSizeOption {
  id: string;
  label: string;
  size: number;
  lineHeight: number;
}

const fontSizeOptions: FontSizeOption[] = [
  { id: 'small', label: 'صغير', size: 20, lineHeight: 40 },
  { id: 'medium', label: 'متوسط', size: 24, lineHeight: 48 },
  { id: 'large', label: 'كبير', size: 28, lineHeight: 56 },
  { id: 'xlarge', label: 'كبير جداً', size: 32, lineHeight: 64 },
];

const SAMPLE_TEXT =
  'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾';

export default function FontSize() {
  const [selectedSize, setSelectedSize] = useState<string>('medium');

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedSize = await AsyncStorage.getItem('quranFontSize');
      if (savedSize) {
        setSelectedSize(savedSize);
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

  const saveFontSize = async (sizeId: string) => {
    try {
      await AsyncStorage.setItem('quranFontSize', sizeId);
      setSelectedSize(sizeId);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const selectedOption = fontSizeOptions.find(opt => opt.id === selectedSize) || fontSizeOptions[1];

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
            <Text style={styles.headerTitle}>حجم الخط</Text>
            <Text style={styles.headerSubtitle}>اختر حجم الخط المناسب</Text>
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Preview Card */}
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>معاينة</Text>
            <View style={styles.previewTextContainer}>
              <Text
                style={[
                  styles.previewText,
                  {
                    fontSize: selectedOption.size,
                    lineHeight: selectedOption.lineHeight,
                  },
                ]}
              >
                {SAMPLE_TEXT}
              </Text>
            </View>
          </View>

          {/* Font Size Options */}
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>خيارات حجم الخط</Text>
            {fontSizeOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionItem, selectedSize === option.id && styles.optionItemSelected]}
                onPress={() => saveFontSize(option.id)}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedSize === option.id && styles.radioButtonSelected,
                    ]}
                  >
                    {selectedSize === option.id && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedSize === option.id && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                <View style={styles.optionRight}>
                  <Text style={styles.optionSize}>{option.size}</Text>
                  <Ionicons
                    name="text"
                    size={20}
                    color={selectedSize === option.id ? '#065F46' : '#9CA3AF'}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#065F46" />
            <Text style={styles.infoText}>سيتم تطبيق حجم الخط المختار على جميع آيات القرآن</Text>
          </View>
        </ScrollView>
      </ImageBackground>
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
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
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
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#065F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewTextContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  previewText: {
    color: '#1F2937',
    textAlign: 'right',
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#065F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#065F46',
  },
  optionLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#065F46',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#065F46',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  optionLabelSelected: {
    color: '#065F46',
  },
  optionRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  optionSize: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    textAlign: 'right',
  },
});
