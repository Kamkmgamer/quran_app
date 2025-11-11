# ADR-0008: Testing Strategy

## Status
Accepted

## Context
The Huda Al-Quran application requires a comprehensive testing strategy to ensure:

- **Reliability**: Consistent behavior across different devices and scenarios
- **Quality**: Bug-free releases and smooth user experience
- **Maintainability**: Safe refactoring and feature additions
- **Performance**: Detection of regressions and performance issues
- **Accessibility**: Proper functionality for users with disabilities

The testing strategy needed to address:

- Complex audio playback logic and state management
- API integration with external services
- Offline functionality and caching mechanisms
- Arabic text rendering and RTL layout
- Cross-platform compatibility (iOS/Android)
- User interaction flows and edge cases

## Decision
We implemented a multi-layered testing strategy using Jest for unit/integration tests, React Native Testing Library for component tests, and manual testing for device-specific functionality.

### Testing Architecture

#### 1. Test Structure
```
__tests__/
├── mocks/                  # Test mocks and fixtures
│   ├── expoMocks.ts
│   └── audioMocks.ts
├── utils/                  # Test utilities and helpers
│   ├── testData.ts
│   └── testHelpers.tsx
├── components/             # Component tests
│   ├── MiniPlayer.test.tsx
│   ├── ThemedText.test.tsx
│   └── QuranReader.test.tsx
├── contexts/               # Context tests
│   ├── AudioPlayerContext.test.tsx
│   └── LocationContext.test.tsx
├── services/               # Service layer tests
│   ├── AudioService.test.ts
│   ├── PrayerTimesService.test.ts
│   └── StorageService.test.ts
└── integration/            # Integration tests
    ├── AudioFlow.test.tsx
    └── QuranReadingFlow.test.tsx
```

#### 2. Testing Pyramid
```
    E2E Tests (Manual)
        ↑
  Integration Tests (Jest + RTL)
        ↑
    Unit Tests (Jest)
```

## Rationale

### Why Multi-Layered Testing?

#### 1. **Unit Tests (70%)**
- Fast feedback loop for developers
- Test individual functions and components in isolation
- Easy to debug and maintain
- High coverage of business logic

#### 2. **Integration Tests (20%)**
- Test component interactions and service integrations
- Verify data flow between layers
- Catch integration issues early
- Ensure proper context usage

#### 3. **End-to-End Tests (10%)**
- Test complete user workflows
- Verify cross-platform functionality
- Manual testing for device-specific features
- Critical path validation

### Testing Tools Selection

#### 1. Jest as Test Runner
- **Zero-config setup**: Works out of the box with React Native
- **Fast execution**: Parallel test execution and watch mode
- **Mocking support**: Built-in mocking capabilities
- **Coverage reporting**: Detailed coverage metrics
- **Snapshot testing**: UI regression detection

#### 2. React Native Testing Library
- **User-centric testing**: Tests from user perspective
- **Accessibility support**: Built-in accessibility testing
- **Component behavior**: Focus on what users see and do
- **React integration**: Seamless React component testing

#### 3. Manual Testing for Device Features
- **Audio playback**: Real device testing for audio functionality
- **GPS services**: Actual location testing
- **File system**: Real storage operations
- **Performance**: Device-specific performance validation

## Implementation Details

### 1. Unit Testing Strategy

#### Service Layer Testing
```typescript
// AudioService.test.ts
describe('AudioService', () => {
  let audioService: AudioService;
  let mockStorageService: jest.Mocked<StorageService>;

  beforeEach(() => {
    mockStorageService = {
      getLocalAudioPath: jest.fn(),
      downloadAudioFile: jest.fn(),
      saveLastPosition: jest.fn(),
    } as any;
    
    audioService = new AudioService();
  });

  describe('loadAndPlayVerse', () => {
    it('should load and play verse from local cache', async () => {
      // Arrange
      const mockLocalPath = '/file/cache/001001.mp3';
      mockStorageService.getLocalAudioPath.mockResolvedValue(mockLocalPath);
      
      const mockSound = {
        playAsync: jest.fn(),
        unloadAsync: jest.fn(),
      };
      jest.spyOn(Audio, 'Sound.createAsync').mockResolvedValue({ sound: mockSound } as any);

      // Act
      await audioService.loadAndPlayVerse('abdul_basit_192kbps', 'abdul_basit', 0, 1);

      // Assert
      expect(mockStorageService.getLocalAudioPath).toHaveBeenCalledWith('abdul_basit', 0, 1);
      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: mockLocalPath },
        expect.any(Object),
        expect.any(Function)
      );
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should download and play verse when not cached', async () => {
      // Arrange
      mockStorageService.getLocalAudioPath.mockResolvedValue(null);
      mockStorageService.downloadAudioFile.mockResolvedValue('/file/downloaded/001001.mp3');
      
      const mockSound = { playAsync: jest.fn() };
      jest.spyOn(Audio, 'Sound.createAsync').mockResolvedValue({ sound: mockSound } as any);

      // Act
      await audioService.loadAndPlayVerse('abdul_basit_192kbps', 'abdul_basit', 0, 1);

      // Assert
      expect(mockStorageService.downloadAudioFile).toHaveBeenCalled();
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should handle audio loading errors gracefully', async () => {
      // Arrange
      jest.spyOn(Audio, 'Sound.createAsync').mockRejectedValue(new Error('Audio loading failed'));

      // Act & Assert
      await expect(
        audioService.loadAndPlayVerse('abdul_basit_192kbps', 'abdul_basit', 0, 1)
      ).rejects.toThrow('Audio loading failed');
    });
  });
});
```

#### Context Testing
```typescript
// AudioPlayerContext.test.tsx
describe('AudioPlayerContext', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AudioPlayerProvider>{component}</AudioPlayerProvider>
    );
  };

  it('should provide audio player state and actions', () => {
    // Arrange
    const TestComponent = () => {
      const { state, playVerse, togglePlayPause } = useAudioPlayer();
      return (
        <View>
          <Text testID="isPlaying">{state.isPlaying.toString()}</Text>
          <Button testID="playVerse" onPress={() => playVerse(1, 1)} />
          <Button testID="togglePlayPause" onPress={togglePlayPause} />
        </View>
      );
    };

    // Act
    renderWithProvider(<TestComponent />);

    // Assert
    expect(screen.getByTestId('isPlaying')).toHaveTextContent('false');
    expect(screen.getByTestId('playVerse')).toBeTruthy();
    expect(screen.getByTestId('togglePlayPause')).toBeTruthy();
  });

  it('should update playing state when verse is played', async () => {
    // Arrange
    const mockAudioService = {
      loadAndPlayVerse: jest.fn(),
    };
    jest.mock('../services/AudioService', () => mockAudioService);

    const TestComponent = () => {
      const { state, playVerse } = useAudioPlayer();
      return (
        <View>
          <Text testID="isPlaying">{state.isPlaying.toString()}</Text>
          <Button testID="playVerse" onPress={() => playVerse(1, 1)} />
        </View>
      );
    };

    // Act
    renderWithProvider(<TestComponent />);
    fireEvent.press(screen.getByTestId('playVerse'));
    await waitFor(() => expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalled());

    // Assert
    expect(screen.getByTestId('isPlaying')).toHaveTextContent('true');
  });
});
```

### 2. Component Testing Strategy

#### UI Component Testing
```typescript
// MiniPlayer.test.tsx
describe('MiniPlayer', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <AudioPlayerProvider>
        <LocationProvider>
          {component}
        </LocationProvider>
      </AudioPlayerProvider>
    );
  };

  it('should not render when no audio is playing', () => {
    // Arrange
    const TestComponent = () => {
      const { state } = useAudioPlayer();
      return <MiniPlayer />;
    };

    // Act
    renderWithProviders(<TestComponent />);

    // Assert
    expect(screen.queryByTestId('miniPlayer')).toBeNull();
  });

  it('should render current track information', () => {
    // Arrange
    const TestComponent = () => {
      const { state } = useAudioPlayer();
      // Mock state with current track
      return <MiniPlayer />;
    };

    // Act
    renderWithProviders(<TestComponent />);

    // Assert
    expect(screen.getByTestId('miniPlayer')).toBeTruthy();
    expect(screen.getByTestId('trackInfo')).toBeTruthy();
    expect(screen.getByTestId('playPauseButton')).toBeTruthy();
  });

  it('should handle play/pause button press', () => {
    // Arrange
    const mockTogglePlayPause = jest.fn();
    const TestComponent = () => {
      const { state, togglePlayPause } = useAudioPlayer();
      return (
        <View>
          <MiniPlayer />
          <Button testID="customToggle" onPress={togglePlayPause} />
        </View>
      );
    };

    // Act
    renderWithProviders(<TestComponent />);
    fireEvent.press(screen.getByTestId('customToggle'));

    // Assert
    expect(mockTogglePlayPause).toHaveBeenCalled();
  });

  it('should be accessible', () => {
    // Arrange & Act
    renderWithProviders(<MiniPlayer />);

    // Assert
    expect(screen.getByLabelText('مشغل الصوت المصغر')).toBeTruthy();
    expect(screen.getByLabelText('تشغيل أو إيقاف')).toBeTruthy();
  });
});
```

### 3. Integration Testing Strategy

#### User Flow Testing
```typescript
// AudioFlow.test.tsx
describe('Audio Playback Flow', () => {
  it('should complete full audio playback flow', async () => {
    // Arrange
    const mockAudioService = new AudioService();
    jest.spyOn(mockAudioService, 'loadAndPlayVerse').mockResolvedValue();
    jest.spyOn(mockAudioService, 'togglePlayPause').mockResolvedValue();

    // Act
    const { getByTestId } = render(<QuranReader surahId={1} />);
    
    // Navigate to verse
    fireEvent.press(getByTestId('verse-1'));
    
    // Start playback
    fireEvent.press(getByTestId('playButton'));
    
    // Wait for audio to load
    await waitFor(() => {
      expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalledWith(1, 1, true);
    });

    // Pause playback
    fireEvent.press(getByTestId('pauseButton'));
    await waitFor(() => {
      expect(mockAudioService.togglePlayPause).toHaveBeenCalled();
    });

    // Assert
    expect(getByTestId('playbackStatus')).toHaveTextContent('paused');
  });
});
```

### 4. Mock Strategy

#### API Mocking
```typescript
// mocks/expoMocks.ts
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
      setAudioModeAsync: jest.fn(),
    },
    set: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  downloadAsync: jest.fn(),
}));

// testHelpers.tsx
export const createMockAudioPlayerContext = () => ({
  state: {
    isPlaying: false,
    currentSurahId: null,
    currentVerseId: null,
    currentReciterId: 'abdul_basit',
    playbackSpeed: 1.0,
    repeatMode: 'none' as const,
    position: 0,
    duration: 0,
    isLoading: false,
    currentReciter: null,
    isPlayingSurah: false,
  },
  playVerse: jest.fn(),
  playSurahFromVerse: jest.fn(),
  togglePlayPause: jest.fn(),
  playNext: jest.fn(),
  playPrevious: jest.fn(),
  setPlaybackSpeed: jest.fn(),
  setRepeatMode: jest.fn(),
  setReciter: jest.fn(),
  seekTo: jest.fn(),
  stop: jest.fn(),
  resumeLastPosition: jest.fn(),
});
```

### 5. Test Data Management

#### Test Fixtures
```typescript
// utils/testData.ts
export const mockVerses = [
  {
    id: 1,
    text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    surahId: 1,
    verseNumber: 1,
  },
  {
    id: 2,
    text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    translation: 'All praise is due to Allah, Lord of the worlds',
    surahId: 1,
    verseNumber: 2,
  },
];

export const mockReciters = [
  {
    id: 'abdul_basit',
    name: 'عبد الباسط عبد الصمد',
    name_en: 'Abdul Basit Abdus Samad',
    apiPath: 'abdul_basit_192kbps',
    quality: 'high',
    style: 'mujawwad',
    subfolder: '',
  },
];

export const mockPrayerTimes = {
  fajr: '05:30',
  sunrise: '06:45',
  dhuhr: '12:15',
  asr: '15:30',
  maghrib: '18:00',
  isha: '19:15',
  date: '24 Nov 2025',
  timestamp: Date.now(),
};
```

## Performance Testing

### 1. Component Performance
```typescript
// Performance testing with React Profiler
describe('Component Performance', () => {
  it('should render QuranReader efficiently', () => {
    const onRender = jest.fn();
    
    render(
      <React.Profiler id="QuranReader" onRender={onRender}>
        <QuranReader surahId={1} />
      </React.Profiler>
    );

    expect(onRender).toHaveBeenCalled();
    
    const [id, phase, actualDuration] = onRender.mock.calls[0];
    expect(actualDuration).toBeLessThan(100); // Should render in under 100ms
  });
});
```

### 2. Memory Testing
```typescript
// Memory usage testing
describe('Memory Management', () => {
  it('should not leak memory when navigating between screens', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate navigation
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<QuranReader surahId={1} />);
      unmount();
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
  });
});
```

## Continuous Integration

### 1. GitHub Actions Configuration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v1
        with:
          file: ./coverage/lcov.info
```

### 2. Test Scripts
```json
{
  "scripts": {
    "test": "jest --watchAll",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:services": "jest services",
    "test:components": "jest components",
    "test:contexts": "jest contexts",
    "test:debug": "jest --no-cache --detectOpenHandles"
  }
}
```

## Testing Best Practices

### 1. Test Organization
- **Describe blocks**: Group related tests
- **It blocks**: Single assertion per test
- **Arrange-Act-Assert**: Clear test structure
- **Descriptive names**: Test should document behavior

### 2. Mock Management
- **Minimal mocking**: Only mock external dependencies
- **Consistent mocks**: Use same mocks across tests
- **Mock cleanup**: Clean up mocks after each test
- **Realistic data**: Use representative test data

### 3. Coverage Goals
- **Statements**: 90%+ coverage
- **Branches**: 85%+ coverage
- **Functions**: 95%+ coverage
- **Lines**: 90%+ coverage

## Consequences

### Positive
- **Quality Assurance**: Comprehensive bug detection
- **Regression Prevention**: Safe refactoring and updates
- **Documentation**: Tests serve as living documentation
- **Developer Confidence**: Faster development with safety net
- **Automated Verification**: CI/CD integration for quality gates

### Negative
- **Development Time**: Initial setup and maintenance overhead
- **Test Maintenance**: Tests need updates with code changes
- **Complexity**: Additional layer of complexity
- **False Confidence**: Tests can miss edge cases

### Neutral
- **Learning Curve**: Team needs testing best practices training
- **Tooling**: Requires test infrastructure and tooling
- **Execution Time**: Test suite adds to build time

## Future Enhancements

### 1. Advanced Testing
- Visual regression testing
- Performance benchmarking
- Accessibility automation testing
- Cross-device testing matrix

### 2. Test Infrastructure
- Parallel test execution
- Test data factories
- Custom matchers and assertions
- Test environment management

### 3. Quality Metrics
- Code coverage trends
- Test effectiveness metrics
- Bug detection rates
- Performance regression detection

## Alternatives Considered

### 1. Detox for E2E Testing
- **Pros**: Real device testing, native interactions
- **Cons**: Complex setup, slower execution, maintenance overhead

### 2. Cypress for Mobile Testing
- **Pros**: Modern E2E framework, good debugging
- **Cons**: Limited mobile support, web-focused

### 3. Manual Testing Only
- **Pros**: No test code to maintain
- **Cons**: Inconsistent, error-prone, not scalable

### 4. No Testing Strategy
- **Pros**: Fastest initial development
- **Cons**: High risk, poor quality, difficult maintenance

---

*Decision Date: November 2025*  
*Status: Accepted*  
*Next Review: When testing requirements change or coverage goals are not met*
