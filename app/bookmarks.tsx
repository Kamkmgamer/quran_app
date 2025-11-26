import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import quranImport from '../assets/Quran.json';

const quran = quranImport as any[];

interface BookmarkedVerse {
  id: string;
  surah: number;
  verse: number;
  text: string;
  surahName: string;
  addedAt: number;
}

export default function Bookmarks() {
  const [bookmarkedVerses, setBookmarkedVerses] = useState<BookmarkedVerse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      const savedVersesString = await AsyncStorage.getItem('bookmarkedVerses');
      if (savedVersesString) {
        const savedVerses = JSON.parse(savedVersesString);
        const versesWithDetails = savedVerses.map((item: any) => {
          const surahData = quran[item.surah];
          const verseData = surahData.array[item.verse];
          return {
            id: `${item.surah}-${item.verse}`,
            surah: item.surah,
            verse: item.verse,
            text: verseData.ar,
            surahName: surahData.name,
            addedAt: item.addedAt || Date.now(),
          };
        });
        setBookmarkedVerses(versesWithDetails);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, []),
  );

  const removeBookmark = async (id: string) => {
    try {
      const updatedBookmarks = bookmarkedVerses.filter(item => item.id !== id);
      const bookmarksToSave = updatedBookmarks.map(item => ({
        surah: item.surah,
        verse: item.verse,
        addedAt: item.addedAt,
      }));
      await AsyncStorage.setItem('bookmarkedVerses', JSON.stringify(bookmarksToSave));
      setBookmarkedVerses(updatedBookmarks);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const navigateToVerse = (surah: number, verse: number) => {
    router.push({
      pathname: '/quran',
      params: { surah, verse },
    });
  };

  const renderVerseItem = ({ item }: { item: BookmarkedVerse }) => (
    <View style={styles.verseItem}>
      <TouchableOpacity style={styles.bookmarkButton} onPress={() => removeBookmark(item.id)}>
        <Ionicons name="bookmark" size={24} color="#065F46" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.verseContent}
        onPress={() => navigateToVerse(item.surah, item.verse)}
      >
        <Text style={styles.verseText}>
          {item.text} <Text style={styles.verseNumber}>﴿{item.verse + 1}﴾</Text>
        </Text>
        <Text style={styles.surahInfo}>
          {item.surahName} — الآية {item.verse + 1}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>لا توجد علامات مرجعية</Text>
      <Text style={styles.emptySubtitle}>اضغط مطولاً على أي آية في القرآن لحفظها هنا</Text>
    </View>
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
            <Text style={styles.headerTitle}>العلامات المرجعية</Text>
            <Text style={styles.headerSubtitle}>{bookmarkedVerses.length} آية محفوظة</Text>
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
        <View style={styles.contentContainer}>
          <View style={styles.contentCard}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>جاري التحميل...</Text>
              </View>
            ) : bookmarkedVerses.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={bookmarkedVerses}
                renderItem={renderVerseItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
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
    flexDirection: 'row',
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
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#065F46',
    overflow: 'hidden',
  },
  listContent: {
    paddingVertical: 8,
  },
  verseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bookmarkButton: {
    marginRight: 12,
    marginTop: 4,
  },
  verseContent: {
    flex: 1,
  },
  verseText: {
    fontSize: 20,
    color: '#1F2937',
    lineHeight: 36,
    textAlign: 'right',
    marginBottom: 8,
  },
  verseNumber: {
    fontSize: 18,
    color: '#065F46',
    fontWeight: '600',
  },
  surahInfo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
