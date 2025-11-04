import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface LastPosition {
  surahId: number;
  verseId: number;
  reciterId: string;
  timestamp: number;
}

export interface DownloadedAudio {
  [reciterId: string]: {
    surahs: number[];
    totalSize: number;
  };
}

export interface UserPreferences {
  autoPlay: boolean;
  playbackSpeed: number;
  repeatMode: 'none' | 'verse' | 'surah' | 'all';
  selectedReciter: string;
}

class StorageService {
  private static readonly LAST_POSITION_KEY = '@quran_last_position';
  private static readonly DOWNLOADED_AUDIO_KEY = '@quran_downloaded_audio';
  private static readonly PREFERENCES_KEY = '@quran_preferences';
  private static readonly AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;

  // حفظ آخر موضع استماع
  async saveLastPosition(position: LastPosition): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageService.LAST_POSITION_KEY,
        JSON.stringify(position)
      );
    } catch (error) {
      console.error('Error saving last position:', error);
    }
  }

  // استرجاع آخر موضع استماع
  async getLastPosition(): Promise<LastPosition | null> {
    try {
      const data = await AsyncStorage.getItem(StorageService.LAST_POSITION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting last position:', error);
      return null;
    }
  }

  // حفظ تفضيلات المستخدم
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageService.PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  // استرجاع تفضيلات المستخدم
  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(StorageService.PREFERENCES_KEY);
      return data
        ? JSON.parse(data)
        : {
            autoPlay: false,
            playbackSpeed: 1.0,
            repeatMode: 'none',
            selectedReciter: 'abdul_basit',
          };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {
        autoPlay: false,
        playbackSpeed: 1.0,
        repeatMode: 'none',
        selectedReciter: 'abdul_basit',
      };
    }
  }

  // حفظ معلومات الملفات الصوتية المحملة
  async saveDownloadedAudio(reciterId: string, surahId: number, size: number): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(StorageService.DOWNLOADED_AUDIO_KEY);
      const downloaded: DownloadedAudio = data ? JSON.parse(data) : {};

      if (!downloaded[reciterId]) {
        downloaded[reciterId] = { surahs: [], totalSize: 0 };
      }

      if (!downloaded[reciterId].surahs.includes(surahId)) {
        downloaded[reciterId].surahs.push(surahId);
        downloaded[reciterId].totalSize += size;
      }

      await AsyncStorage.setItem(
        StorageService.DOWNLOADED_AUDIO_KEY,
        JSON.stringify(downloaded)
      );
    } catch (error) {
      console.error('Error saving downloaded audio:', error);
    }
  }

  // الحصول على قائمة الملفات المحملة
  async getDownloadedAudio(): Promise<DownloadedAudio> {
    try {
      const data = await AsyncStorage.getItem(StorageService.DOWNLOADED_AUDIO_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting downloaded audio:', error);
      return {};
    }
  }

  // التحقق من وجود سورة محملة
  async isSurahDownloaded(reciterId: string, surahId: number): Promise<boolean> {
    try {
      const downloaded = await this.getDownloadedAudio();
      return downloaded[reciterId]?.surahs?.includes(surahId) || false;
    } catch (error) {
      console.error('Error checking if surah is downloaded:', error);
      return false;
    }
  }

  // تحميل ملف صوتي
  async downloadAudioFile(
    url: string,
    reciterId: string,
    surahId: number,
    verseId: number,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      // إنشاء المجلد إذا لم يكن موجوداً
      const reciterDir = `${StorageService.AUDIO_DIR}${reciterId}/`;
      const dirInfo = await FileSystem.getInfoAsync(reciterDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(reciterDir, { intermediates: true });
      }

      // تحديد مسار الملف
      const surahPadded = surahId.toString().padStart(3, '0');
      const versePadded = verseId.toString().padStart(3, '0');
      const fileName = `${surahPadded}${versePadded}.mp3`;
      const fileUri = `${reciterDir}${fileName}`;

      // التحقق من وجود الملف
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        return fileUri;
      }

      // تحميل الملف
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result) {
        // حفظ معلومات التحميل
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        const fileSize = (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0;
        await this.saveDownloadedAudio(reciterId, surahId, fileSize);
        return result.uri;
      }

      return null;
    } catch (error) {
      console.error('Error downloading audio file:', error);
      return null;
    }
  }

  // حذف تلاوة قارئ معين
  async deleteReciterAudio(reciterId: string): Promise<void> {
    try {
      const reciterDir = `${StorageService.AUDIO_DIR}${reciterId}/`;
      const dirInfo = await FileSystem.getInfoAsync(reciterDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(reciterDir, { idempotent: true });
      }

      // تحديث البيانات المحفوظة
      const data = await AsyncStorage.getItem(StorageService.DOWNLOADED_AUDIO_KEY);
      const downloaded: DownloadedAudio = data ? JSON.parse(data) : {};
      delete downloaded[reciterId];
      await AsyncStorage.setItem(
        StorageService.DOWNLOADED_AUDIO_KEY,
        JSON.stringify(downloaded)
      );
    } catch (error) {
      console.error('Error deleting reciter audio:', error);
    }
  }

  // الحصول على حجم المساحة المستخدمة
  async getUsedSpace(): Promise<number> {
    try {
      const downloaded = await this.getDownloadedAudio();
      let totalSize = 0;
      Object.values(downloaded).forEach((reciter) => {
        totalSize += reciter.totalSize;
      });
      return totalSize;
    } catch (error) {
      console.error('Error getting used space:', error);
      return 0;
    }
  }

  // الحصول على مسار الملف المحلي إذا كان موجوداً
  async getLocalAudioPath(
    reciterId: string,
    surahId: number,
    verseId: number
  ): Promise<string | null> {
    try {
      const surahPadded = surahId.toString().padStart(3, '0');
      const versePadded = verseId.toString().padStart(3, '0');
      const fileName = `${surahPadded}${versePadded}.mp3`;
      const fileUri = `${StorageService.AUDIO_DIR}${reciterId}/${fileName}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists ? fileUri : null;
    } catch (error) {
      console.error('Error getting local audio path:', error);
      return null;
    }
  }
}

// Export class instead of singleton instance
export { StorageService };

// Create a default export for backward compatibility
const storageServiceInstance = new StorageService();
export default storageServiceInstance;

