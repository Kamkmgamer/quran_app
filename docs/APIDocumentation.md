# API Documentation

## Overview

The Huda Al-Quran application integrates with several external APIs to provide comprehensive Islamic services including prayer times, location services, and audio recitation. This document details all API endpoints, request/response formats, authentication requirements, and integration patterns.

---

## Table of Contents

1. [Prayer Times API](#prayer-times-api)
2. [Location Services API](#location-services-api)
3. [Audio Recitation API](#audio-recitation-api)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Caching Strategy](#caching-strategy)
7. [Security Considerations](#security-considerations)

---

## Prayer Times API

### Base URL
```
https://api.aladhan.com/v1
```

### Authentication
No authentication required for basic prayer times. Premium features may require API keys in future versions.

### Endpoints

#### Get Prayer Times by Coordinates
```http
GET /timings/{date}?latitude={lat}&longitude={lng}&method={method}
```

**Parameters:**
- `date` (string, required): Date in DD-MM-YYYY format
- `latitude` (float, required): Latitude coordinate (-90 to 90)
- `longitude` (float, required): Longitude coordinate (-180 to 180)
- `method` (integer, optional): Calculation method ID (default: 5)

**Calculation Methods:**
- `1` - University of Islamic Sciences, Karachi
- `2` - Islamic Society of North America
- `3` - Muslim World League
- `4` - Umm Al-Qura University, Makkah
- `5` - Egyptian General Authority of Survey
- `8` - Gulf Region
- `9` - Kuwait
- `15` - Moonsighting Committee
- `16` - Dubai

**Response Format:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "timings": {
      "Fajr": "05:30",
      "Sunrise": "06:45",
      "Dhuhr": "12:15",
      "Asr": "15:30",
      "Maghrib": "18:00",
      "Isha": "19:15"
    },
    "date": {
      "readable": "24 Nov 2025",
      "timestamp": "1732444800"
    },
    "meta": {
      "latitude": 24.7136,
      "longitude": 46.6753,
      "timezone": "Asia/Riyadh"
    }
  }
}
```

#### Get Calculation Methods
```http
GET /methods
```

**Response Format:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "1": {
      "id": 1,
      "name": "University of Islamic Sciences, Karachi",
      "params": {
        "Fajr": 18,
        "Isha": 18
      }
    },
    "2": {
      "id": 2,
      "name": "Islamic Society of North America",
      "params": {
        "Fajr": 15,
        "Isha": 15
      }
    }
  }
}
```

---

## Location Services API

### Base URL
```
https://nominatim.openstreetmap.org
```

### Authentication
No authentication required. Rate limited by IP address.

### Endpoints

#### Reverse Geocoding
```http
GET /reverse?format=json&lat={lat}&lon={lng}&accept-language={lang}
```

**Parameters:**
- `format` (string, required): Response format (json)
- `lat` (float, required): Latitude coordinate
- `lon` (float, required): Longitude coordinate
- `accept-language` (string, optional): Preferred language code (default: en)

**Headers:**
```
User-Agent: QuranApp/1.0 (contact@quranapp.local)
```

**Response Format:**
```json
{
  "place_id": 123456789,
  "licence": "Data © OpenStreetMap contributors",
  "osm_type": "relation",
  "osm_id": 987654,
  "lat": "24.7135517",
  "lon": "46.6752957",
  "display_name": "Riyadh, Saudi Arabia",
  "address": {
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "country_code": "sa"
  },
  "boundingbox": ["24.6325", "24.7945", "46.5641", "46.7868"]
}
```

---

## Audio Recitation API

### Base URL
```
https://everyayah.com/data/{reciterPath}/
```

### Authentication
No authentication required. Direct file access.

### URL Pattern
```
https://everyayah.com/data/{reciterPath}/{surah}{verse}.mp3
```

**Parameters:**
- `reciterPath` (string, required): Path identifier for reciter
- `surah` (string, required): 3-digit surah number with leading zeros
- `verse` (string, required): 3-digit verse number with leading zeros

### Available Reciters

| ID | Name | Arabic Name | Quality | Reciter Path |
|----|------|-------------|---------|--------------|
| abdul_basit | Abdul Basit | عبد الباسط | High | abdul_basit_192kbps |
| alafasy | Mishary Alafasy | مشاري العفاسي | High | alafasy_128kbps |
| husary | Mahmoud Husary | محمود الحصري | High | husary_128kbps |
| minshawi | Mohamed Minshawi | محمد المنشاوي | Medium | minshawi_muqatta |
| sudais | Abdul Rahman Al-Sudais | عبد الرحمن السديس | High | sudais_128kbps |

**Example URL:**
```
https://everyayah.com/data/abdul_basit_192kbps/001001.mp3
```
This URL retrieves Surah Al-Fatiha (1) verse 1 in the recitation of Abdul Basit.

---

## Error Handling

### Standard Error Response Format
```json
{
  "code": 400,
  "status": "Bad Request",
  "data": "Invalid coordinates provided"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (invalid endpoint or resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Application-Level Error Handling
The application implements comprehensive error handling with the following patterns:

1. **Network Errors**: Automatic retry with exponential backoff
2. **API Errors**: Fallback to cached data when available
3. **Timeout Errors**: Graceful degradation with default values
4. **Parse Errors**: Error boundary implementation with user feedback

---

## Rate Limiting

### Prayer Times API
- **Limit**: 1000 requests per hour per IP
- **Enforcement**: HTTP 429 status code when exceeded
- **Retry-After**: Header indicates wait time

### Location Services API
- **Limit**: 1 request per second per IP
- **Enforcement**: HTTP 429 status code when exceeded
- **Recommendation**: Implement client-side throttling

### Audio API
- **Limit**: No explicit rate limiting
- **Recommendation**: Implement download throttling for bulk operations

---

## Caching Strategy

### Prayer Times Caching
```typescript
interface CacheEntry {
  data: PrayerTimesData;
  timestamp: number;
  coordinates: Coordinates;
  method: number;
}

// Cache duration: 2 hours
const CACHE_DURATION = 2 * 60 * 60 * 1000;
```

### Location Data Caching
- **Duration**: 24 hours for location name data
- **Strategy**: LRU (Least Recently Used) eviction
- **Storage**: AsyncStorage with encrypted wrapper

### Audio File Caching
- **Strategy**: Progressive download with local storage
- **Storage**: FileSystem with organized directory structure
- **Cleanup**: Automatic cleanup of unused files after 30 days

---

## Security Considerations

### Current Implementation
1. **HTTPS Only**: All API calls use HTTPS encryption
2. **User Agent**: Custom user agent for identification
3. **Input Validation**: Client-side validation for coordinates
4. **Error Sanitization**: No sensitive data in error messages

### Recommended Improvements
1. **Certificate Pinning**: Prevent MITM attacks
2. **API Keys**: Implement authentication for premium features
3. **Request Signing**: HMAC-based request authentication
4. **Rate Limiting Headers**: Implement proper rate limiting

---

## Integration Examples

### TypeScript Service Implementation

```typescript
class PrayerTimesService {
  private readonly API_BASE_URL = 'https://api.aladhan.com/v1';
  private readonly CACHE_KEY = 'prayer_times_cache';
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000;

  async getPrayerTimes(
    coordinates: Coordinates, 
    method: number = CalculationMethods.EGYPT
  ): Promise<PrayerTimesData> {
    // Check cache first
    const cachedData = await this.getCachedData(coordinates, method);
    if (cachedData) {
      return cachedData;
    }

    // Fetch from API
    const response = await fetch(
      `${this.API_BASE_URL}/timings/${this.getTodayDate()}?` +
      `latitude=${coordinates.latitude}&` +
      `longitude=${coordinates.longitude}&` +
      `method=${method}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200 || data.status !== 'OK') {
      throw new Error(`API returned error: ${data.data || 'Unknown error'}`);
    }

    // Process and cache response
    const prayerTimes = this.processApiResponse(data);
    await this.cacheData(coordinates, prayerTimes, method);
    
    return prayerTimes;
  }

  private processApiResponse(data: any): PrayerTimesData {
    return {
      fajr: data.data.timings.Fajr,
      sunrise: data.data.timings.Sunrise,
      dhuhr: data.data.timings.Dhuhr,
      asr: data.data.timings.Asr,
      maghrib: data.data.timings.Maghrib,
      isha: data.data.timings.Isha,
      date: data.data.date.readable,
      timestamp: Date.now(),
      method: data.data.method,
      location: data.data.meta
    };
  }
}
```

### React Hook Integration

```typescript
function usePrayerTimes(coordinates: Coordinates) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PrayerTimesService.getPrayerTimes(coordinates);
        setPrayerTimes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [coordinates]);

  return { prayerTimes, loading, error };
}
```

---

## Testing Guidelines

### Unit Testing
```typescript
describe('PrayerTimesService', () => {
  it('should fetch prayer times successfully', async () => {
    const mockCoordinates = { latitude: 24.7136, longitude: 46.6753 };
    const result = await service.getPrayerTimes(mockCoordinates);
    
    expect(result).toHaveProperty('fajr');
    expect(result).toHaveProperty('dhuhr');
    expect(result).toHaveProperty('date');
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API call
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    
    await expect(service.getPrayerTimes(INVALID_COORDS))
      .rejects.toThrow('Network error');
  });
});
```

### Integration Testing
```typescript
describe('API Integration', () => {
  it('should integrate with real prayer times API', async () => {
    const coordinates = { latitude: 24.7136, longitude: 46.6753 };
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/24-11-2025?` +
      `latitude=${coordinates.latitude}&` +
      `longitude=${coordinates.longitude}&` +
      `method=5`
    );
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.code).toBe(200);
  });
});
```

---

## Monitoring and Analytics

### Recommended Metrics
1. **API Response Times**: Track performance degradation
2. **Error Rates**: Monitor API failures and timeouts
3. **Cache Hit Rates**: Measure caching effectiveness
4. **User Location Distribution**: Understand geographic usage patterns

### Implementation Example
```typescript
class APIMonitor {
  static trackAPICall(endpoint: string, duration: number, success: boolean) {
    // Send to analytics service
    Analytics.track('api_call', {
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    });
  }
}
```

---

## Future Enhancements

### Planned API Improvements
1. **Authentication System**: API key-based authentication for premium features
2. **WebSocket Support**: Real-time prayer time updates
3. **Bulk Operations**: Batch API calls for multiple locations
4. **Offline Sync**: Synchronization mechanism for offline data

### Scalability Considerations
1. **CDN Integration**: Content delivery network for audio files
2. **Load Balancing**: Multiple API endpoints for redundancy
3. **Caching Layers**: Redis or similar for server-side caching
4. **Rate Limiting**: User-based rate limiting with authentication

---

## Support and Contact

### API Support
- **Prayer Times API**: documentation@aladhan.com
- **OpenStreetMap**: https://www.openstreetmap.org/contact
- **Audio API**: admin@everyayah.com

### Application Support
- **Technical Issues**: Create GitHub issue in project repository
- **Feature Requests**: Submit through project issue tracker
- **Security Concerns**: Contact project maintainers directly

---

*Last Updated: November 2025*  
*Version: 1.0*  
*Next Review: February 2026*
