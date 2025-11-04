# حل المشاكل - Audio Recitation System

## المشكلة: `Cannot read property 'prototype' of undefined`

### الأسباب المحتملة

#### 1. مكتبة Slider غير متوافقة ❌
كانت مكتبة `@react-native-community/slider` تتطلب native build وتسبب مشاكل توافق مع Expo.

#### 2. تهيئة Audio في Constructor ❌
كان `AudioService` يستدعي `Audio.setAudioModeAsync` في الـ constructor مباشرة عند تحميل الملف، قبل أن يكون Expo جاهزاً.

### الحلول المُطبقة ✅

#### الحل 1: استبدال Slider

تم استبدال Slider component بشريط تقدم مخصص مبني على React Native View components:

```tsx
// بدلاً من:
<Slider
  value={state.position}
  maximumValue={state.duration}
  onSlidingComplete={(value) => seekTo(value)}
/>

// نستخدم:
<View style={styles.progressBarContainer}>
  <View style={styles.progressBarBg}>
    <View
      style={[
        styles.progressBarFill,
        {
          width: `${(state.position / state.duration) * 100}%`,
        },
      ]}
    />
  </View>
</View>
```

**الفوائد:**
✅ لا يتطلب native build
✅ يعمل مباشرة مع Expo Go
✅ خفيف وسريع
✅ قابل للتخصيص بالكامل

#### الحل 2: Lazy Initialization للـ Audio

تم تعديل `AudioService` لتأخير تهيئة Audio حتى أول استخدام:

```typescript
// في services/AudioService.ts
class AudioService {
  private isInitialized: boolean = false;

  constructor() {
    // لا نستدعي initializeAudio هنا
  }

  private async initializeAudio() {
    if (this.isInitialized) return;
    
    await Audio.setAudioModeAsync({...});
    this.isInitialized = true;
  }

  async loadAndPlayVerse(...) {
    // تهيئة عند أول استخدام
    await this.initializeAudio();
    // ... بقية الكود
  }
}
```

**الفوائد:**
✅ تجنب استدعاء Audio قبل جاهزية التطبيق
✅ تهيئة lazy فقط عند الحاجة
✅ منع أخطاء التحميل

### ملاحظات
- شريط التقدم الحالي للعرض فقط
- لإضافة إمكانية السحب، استخدم `PanResponder` أو `react-native-gesture-handler`
- Audio يتم تهيئته فقط عند أول تشغيل

---

## مشاكل أخرى محتملة

### 1. خطأ في تشغيل الصوت

**الأعراض:**
```
Error loading audio
```

**الحلول:**
- تأكد من اتصال الإنترنت للـ streaming
- تحقق من صحة رابط الصوت
- جرب قارئ آخر

### 2. التطبيق بطيء أو يتجمد

**الأعراض:**
- بطء في التنقل
- تأخير في استجابة الأزرار

**الحلول:**
```bash
# امسح الكاش
npx expo start -c

# أو أعد تثبيت المكتبات
rm -rf node_modules
npm install
```

### 3. المشغل المصغر لا يظهر

**السبب المحتمل:**
- لم يتم تشغيل أي آية بعد

**الحل:**
- اذهب لصفحة القرآن واضغط زر التشغيل بجانب أي آية

### 4. التحميل لا يعمل

**الأعراض:**
```
Error downloading audio file
```

**الحلول:**
- تحقق من المساحة المتاحة في الجهاز
- تأكد من صلاحيات التطبيق للوصول للتخزين
- جرب سورة أقصر أولاً

### 5. الصوت لا يتزامن مع النص

**السبب:**
- غياب ملف التوقيت للسورة

**الحل:**
- أضف ملف `XXX.json` في مجلد `assets/timings/`
- استخدم التوقيت الافتراضي (موجود في TimingService)

---

## تشغيل التطبيق بشكل صحيح

### الطريقة الموصى بها

```bash
# 1. امسح الكاش
npx expo start -c

# 2. اختر المنصة
# اضغط 'a' لـ Android
# اضغط 'i' لـ iOS
# امسح QR code لـ Expo Go
```

### إذا استمرت المشاكل

```bash
# إعادة تثبيت كاملة
rm -rf node_modules
npm install
npx expo start -c
```

---

## نصائح لتجربة أفضل

### للتطوير
1. استخدم `npx expo start -c` عند التبديل بين branches
2. أعد تشغيل Expo عند إضافة مكتبات جديدة
3. تحقق من console للأخطاء

### للاستخدام
1. جرب التشغيل عبر الإنترنت أولاً
2. حمل السور المفضلة للاستخدام دون اتصال
3. اختر جودة أقل (64kbps) لتوفير المساحة

---

## الدعم الفني

إذا واجهت مشكلة غير مذكورة هنا:

1. **تحقق من Console:**
   ```bash
   npx expo start
   # شاهد الأخطاء في الـ terminal
   ```

2. **تحقق من الـ logs:**
   - في Expo Go: هز الجهاز → عرض logs
   - في Metro Bundler: تابع الـ terminal

3. **معلومات مفيدة للإبلاغ عن المشاكل:**
   - نص الخطأ الكامل
   - الخطوات لإعادة إنتاج المشكلة
   - نسخة Expo: `expo --version`
   - نظام التشغيل والجهاز

---

## تحديثات مستقبلية

### قيد التطوير
- [ ] إضافة Slider تفاعلي (مع gesture handlers)
- [ ] تحسين الأداء للملفات الكبيرة
- [ ] إضافة إشعارات التحكم في الخلفية

### اقتراحات مرحب بها
إذا كان لديك اقتراحات لتحسين النظام، شاركها معنا!

---

**آخر تحديث:** نوفمبر 2025

