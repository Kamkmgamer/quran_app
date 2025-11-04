import { Audio } from 'expo-av';
import StorageService from './StorageService';

export interface VerseAudio {
  surahId: number;
  verseId: number;
  reciterId: string;
  url: string;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentVerse: VerseAudio | null = null;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1.0;
  private onPlaybackStatusUpdate: ((status: any) => void) | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // لا نستدعي initializeAudio هنا لتجنب مشاكل التحميل
  }

  // تهيئة إعدادات الصوت
  private async initializeAudio() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // بناء رابط الصوت من Everyayah API
  private buildAudioUrl(reciterPath: string, surahId: number, verseId: number): string {
    const surahPadded = surahId.toString().padStart(3, '0');
    const versePadded = verseId.toString().padStart(3, '0');
    return `https://everyayah.com/data/${reciterPath}/${surahPadded}${versePadded}.mp3`;
  }

  // تحميل وتشغيل آية
  async loadAndPlayVerse(
    reciterPath: string,
    reciterId: string,
    surahId: number,
    verseId: number,
    autoPlay: boolean = true
  ): Promise<void> {
    try {
      // تهيئة Audio عند أول استخدام
      await this.initializeAudio();
      
      // إيقاف التشغيل الحالي إن وجد
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // التحقق من وجود ملف محلي
      const localPath = await StorageService.getLocalAudioPath(reciterId, surahId, verseId);
      const audioSource = localPath
        ? { uri: localPath }
        : { uri: this.buildAudioUrl(reciterPath, surahId, verseId) };

      // تحميل الصوت
      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        { 
          shouldPlay: autoPlay,
          rate: this.playbackSpeed,
          shouldCorrectPitch: true,
        },
        (status) => this.onStatusUpdate(status)
      );

      this.sound = sound;
      this.currentVerse = {
        surahId,
        verseId,
        reciterId,
        url: this.buildAudioUrl(reciterPath, surahId, verseId),
      };
      this.isPlaying = autoPlay;

      // حفظ آخر موضع
      await StorageService.saveLastPosition({
        surahId,
        verseId,
        reciterId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error loading and playing verse:', error);
      throw error;
    }
  }

  // معالجة تحديثات حالة التشغيل
  private onStatusUpdate(status: any) {
    if (this.onPlaybackStatusUpdate) {
      this.onPlaybackStatusUpdate(status);
    }
  }

  // تعيين callback لتحديثات التشغيل
  setOnPlaybackStatusUpdate(callback: (status: any) => void) {
    this.onPlaybackStatusUpdate = callback;
  }

  // تشغيل
  async play(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  // إيقاف مؤقت
  async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  // إيقاف
  async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  // تبديل بين تشغيل وإيقاف
  async togglePlayPause(): Promise<void> {
    if (this.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  // تغيير سرعة التشغيل
  async setPlaybackSpeed(speed: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(speed, true);
        this.playbackSpeed = speed;

        // حفظ السرعة في التفضيلات
        const preferences = await StorageService.getPreferences();
        await StorageService.savePreferences({
          ...preferences,
          playbackSpeed: speed,
        });
      }
    } catch (error) {
      console.error('Error setting playback speed:', error);
    }
  }

  // الانتقال إلى موضع معين
  async seekTo(positionMillis: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  }

  // الحصول على حالة التشغيل
  async getStatus(): Promise<any> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  // تنظيف الموارد
  async cleanup(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      this.currentVerse = null;
      this.isPlaying = false;
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  }

  // الحصول على الآية الحالية
  getCurrentVerse(): VerseAudio | null {
    return this.currentVerse;
  }

  // الحصول على حالة التشغيل
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // الحصول على سرعة التشغيل
  getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  // تحميل آية مسبقاً للاستخدام دون اتصال
  async preloadVerse(
    reciterPath: string,
    reciterId: string,
    surahId: number,
    verseId: number,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    try {
      const url = this.buildAudioUrl(reciterPath, surahId, verseId);
      const result = await StorageService.downloadAudioFile(
        url,
        reciterId,
        surahId,
        verseId,
        onProgress
      );
      return result !== null;
    } catch (error) {
      console.error('Error preloading verse:', error);
      return false;
    }
  }

  // تحميل سورة كاملة
  async downloadSurah(
    reciterPath: string,
    reciterId: string,
    surahId: number,
    totalVerses: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<boolean> {
    try {
      for (let verseId = 1; verseId <= totalVerses; verseId++) {
        const success = await this.preloadVerse(
          reciterPath,
          reciterId,
          surahId,
          verseId
        );
        
        if (onProgress) {
          onProgress(verseId, totalVerses);
        }

        if (!success) {
          console.error(`Failed to download verse ${verseId} of surah ${surahId}`);
        }
      }
      return true;
    } catch (error) {
      console.error('Error downloading surah:', error);
      return false;
    }
  }
}

// Export class instead of singleton instance
export { AudioService };

// Create a default export for backward compatibility
const audioServiceInstance = new AudioService();
export default audioServiceInstance;

