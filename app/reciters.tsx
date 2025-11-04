import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import StorageService, { DownloadedAudio } from '../services/StorageService';
import AudioService from '../services/AudioService';
import recitersData from '../assets/reciters.json';
import quranData from '../assets/Quran.json';

const audioService = new AudioService();

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

const typedQuranData = quranData as Surah[];

interface Reciter {
  id: string;
  name: string;
  name_en: string;
  apiPath: string;
  quality: string;
  style: string;
  subfolder: string;
}

export default function Reciters() {
  const { state, setReciter } = useAudioPlayer();
  const [downloadedAudio, setDownloadedAudio] = useState<DownloadedAudio>({});
  const [downloadingReciter, setDownloadingReciter] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  useEffect(() => {
    loadDownloadedAudio();
  }, []);

  const loadDownloadedAudio = async () => {
    const downloaded = await StorageService.getDownloadedAudio();
    setDownloadedAudio(downloaded);
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownloadReciter = async (reciter: Reciter) => {
    Alert.alert(
      'تحميل التلاوة',
      `هل تريد تحميل بعض السور من تلاوة ${reciter.name}؟\n\nسيتم تحميل أول 10 سور (الفاتحة - يونس)`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحميل',
          onPress: () => downloadReciterSurahs(reciter),
        },
      ]
    );
  };

  const downloadReciterSurahs = async (reciter: Reciter) => {
    setDownloadingReciter(reciter.id);
    
    try {
      // تحميل أول 10 سور
      for (let surahId = 0; surahId < 10; surahId++) {
        const surah = typedQuranData[surahId];
        const totalVerses = surah.array.length;
        
        setDownloadProgress({ current: surahId + 1, total: 10 });

        await audioService.downloadSurah(
          reciter.apiPath,
          reciter.id,
          surahId + 1,
          totalVerses
        );
      }

      Alert.alert('تم التحميل', 'تم تحميل السور بنجاح');
      await loadDownloadedAudio();
    } catch (error) {
      console.error('Error downloading reciter:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التحميل');
    } finally {
      setDownloadingReciter(null);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const handleDeleteReciter = async (reciter: Reciter) => {
    Alert.alert(
      'حذف التلاوة',
      `هل تريد حذف تلاوة ${reciter.name} المحملة؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteReciterAudio(reciter.id);
            await loadDownloadedAudio();
          },
        },
      ]
    );
  };

  const isReciterDownloaded = (reciterId: string): boolean => {
    return downloadedAudio[reciterId]?.surahs?.length > 0;
  };

  const renderReciterCard = ({ item }: { item: Reciter }) => {
    const isSelected = state.currentReciterId === item.id;
    const isDownloaded = isReciterDownloaded(item.id);
    const isDownloading = downloadingReciter === item.id;

    return (
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        {/* معلومات القارئ */}
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => setReciter(item.id)}
        >
          <View style={styles.reciterIcon}>
            <Ionicons name="person" size={32} color="#065F46" />
          </View>
          
          <View style={styles.reciterInfo}>
            <Text style={styles.reciterName}>{item.name}</Text>
            <Text style={styles.reciterDetails}>
              {item.style} • {item.quality}
            </Text>
            
            {isDownloaded && (
              <View style={styles.downloadedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.downloadedText}>
                  {downloadedAudio[item.id].surahs.length} سورة محملة
                </Text>
                <Text style={styles.downloadedSize}>
                  {formatSize(downloadedAudio[item.id].totalSize)}
                </Text>
              </View>
            )}
          </View>

          {isSelected && (
            <Ionicons name="radio-button-on" size={24} color="#065F46" />
          )}
          {!isSelected && (
            <Ionicons name="radio-button-off" size={24} color="#D1D5DB" />
          )}
        </TouchableOpacity>

        {/* أزرار التحميل/الحذف */}
        <View style={styles.cardActions}>
          {isDownloading ? (
            <View style={styles.downloadingContainer}>
              <ActivityIndicator size="small" color="#065F46" />
              <Text style={styles.downloadingText}>
                جاري التحميل... ({downloadProgress.current}/{downloadProgress.total})
              </Text>
            </View>
          ) : isDownloaded ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteReciter(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={styles.deleteButtonText}>حذف</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => handleDownloadReciter(item)}
            >
              <Ionicons name="download-outline" size={18} color="#065F46" />
              <Text style={styles.downloadButtonText}>تحميل</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>اختر القارئ المفضل</Text>
        <Text style={styles.headerSubtitle}>
          يمكنك تحميل التلاوات للاستماع دون اتصال بالإنترنت
        </Text>
      </View>

      <FlatList
        data={recitersData.reciters}
        renderItem={renderReciterCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#065F46',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  reciterIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  reciterDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  downloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  downloadedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  downloadedSize: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  downloadButton: {
    backgroundColor: '#F0F9F8',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  downloadingText: {
    fontSize: 14,
    color: '#065F46',
  },
});

