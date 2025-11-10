/**
 * TimingService
 *
 * خدمة لإدارة توقيتات الآيات للمزامنة مع الصوت
 *
 * ملاحظة: هذه نسخة بسيطة تستخدم توقيتات افتراضية.
 * للحصول على مزامنة دقيقة، يجب استخدام ملفات توقيت حقيقية من مصادر موثوقة مثل:
 * - Tanzil.net
 * - Quran.com API
 * - EveryAyah.com timing files
 */

interface VerseTiming {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
}

interface SurahTiming {
  surah: number;
  name: string;
  verses: VerseTiming[];
}

class TimingService {
  private timingsCache: Map<number, SurahTiming> = new Map();

  /**
   * الحصول على توقيتات سورة معينة
   */
  async getSurahTimings(surahId: number): Promise<SurahTiming | null> {
    // التحقق من الكاش أولاً
    if (this.timingsCache.has(surahId)) {
      return this.timingsCache.get(surahId)!;
    }

    try {
      // محاولة تحميل ملف التوقيت إذا كان موجوداً
      const timingFile = await import(`../assets/timings/${surahId.toString().padStart(3, '0')}.json`);
      this.timingsCache.set(surahId, timingFile.default);
      return timingFile.default;
    } catch {
      // إذا لم يكن الملف موجوداً، نستخدم توقيتات افتراضية
      console.log(`No timing file found for surah ${surahId}, using default timings`);
      return null;
    }
  }

  /**
   * الحصول على توقيت آية معينة
   */
  async getVerseTiming(surahId: number, verseId: number): Promise<VerseTiming | null> {
    const surahTimings = await this.getSurahTimings(surahId);
    if (!surahTimings) return null;

    const verseTiming = surahTimings.verses.find((v) => v.id === verseId);
    return verseTiming || null;
  }

  /**
   * تحديد الآية الحالية بناءً على موضع التشغيل
   */
  async getCurrentVerseFromPosition(
    surahId: number,
    positionMillis: number,
  ): Promise<number | null> {
    const surahTimings = await this.getSurahTimings(surahId);
    if (!surahTimings) return null;

    for (const verse of surahTimings.verses) {
      if (positionMillis >= verse.startTime && positionMillis <= verse.endTime) {
        return verse.id;
      }
    }

    return null;
  }

  /**
   * حساب توقيت افتراضي للآية (عندما لا يكون هناك ملف توقيت)
   * يفترض أن كل آية تستغرق حوالي 5 ثوانيّ في المتوسط
   */
  getDefaultVerseTiming(verseId: number, averageDuration: number = 5000): VerseTiming {
    const startTime = (verseId - 1) * averageDuration;
    const endTime = verseId * averageDuration;

    return {
      id: verseId,
      startTime,
      endTime,
      duration: averageDuration,
    };
  }

  /**
   * حساب التوقيت الإجمالي للسورة
   */
  async getTotalSurahDuration(surahId: number): Promise<number> {
    const surahTimings = await this.getSurahTimings(surahId);
    if (!surahTimings || surahTimings.verses.length === 0) {
      return 0;
    }

    const lastVerse = surahTimings.verses[surahTimings.verses.length - 1];
    return lastVerse.endTime;
  }

  /**
   * تنظيف الكاش
   */
  clearCache() {
    this.timingsCache.clear();
  }
}

// Export class instead of singleton instance
export { TimingService };

// Create a default export for backward compatibility
const timingServiceInstance = new TimingService();
export default timingServiceInstance;

