# ADR-0005: Storage and Caching Strategy

## Status
Accepted

## Context
The Huda Al-Quran application requires robust data storage and caching mechanisms to support:

- **Offline Quran Reading**: Complete Quran text available without internet
- **Audio Caching**: Downloaded recitations for offline playback
- **User Preferences**: Settings, bookmarks, and reading progress
- **Location Data**: Cached prayer times and location information
- **Performance Optimization**: Fast data access and reduced network calls

The storage solution needed to handle:

- Large JSON files (Quran text ~2MB)
- Audio files (individual verses ~100KB, full surahs ~10-50MB)
- User preferences and settings
- Temporary data and cache management
- Cross-session data persistence

## Decision
We implemented a multi-layered storage strategy using AsyncStorage for preferences and FileSystem for audio files, with intelligent caching mechanisms.

### Storage Architecture

#### 1. AsyncStorage Layer
```typescript
// User preferences and settings
interface UserPreferences {
  selectedReciter: string;
  playbackSpeed: number;
  repeatMode: 'none' | 'verse' | 'surah' | 'all';
  fontSize: number;
  theme: 'light' | 'dark';
  lastPosition: {
    surahId: number;
    verseId: number;
    reciterId: string;
    timestamp: number;
  };
}

// Storage Service Implementation
class StorageService {
  private readonly PREFERENCES_KEY = 'user_preferences';
  private readonly BOOKMARKS_KEY = 'user_bookmarks';
  private readonly LAST_POSITION_KEY = 'last_position';
}
```

#### 2. FileSystem Layer
```typescript
// Audio file organization
/audio-cache/
├── {reciterId}/
│   ├── {surahId:03}/{verseId:03}.mp3
│   └── metadata.json
└── cache-index.json
```

#### 3. In-Memory Caching
```typescript
// Quran data loaded into memory
const quranData = quranDataImport as any[];
// Reciter data cached
const recitersData = recitersData.reciters;
```

## Rationale

### Why Multi-Layered Storage?

#### 1. **AsyncStorage for Preferences**
- **Simple API**: Key-value storage for small data
- **Persistent**: Survives app restarts and device reboots
- **Fast**: Quick access for settings and preferences
- **Native**: Built into React Native/Expo

#### 2. **FileSystem for Audio**
- **Large Files**: Handles audio files efficiently
- **Streaming**: Supports progressive download and playback
- **Management**: File operations for cache management
- **Performance**: Direct file access for audio playback

#### 3. **Memory for Quran Text**
- **Speed**: Instant access to Quran verses
- **Size**: Manageable memory footprint (~2MB)
- **Frequency**: High access rate justifies memory storage
- **Offline**: Complete offline reading capability

### Storage Strategy by Data Type

#### 1. User Preferences
```typescript
// Small, frequently accessed data
await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
```

#### 2. Bookmarks
```typescript
// User-generated content, needs persistence
await AsyncStorage.setItem('user_bookmarks', JSON.stringify(bookmarks));
```

#### 3. Audio Files
```typescript
// Large binary files, need file system
const localPath = `${FileSystem.documentDirectory}audio-cache/${reciterId}/${surahId:03}/${verseId:03}.mp3`;
await FileSystem.downloadAsync(url, localPath);
```

#### 4. Quran Text
```typescript
// Static data, bundled with app
import quranData from '../assets/Quran.json';
```

## Implementation Details

### 1. Cache Management Strategy

#### LRU Eviction
```typescript
// Least Recently Used for audio cache
interface CacheEntry {
  reciterId: string;
  surahId: number;
  verseId: number;
  lastAccessed: number;
  fileSize: number;
}

// Cleanup old files when storage limit reached
const cleanupCache = async (maxSize: number) => {
  const cacheIndex = await getCacheIndex();
  const sortedEntries = cacheIndex.sort((a, b) => a.lastAccessed - b.lastAccessed);
  
  let currentSize = await getCurrentCacheSize();
  for (const entry of sortedEntries) {
    if (currentSize <= maxSize) break;
    
    await removeAudioFile(entry);
    currentSize -= entry.fileSize;
  }
};
```

#### Progressive Download
```typescript
// Download next verses during playback
const preloadNextVerses = async (currentSurah: number, currentVerse: number) => {
  const nextVerses = [currentVerse + 1, currentVerse + 2, currentVerse + 3];
  
  for (const verse of nextVerses) {
    if (!await isAudioCached(currentSurah, verse)) {
      await downloadAudioFile(currentSurah, verse);
    }
  }
};
```

### 2. Storage Service API

#### Preferences Management
```typescript
class StorageService {
  async getPreferences(): Promise<UserPreferences> {
    const stored = await AsyncStorage.getItem(this.PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultPreferences();
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
  }
}
```

#### Audio File Management
```typescript
class StorageService {
  async getLocalAudioPath(reciterId: string, surahId: number, verseId: number): Promise<string | null> {
    const path = `${FileSystem.documentDirectory}audio-cache/${reciterId}/${surahId:03}/${verseId:03}.mp3`;
    const info = await FileSystem.getInfoAsync(path);
    return info.exists ? path : null;
  }

  async downloadAudioFile(url: string, reciterId: string, surahId: number, verseId: number): Promise<string> {
    const dir = `${FileSystem.documentDirectory}audio-cache/${reciterId}/${surahId:03}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    
    const filePath = `${dir}/${verseId:03}.mp3`;
    const downloadResult = await FileSystem.downloadAsync(url, filePath);
    
    await updateCacheIndex(reciterId, surahId, verseId, downloadResult.uri);
    return downloadResult.uri;
  }
}
```

### 3. Error Handling and Recovery

#### Storage Errors
```typescript
const safeStorageOperation = async (operation: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Storage operation failed:', error);
    // Fallback to default values
    return null;
  }
};
```

#### Cache Corruption Recovery
```typescript
const validateCache = async () => {
  const cacheIndex = await getCacheIndex();
  const validEntries = [];
  
  for (const entry of cacheIndex) {
    const exists = await FileSystem.getInfoAsync(entry.path);
    if (exists.exists) {
      validEntries.push(entry);
    }
  }
  
  await saveCacheIndex(validEntries);
};
```

## Performance Optimizations

### 1. Lazy Loading
```typescript
// Load Quran data on app start
const loadQuranData = async () => {
  if (!quranDataLoaded) {
    quranData = await import('../assets/Quran.json');
    quranDataLoaded = true;
  }
  return quranData;
};
```

### 2. Compression
```typescript
// Compress audio metadata
const compressMetadata = (metadata: AudioMetadata) => {
  return JSON.stringify(metadata);
};
```

### 3. Batch Operations
```typescript
// Batch storage operations
const batchSavePreferences = async (updates: Partial<UserPreferences>) => {
  const current = await getPreferences();
  const updated = { ...current, ...updates };
  await savePreferences(updated);
};
```

## Consequences

### Positive
- **Offline Capability**: Full functionality without internet
- **Performance**: Fast access to cached data
- **User Experience**: Seamless playback and reading
- **Data Persistence**: User data preserved across sessions
- **Storage Efficiency**: Intelligent cache management

### Negative
- **Storage Usage**: Audio files consume significant device storage
- **Complexity**: Multi-layered storage adds implementation complexity
- **Maintenance**: Cache management requires ongoing optimization
- **Memory Usage**: Quran data loaded into memory

### Neutral
- **Initial Load Time**: Quran data loading adds to app startup
- **Storage Permissions**: Requires file system access
- **Cache Invalidation**: Complex logic for cache updates

## Future Enhancements

### 1. Advanced Caching
- Predictive caching based on user patterns
- Smart preloading of frequently accessed content
- Dynamic cache size adjustment based on available storage

### 2. Storage Optimization
- Audio compression and quality adjustment
- Delta updates for Quran text
- Incremental sync for user data

### 3. Cloud Sync
- Cross-device synchronization of preferences and bookmarks
- Backup and restore functionality
- Conflict resolution for multiple devices

### 4. Analytics Integration
- Storage usage analytics
- Cache hit rate monitoring
- User behavior analysis for optimization

## Alternatives Considered

### 1. SQLite Database
- **Pros**: Structured data, complex queries, ACID compliance
- **Cons**: More complexity, larger footprint, overkill for simple data

### 2. Redux Persist
- **Pros**: Integration with state management, automatic hydration
- **Cons**: Tied to Redux, less flexible for file storage

### 3. Cloud-Only Storage
- **Pros**: No local storage concerns, always up-to-date
- **Cons**: Requires internet, poor offline experience

### 4. No Caching Strategy
- **Pros**: Simplest implementation
- **Cons**: Poor performance, high data usage, bad UX

---

*Decision Date: November 2025*  
*Status: Accepted*  
*Next Review: When storage requirements change or performance issues arise*
