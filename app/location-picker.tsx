import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation } from '../contexts/LocationContext';
import PrayerTimesService from '../services/PrayerTimesService';

interface SearchResult {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export default function LocationPickerScreen() {
  const { setManualLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (text.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const locations = await PrayerTimesService.searchLocation(text);
        setResults(locations);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleSelectLocation = async (item: SearchResult) => {
    try {
      if (setManualLocation) {
        await setManualLocation({
          latitude: item.lat,
          longitude: item.lng,
          name: item.name,
          country: item.country,
        });
        router.back();
      }
    } catch (error) {
      console.error('Selection error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-forward" size={28} color="#065F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تحديد الموقع يدوياً</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن مدينتك..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleSearch}
          textAlign="right"
        />
        {loading && <ActivityIndicator size="small" color="#065F46" style={styles.loader} />}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectLocation(item)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.cityName}>{item.name}</Text>
              <Text style={styles.countryName}>{item.country}</Text>
            </View>
            <Ionicons name="location-outline" size={24} color="#065F46" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {query.length > 0 && !loading ? (
              <Text style={styles.emptyText}>لا توجد نتائج</Text>
            ) : query.length === 0 ? (
              <Text style={styles.emptyText}>ادخل اسم المدينة للبحث</Text>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 50,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  loader: {
    marginRight: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  resultItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  countryName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
