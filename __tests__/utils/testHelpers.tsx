import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';

import { AudioPlayerProvider } from '../../contexts/AudioPlayerContext';

// Mock theme for testing
const MockTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    border: '#e5e5e5',
    primary: '#065F46',
    notification: '#ff0000',
  },
};

// Custom render function with providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <ActionSheetProvider>
      <AudioPlayerProvider>
        <ThemeProvider value={MockTheme}>
          {children}
        </ThemeProvider>
      </AudioPlayerProvider>
    </ActionSheetProvider>
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react-native';
export { customRender as render };

// Mock data helpers
export const createMockQuranData = () => [
  {
    id: 1,
    name: 'الفاتحة',
    name_en: 'The Opening',
    name_translation: 'Al-Fatihah',
    words: 29,
    letters: 139,
    type: 'مكية',
    type_en: 'meccan',
    ar: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
    en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
    array: [
      {
        id: 1,
        ar: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
        en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
        filename: '001.mp3',
        path: '/audio/001/001.mp3',
        dir: '/audio/001',
      },
    ],
  },
];

export const createMockReciterData = () => ({
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
  ],
});

export const createMockAudioPlayerState = () => ({
  isPlaying: false,
  currentSurahId: null,
  currentVerseId: null,
  currentReciterId: 'abdul_basit',
  playbackSpeed: 1.0,
  repeatMode: 'none' as const,
  position: 0,
  duration: 0,
  isLoading: false,
  currentReciter: createMockReciterData().reciters[0],
});

// Async helpers
export const flushPromises = () => new Promise(setImmediate);

// Mock AsyncStorage helpers
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock Audio helpers
export const mockAudioSound = {
  loadAsync: jest.fn(),
  playAsync: jest.fn(),
  pauseAsync: jest.fn(),
  stopAsync: jest.fn(),
  unloadAsync: jest.fn(),
  setPositionAsync: jest.fn(),
  setRateAsync: jest.fn(),
  getStatusAsync: jest.fn(),
};

export const mockFileSystem = {
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  createDownloadResumable: jest.fn(),
};
