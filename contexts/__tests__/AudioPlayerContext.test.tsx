import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AudioPlayerProvider, useAudioPlayer } from '../AudioPlayerContext';
import AudioService from '../../services/AudioService';
import StorageService from '../../services/StorageService';

// Mock the services
jest.mock('../../services/AudioService');
jest.mock('../../services/StorageService');
jest.mock('../../assets/Quran.json', () => [
  {
    id: 1,
    name: 'الفاتحة',
    array: [
      { id: 1, ar: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ' },
      { id: 2, ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
    ],
  },
  {
    id: 2,
    name: 'البقرة',
    array: [
      { id: 1, ar: 'الم' },
      { id: 2, ar: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ' },
    ],
  },
]);
jest.mock('../../assets/reciters.json', () => ({
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
}));

const mockAudioService = AudioService as jest.Mocked<typeof AudioService>;
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

// Test component to use the context
const TestComponent: React.FC<{ onContext?: (context: any) => void }> = ({ onContext }) => {
  const context = useAudioPlayer();
  
  React.useEffect(() => {
    if (onContext) {
      onContext(context);
    }
  }, [context, onContext]);

  return null;
};

describe('AudioPlayerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockStorageService.getPreferences.mockResolvedValue({
      autoPlay: false,
      playbackSpeed: 1.0,
      repeatMode: 'none',
      selectedReciter: 'abdul_basit',
    });
    mockStorageService.getLastPosition.mockResolvedValue(null);
    mockAudioService.setOnPlaybackStatusUpdate.mockImplementation(() => {});
    mockAudioService.loadAndPlayVerse.mockResolvedValue();
    mockAudioService.togglePlayPause.mockResolvedValue();
    mockAudioService.playNext.mockResolvedValue();
    mockAudioService.playPrevious.mockResolvedValue();
    mockAudioService.setPlaybackSpeed.mockResolvedValue();
    mockAudioService.seekTo.mockResolvedValue();
    mockAudioService.stop.mockResolvedValue();
  });

  it('should provide audio player context', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
      expect(contextValue.state).toBeTruthy();
      expect(typeof contextValue.playVerse).toBe('function');
      expect(typeof contextValue.togglePlayPause).toBe('function');
      expect(typeof contextValue.playNext).toBe('function');
      expect(typeof contextValue.playPrevious).toBe('function');
    });
  });

  it('should load preferences on initialization', async () => {
    render(
      <AudioPlayerProvider>
        <TestComponent />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(mockStorageService.getPreferences).toHaveBeenCalled();
    });
  });

  it('should set up audio service on initialization', async () => {
    render(
      <AudioPlayerProvider>
        <TestComponent />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(mockAudioService.setOnPlaybackStatusUpdate).toHaveBeenCalled();
    });
  });

  it('should play verse correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.playVerse(1, 5, true);
    });

    expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalledWith(
      'Abdul_Basit_Murattal_192kbps',
      'abdul_basit',
      1,
      5,
      true
    );
  });

  it('should toggle play/pause correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.togglePlayPause();
    });

    expect(mockAudioService.togglePlayPause).toHaveBeenCalled();
  });

  it('should play next verse correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    // Set current verse first
    await act(async () => {
      await contextValue.playVerse(1, 2, false);
    });

    await act(async () => {
      await contextValue.playNext();
    });

    expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalledWith(
      'Abdul_Basit_Murattal_192kbps',
      'abdul_basit',
      1,
      3,
      true
    );
  });

  it('should play previous verse correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    // Set current verse first
    await act(async () => {
      await contextValue.playVerse(1, 2, false);
    });

    await act(async () => {
      await contextValue.playPrevious();
    });

    expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalledWith(
      'Abdul_Basit_Murattal_192kbps',
      'abdul_basit',
      1,
      1,
      true
    );
  });

  it('should set playback speed correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.setPlaybackSpeed(1.5);
    });

    expect(mockAudioService.setPlaybackSpeed).toHaveBeenCalledWith(1.5);
    expect(mockStorageService.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ playbackSpeed: 1.5 })
    );
  });

  it('should set repeat mode correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.setRepeatMode('verse');
    });

    expect(mockStorageService.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ repeatMode: 'verse' })
    );
  });

  it('should set reciter correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.setReciter('abdul_basit');
    });

    expect(mockStorageService.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ selectedReciter: 'abdul_basit' })
    );
  });

  it('should seek to position correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.seekTo(5000);
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(5000);
  });

  it('should stop playback correctly', async () => {
    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.stop();
    });

    expect(mockAudioService.stop).toHaveBeenCalled();
  });

  it('should resume last position correctly', async () => {
    const mockLastPosition = {
      surahId: 1,
      verseId: 5,
      reciterId: 'abdul_basit',
      timestamp: Date.now(),
    };

    mockStorageService.getLastPosition.mockResolvedValue(mockLastPosition);

    let contextValue: any = null;

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    await act(async () => {
      await contextValue.resumeLastPosition();
    });

    expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalledWith(
      'Abdul_Basit_Murattal_192kbps',
      'abdul_basit',
      1,
      5,
      false
    );
  });

  it('should handle playback status updates', async () => {
    let contextValue: any = null;
    let statusUpdateCallback: any = null;

    mockAudioService.setOnPlaybackStatusUpdate.mockImplementation((callback) => {
      statusUpdateCallback = callback;
    });

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
      expect(statusUpdateCallback).toBeTruthy();
    });

    // Simulate playback status update
    act(() => {
      statusUpdateCallback({
        isLoaded: true,
        isPlaying: true,
        positionMillis: 5000,
        durationMillis: 30000,
      });
    });

    expect(contextValue.state.isPlaying).toBe(true);
    expect(contextValue.state.position).toBe(5000);
    expect(contextValue.state.duration).toBe(30000);
  });

  it('should handle verse finished based on repeat mode', async () => {
    let contextValue: any = null;
    let statusUpdateCallback: any = null;

    mockAudioService.setOnPlaybackStatusUpdate.mockImplementation((callback) => {
      statusUpdateCallback = callback;
    });

    render(
      <AudioPlayerProvider>
        <TestComponent onContext={(context) => (contextValue = context)} />
      </AudioPlayerProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeTruthy();
    });

    // Set repeat mode to verse
    await act(async () => {
      await contextValue.setRepeatMode('verse');
      await contextValue.playVerse(1, 5, false);
    });

    // Clear mock calls
    mockAudioService.loadAndPlayVerse.mockClear();

    // Simulate verse finished
    act(() => {
      statusUpdateCallback({
        isLoaded: true,
        isPlaying: false,
        didJustFinish: true,
        isLooping: false,
      });
    });

    // Should repeat the same verse
    expect(mockAudioService.loadAndPlayVerse).toHaveBeenCalledWith(
      'Abdul_Basit_Murattal_192kbps',
      'abdul_basit',
      1,
      5,
      true
    );
  });

  it('should throw error when useAudioPlayer is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAudioPlayer must be used within AudioPlayerProvider');

    consoleSpy.mockRestore();
  });
});
