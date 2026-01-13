/**
 * AyahOfDayCard Component
 *
 * Displays the Ayah (verse) of the Day fetched from the CMS via tRPC.
 */

import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { trpc } from '../utils/api';

interface AyahOfDayData {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  translation?: string;
  date: string;
}

interface AyahOfDayCardProps {
  onPress?: () => void;
}

export function AyahOfDayCard({ onPress }: AyahOfDayCardProps) {
  // We cast to 'any' to bypass strict tRPC typing temporarily until shared types are set up
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error, refetch } = (trpc as any).ayahOfDay.getToday.useQuery();

  const ayah = data as AyahOfDayData | null;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#D4AF37" />
        <Text style={styles.loadingText}>جاري تحميل آية اليوم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <TouchableOpacity style={[styles.container, styles.errorContainer]} onPress={() => refetch()}>
        <Text style={styles.errorText}>حدث خطأ في تحميل آية اليوم</Text>
        <Text style={styles.retryText}>اضغط للمحاولة مرة أخرى</Text>
      </TouchableOpacity>
    );
  }

  if (!ayah) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>لا توجد آية لهذا اليوم</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>آية اليوم</Text>
        <Text style={styles.surahInfo}>
          {ayah.surahName} - آية {ayah.ayahNumber}
        </Text>
      </View>

      <Text style={styles.ayahText} numberOfLines={4}>
        {ayah.text}
      </Text>

      {ayah.translation && (
        <Text style={styles.translationText} numberOfLines={2}>
          {ayah.translation}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#065F46',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahInfo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  ayahText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    fontFamily: 'System',
  },
  translationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
