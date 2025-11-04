// Test data utilities for consistent testing

export const mockQuranData = [
  {
    id: 1,
    name: 'الفاتحة',
    name_en: 'The Opening',
    name_translation: 'Al-Fatihah',
    words: 29,
    letters: 139,
    type: 'مكية',
    type_en: 'meccan',
    ar: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)',
    en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful (1) [All] praise is [due] to Allah, Lord of the worlds (2) The Entirely Merciful, the Especially Merciful (3) Sovereign of the Day of Recompense (4) It is You we worship and You we ask for help (5) Guide us to the straight path (6) The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray (7)',
    array: [
      {
        id: 1,
        ar: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
        en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
        filename: '001.mp3',
        path: '/audio/001/001.mp3',
        dir: '/audio/001',
      },
      {
        id: 2,
        ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        en: '[All] praise is [due] to Allah, Lord of the worlds',
        filename: '002.mp3',
        path: '/audio/001/002.mp3',
        dir: '/audio/001',
      },
      {
        id: 3,
        ar: 'الرَّحْمَنِ الرَّحِيمِ',
        en: 'The Entirely Merciful, the Especially Merciful',
        filename: '003.mp3',
        path: '/audio/001/003.mp3',
        dir: '/audio/001',
      },
      {
        id: 4,
        ar: 'مَالِكِ يَوْمِ الدِّينِ',
        en: 'Sovereign of the Day of Recompense',
        filename: '004.mp3',
        path: '/audio/001/004.mp3',
        dir: '/audio/001',
      },
      {
        id: 5,
        ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        en: 'It is You we worship and You we ask for help',
        filename: '005.mp3',
        path: '/audio/001/005.mp3',
        dir: '/audio/001',
      },
      {
        id: 6,
        ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        en: 'Guide us to the straight path',
        filename: '006.mp3',
        path: '/audio/001/006.mp3',
        dir: '/audio/001',
      },
      {
        id: 7,
        ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray',
        filename: '007.mp3',
        path: '/audio/001/007.mp3',
        dir: '/audio/001',
      },
    ],
  },
  {
    id: 2,
    name: 'البقرة',
    name_en: 'The Cow',
    name_translation: 'Al-Baqarah',
    words: 6144,
    letters: 25500,
    type: 'مدنية',
    type_en: 'medinan',
    ar: 'الم (1) ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ هُدًى لِلْمُتَّقِينَ (2) الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ (3) وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ (4) أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ (5)',
    en: 'Alif, Lam, Meem (1) This is the Book about which there is no doubt, a guidance for those conscious of Allah (2) Who believe in the unseen, establish prayer, and spend out of what We have provided for them (3) And who believe in what has been revealed to you, [O Muhammad], and what was revealed before you, and of the Hereafter they are certain [in faith] (4) Those are upon [right] guidance from their Lord, and it is those who are the successful (5)',
    array: [
      {
        id: 1,
        ar: 'الم',
        en: 'Alif, Lam, Meem',
        filename: '001.mp3',
        path: '/audio/002/001.mp3',
        dir: '/audio/002',
      },
      {
        id: 2,
        ar: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ هُدًى لِلْمُتَّقِينَ',
        en: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah',
        filename: '002.mp3',
        path: '/audio/002/002.mp3',
        dir: '/audio/002',
      },
      {
        id: 3,
        ar: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ',
        en: 'Who believe in the unseen, establish prayer, and spend out of what We have provided for them',
        filename: '003.mp3',
        path: '/audio/002/003.mp3',
        dir: '/audio/002',
      },
    ],
  },
];

export const mockRecitersData = {
  reciters: [
    {
      id: 'abdul_basit',
      name: 'عبد الباسط عبد الصمد',
      name_en: 'Abdul Basit',
      apiPath: 'Abdul_Basit_Murattal_192kbps',
      quality: '192kbps',
      style: 'مرتل',
      subfolder: 'Abdul_Basit_Murattal_192kbps',
    },
    {
      id: 'maher_almuaiqly',
      name: 'ماهر المعيقلي',
      name_en: 'Maher Al-Muaiqly',
      apiPath: 'Maher_AlMuaiqly_64kbps',
      quality: '64kbps',
      style: 'مرتل',
      subfolder: 'Maher_AlMuaiqly_64kbps',
    },
    {
      id: 'saud_al_shuraim',
      name: 'سعود الشريم',
      name_en: 'Saud Al-Shuraim',
      apiPath: 'Saud_Al-Shuraim_192kbps',
      quality: '192kbps',
      style: 'مرتل',
      subfolder: 'Saud_Al-Shuraim_192kbps',
    },
  ],
};

export const mockUserPreferences = {
  autoPlay: false,
  playbackSpeed: 1.0,
  repeatMode: 'none' as const,
  selectedReciter: 'abdul_basit',
};

export const mockLastPosition = {
  surahId: 1,
  verseId: 5,
  reciterId: 'abdul_basit',
  timestamp: Date.now(),
};

export const mockDownloadedAudio = {
  'abdul_basit': {
    surahs: [1, 2, 3],
    totalSize: 3072,
  },
  'maher_almuaiqly': {
    surahs: [1, 2],
    totalSize: 2048,
  },
};

export const mockAudioPlayerState = {
  isPlaying: false,
  currentSurahId: null,
  currentVerseId: null,
  currentReciterId: 'abdul_basit',
  playbackSpeed: 1.0,
  repeatMode: 'none' as const,
  position: 0,
  duration: 0,
  isLoading: false,
  currentReciter: mockRecitersData.reciters[0],
};

export const mockAudioStatus = {
  isLoaded: true,
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 30000,
  didJustFinish: false,
  isLooping: false,
  volume: 1.0,
  isMuted: false,
  rate: 1.0,
  shouldCorrectPitch: false,
  volumeInfo: {},
  progressUpdateIntervalMillis: 500,
  playbackSourceUri: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3',
  progress: 0,
  playableDurationMillis: 30000,
  seekableDurationMillis: 30000,
};

export const mockLocationData = {
  coords: {
    latitude: 24.7136,
    longitude: 46.6753,
    altitude: null,
    accuracy: 10,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

export const mockPrayerTimes = {
  fajr: '05:30',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '18:15',
  isha: '19:45',
  date: '2024-01-01',
};

// Helper functions to create test data variations
export const createMockSurah = (id: number, name: string, verseCount: number) => {
  const verses = Array.from({ length: verseCount }, (_, index) => ({
    id: index + 1,
    ar: `Verse ${index + 1} Arabic text`,
    en: `Verse ${index + 1} English translation`,
    filename: `${String(index + 1).padStart(3, '0')}.mp3`,
    path: `/audio/${String(id).padStart(3, '0')}/${String(index + 1).padStart(3, '0')}.mp3`,
    dir: `/audio/${String(id).padStart(3, '0')}`,
  }));

  return {
    id,
    name,
    name_en: name,
    name_translation: name,
    words: verseCount * 10,
    letters: verseCount * 50,
    type: id % 2 === 0 ? 'مدنية' : 'مكية',
    type_en: id % 2 === 0 ? 'medinan' : 'meccan',
    ar: verses.map(v => v.ar).join(' '),
    en: verses.map(v => v.en).join(' '),
    array: verses,
  };
};

export const createMockReciter = (id: string, name: string) => ({
  id,
  name,
  name_en: name,
  apiPath: `${name}_192kbps`,
  quality: '192kbps',
  style: 'مرتل',
  subfolder: `${name}_192kbps`,
});

export const createMockAudioPlayerState = (overrides: Partial<typeof mockAudioPlayerState> = {}) => ({
  ...mockAudioPlayerState,
  ...overrides,
});

export const createMockUserPreferences = (overrides: Partial<typeof mockUserPreferences> = {}) => ({
  ...mockUserPreferences,
  ...overrides,
});

export const createMockLastPosition = (overrides: Partial<typeof mockLastPosition> = {}) => ({
  ...mockLastPosition,
  ...overrides,
});
