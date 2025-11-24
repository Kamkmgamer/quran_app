// Comprehensive Expo mocks for testing

export const mockAudioSound: any = {
  loadAsync: jest.fn(() => Promise.resolve({ sound: mockAudioSound, status: { isLoaded: true } })),
  playAsync: jest.fn(() => Promise.resolve()),
  pauseAsync: jest.fn(() => Promise.resolve()),
  stopAsync: jest.fn(() => Promise.resolve()),
  unloadAsync: jest.fn(() => Promise.resolve()),
  setPositionAsync: jest.fn(() => Promise.resolve()),
  setRateAsync: jest.fn(() => Promise.resolve()),
  getStatusAsync: jest.fn(() => Promise.resolve({
    isLoaded: true,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    didJustFinish: false,
    isLooping: false,
  })),
  setOnPlaybackStatusUpdate: jest.fn(),
};

export const mockFileSystem = {
  documentDirectory: '/mock/documents/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false, uri: '/mock/file' })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('mock file content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({ uri: '/mock/downloaded/file' })),
    savable: jest.fn(() => Promise.resolve()),
  })),
  getFreeDiskStorageAsync: jest.fn(() => Promise.resolve(1000000000)), // 1GB
};

export const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

export const mockLocation = {
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    canAskAgain: true,
  })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    canAskAgain: true,
  })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
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
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn(),
  })),
};

export const mockSensors = {
  Magnetometer: {
    setUpdateInterval: jest.fn(),
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeAllListeners: jest.fn(),
  },
  Accelerometer: {
    setUpdateInterval: jest.fn(),
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeAllListeners: jest.fn(),
  },
  Gyroscope: {
    setUpdateInterval: jest.fn(),
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeAllListeners: jest.fn(),
  },
};

export const mockClipboard = {
  getStringAsync: jest.fn(() => Promise.resolve('')),
  setStringAsync: jest.fn(() => Promise.resolve()),
  hasStringAsync: jest.fn(() => Promise.resolve(false)),
  hasURLAsync: jest.fn(() => Promise.resolve(false)),
  hasNumberAsync: jest.fn(() => Promise.resolve(false)),
  hasWebURLAsync: jest.fn(() => Promise.resolve(false)),
};

export const mockConstants = {
  expoConfig: {
    name: 'QuranApp',
    slug: 'قرآن',
    version: '0.2.1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#065F46',
    },
  },
  executionEnvironment: 'standalone',
  statusBarHeight: 44,
  systemFonts: ['System'],
  platform: {
    ios: { platform: 'ios', version: '15.0' },
    android: { platform: 'android', version: '31' },
  },
};

export const mockSplashScreen = {
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
};

export const mockStatusBar = {
  setBarStyleAsync: jest.fn(() => Promise.resolve()),
  setHiddenAsync: jest.fn(() => Promise.resolve()),
  setBackgroundColorAsync: jest.fn(() => Promise.resolve()),
  setTranslucentAsync: jest.fn(() => Promise.resolve()),
};

export const mockWebBrowser = {
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'success' })),
  dismissBrowser: jest.fn(() => Promise.resolve()),
  mayInitWithURLAsync: jest.fn(() => Promise.resolve(false)),
  warmUpAsync: jest.fn(() => Promise.resolve()),
  coolDownAsync: jest.fn(() => Promise.resolve()),
};

export const mockSystemUI = {
  setBackgroundColorAsync: jest.fn(() => Promise.resolve()),
};

export const mockUpdates = {
  checkForUpdateAsync: jest.fn(() => Promise.resolve({
    isAvailable: false,
    isNew: false,
    manifest: null,
  })),
  fetchUpdateAsync: jest.fn(() => Promise.resolve({
    isNew: false,
    manifest: null,
  })),
  reloadAsync: jest.fn(() => Promise.resolve()),
  clearUpdateCacheExperimentalAsync: jest.fn(() => Promise.resolve()),
};

// Helper function to reset all mocks
export const resetAllMocks = () => {
  Object.values(mockAudioSound).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockFileSystem).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockAsyncStorage).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockLocation).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockSensors.Magnetometer).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockClipboard).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockConstants).forEach(value => {
    if (jest.isMockFunction(value)) {
      value.mockReset();
    }
  });

  Object.values(mockSplashScreen).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockStatusBar).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockWebBrowser).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockSystemUI).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockUpdates).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
};
