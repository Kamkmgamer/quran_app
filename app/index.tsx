import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import quran from '../assets/Quran.json';
import { AyahOfDayCard } from '../components/AyahOfDayCard';
import Menu from '../components/Menu';

interface Verse {
  id: number;
  ar: string;
  en: string;
  filename: string;
  path: string;
  dir: string;
  size: number;
}

interface Surah {
  id: number;
  name: string;
  name_en: string;
  name_translation: string;
  words: number;
  letters: number;
  type: string;
  type_en: string;
  ar: string;
  en: string;
  array: Verse[];
}

export default function HomeScreen() {
  const surahList = quran as Surah[];
  const [surah, setSurah] = React.useState(0);
  const [verse, setVerse] = React.useState(0);
  const [surahSearchList] = React.useState<Surah[]>(surahList);
  // const [activeTab, setActiveTab] = React.useState('سورة');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<string>('');

  const loadSavedVerse = async () => {
    try {
      const lastVisitedData = await AsyncStorage.getItem('@quran_last_visited');
      if (lastVisitedData) {
        const { surah, verse } = JSON.parse(lastVisitedData);
        setSurah(surah);
        setVerse(verse);
      } else {
        // Fallback to old key if new one doesn't exist
        const existingData = await AsyncStorage.getItem('savedVerses');
        const savedVerse = existingData ? JSON.parse(existingData) : { surah: 0, verse: 0 };
        setSurah(savedVerse.surah);
        setVerse(savedVerse.verse);
      }
    } catch (error) {
      console.error('Error loading saved verse:', error);
    }
  };

  const loadLastListeningPosition = async () => {
    try {
      // Removed unused StorageService call
    } catch (error) {
      console.error('Error loading last listening position:', error);
    }
  };

  const toArabicDigits = (value: string | number) => {
    const str = typeof value === 'number' ? value.toString() : value;
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/\d/g, digit => arabicDigits[Number(digit)]);
  };

  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Convert to 12-hour format
    const isPm = hours >= 12;
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = isPm ? 'م' : 'ص';

    const latinFormatted = `${displayHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${period}`;

    return toArabicDigits(latinFormatted);
  };

  const updateTime = () => {
    setCurrentTime(formatTime());
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSavedVerse();
      loadLastListeningPosition();
      updateTime();
    }, []),
  );

  React.useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // const tabs = ['سورة', 'جزء', 'الأذكار'];
  // Temporarily hide جزء and الأذكار tabs
  // const visibleTabs = tabs.filter(tab => tab === 'سورة');

  const renderSurahCard = ({ item }: { item: Surah }) => {
    const isLastRead = item.id - 1 === surah;
    const backgroundColor = isLastRead ? '#FEF3C7' : '#fff'; // Lighter background for last visited
    const borderColor = isLastRead ? '#D4AF37' : '#E5E7EB';
    const textColor = isLastRead ? '#065F46' : '#065F46'; // Keep text dark green
    const numberColor = isLastRead ? '#D4AF37' : '#065F46'; // Highlight number
    const verseCountColor = isLastRead ? '#065F46' : '#065F46';

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/quran',
            params: { surah: item.id - 1, verse: 0 },
          })
        }
        style={[
          styles.card,
          {
            backgroundColor,
            borderColor,
            borderWidth: isLastRead ? 2 : 1, // Thicker border for last visited
          },
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.surahName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.surahNumber, { color: numberColor }]}>{item.id}</Text>
        </View>
        <Text style={[styles.verseCount, { color: verseCountColor }]}>
          {item.array.length} آيات
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Mosque Background */}
      <ImageBackground
        source={require('../assets/images/Mosque.png')}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu" size={24} color="#065F46" />
            </TouchableOpacity>
            <Text style={styles.headerTime}>{currentTime}</Text>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color="#065F46" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Recently Read Section */}
      <View style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <Ionicons name="bookmark" size={20} color="#D4AF37" />
          <Text style={styles.recentTitle}>ماتم قراءته مؤخرا</Text>
        </View>
        <Text style={styles.recentSurah}>{surahList[surah as number].name}</Text>
        <View style={styles.recentFooter}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/quran',
                params: { surah: surah, verse: verse },
              })
            }
            style={styles.continueButton}
          >
            <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
            <Text style={styles.continueText}>متابعة</Text>
          </TouchableOpacity>
          <Text style={styles.recentVerse}>الأية : {verse + 1}</Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
        {/* Tabs */}
        {/* <View style={styles.tabsContainer}>
          {visibleTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Surah Grid */}
        <FlatList
          data={surahSearchList}
          renderItem={renderSurahCard}
          keyExtractor={(item: any) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<AyahOfDayCard />}
          ListHeaderComponentStyle={{ marginBottom: 16 }}
        />
      </SafeAreaView>

      {/* Menu Component */}
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
  },
  headerBackground: {
    width: '100%',
    height: 280,
    backgroundColor: '#FEF3C7',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerSafeArea: {
    flex: 1,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  headerTime: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentCard: {
    backgroundColor: '#065F46',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -100,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recentHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  recentSurah: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  recentFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentVerse: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
  },
  continueButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  continueText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#065F46',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#065F46',
    fontWeight: '600',
    textAlign: 'center',
  },
  gridContainer: {
    paddingBottom: 100,
  },
  columnWrapper: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 20,
    minHeight: 100,
  },
  cardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  surahNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  surahName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginRight: 8,
  },
  verseCount: {
    fontSize: 12,
    textAlign: 'right',
  },
});
