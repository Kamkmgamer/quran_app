import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation } from '../contexts/LocationContext';
import PrayerTimesService, { CalculationMethod } from '../services/PrayerTimesService';

export default function CalculationMethodScreen() {
  const { calculationMethod, setCalculationMethod, location } = useLocation();
  const [methods, setMethods] = useState<CalculationMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoDesc] = useState('يتم تحديده تلقائياً حسب الدولة');

  useEffect(() => {
    loadMethods();
  }, [location]);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const availableMethods = await PrayerTimesService.getAvailableCalculationMethods();

      // Sort: Saudi, Egypt, others...
      const sortedMethods = [...availableMethods].sort((a, b) => {
        // Boost Makkah (4) and Egypt (5) to top
        if (a.id === 4) return -1;
        if (b.id === 4) return 1;
        if (a.id === 5) return -1;
        if (b.id === 5) return 1;
        return 0;
      });

      setMethods(sortedMethods);

      // Determine what auto would select right now if we know location
      if (location) {
        // We might need to look up country again or rely on what's in context/service
        // For now, simpler UI text is enough.
      }
    } catch (error) {
      console.error('Error loading methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = async (methodId: number | null) => {
    await setCalculationMethod(methodId);
    router.back();
  };

  const renderMethodItem = ({ item }: { item: CalculationMethod }) => {
    const isSelected = calculationMethod === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handleSelectMethod(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            <Ionicons
              name={isSelected ? 'checkmark' : 'globe-outline'}
              size={24}
              color={isSelected ? '#065F46' : '#6B7280'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.methodName, isSelected && styles.methodNameSelected]}>
              {item.name}
            </Text>
            <Text style={styles.methodParams}>
              Fajr: {item.params?.Fajr ?? '?'}°, Isha: {item.params?.Isha ?? '?'}°
            </Text>
          </View>
          {isSelected && <Ionicons name="radio-button-on" size={24} color="#065F46" />}
          {!isSelected && <Ionicons name="radio-button-off" size={24} color="#D1D5DB" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAutoOption = () => {
    const isSelected = calculationMethod === null;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected, styles.autoCard]}
        onPress={() => handleSelectMethod(null)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            <Ionicons name="locate" size={24} color={isSelected ? '#065F46' : '#6B7280'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.methodName, isSelected && styles.methodNameSelected]}>
              تلقائي (مستحسن)
            </Text>
            <Text style={styles.methodParams}>{autoDesc}</Text>
          </View>
          {isSelected && <Ionicons name="radio-button-on" size={24} color="#065F46" />}
          {!isSelected && <Ionicons name="radio-button-off" size={24} color="#D1D5DB" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#065F46" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>طريقة الحساب</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.contentHeader}>
          <Text style={styles.title}>اختر طريقة حساب المواقيت</Text>
          <Text style={styles.subtitle}>
            تختلف طرق حساب الفجر والعشاء حسب المنطقة والهيئة الفقهية المعتمدة.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#065F46" />
          </View>
        ) : (
          <FlatList
            data={methods}
            renderItem={renderMethodItem}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={() => (
              <View>
                {renderAutoOption()}
                <View style={styles.divider} />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },
  contentHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'right',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  autoCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  cardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#D1FAE5',
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  methodNameSelected: {
    color: '#065F46',
  },
  methodParams: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    marginHorizontal: 8,
  },
});
