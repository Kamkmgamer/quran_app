import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import MiniPlayer from '../MiniPlayer';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

// Mock the hooks
jest.mock('expo-router');
jest.mock('../../contexts/AudioPlayerContext');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAudioPlayer = useAudioPlayer as jest.MockedFunction<typeof useAudioPlayer>;

describe('MiniPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no audio is playing', () => {
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: false,
        currentSurahId: null,
        currentVerseId: null,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 0,
        duration: 0,
        isLoading: false,
        currentReciter: null,
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    } as any);

    const { queryByTestId } = render(<MiniPlayer />);

    expect(queryByTestId('mini-player')).toBeNull();
  });

  it('should render when audio is playing', () => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 5000,
        duration: 30000,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { getByText, getByTestId } = render(<MiniPlayer />);

    expect(getByText('الفاتحة')).toBeTruthy();
    expect(getByText('آية 5 • عبد الباسط عبد الصمد')).toBeTruthy();
    expect(getByTestId('mini-player')).toBeTruthy();
  });

  it('should call togglePlayPause when play/pause button is pressed', () => {
    const mockTogglePlayPause = jest.fn();
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 5000,
        duration: 30000,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: mockTogglePlayPause,
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { getByTestId } = render(<MiniPlayer />);

    const playPauseButton = getByTestId('play-pause-button');
    fireEvent.press(playPauseButton);

    expect(mockTogglePlayPause).toHaveBeenCalled();
  });

  it('should call playNext when next button is pressed', () => {
    const mockPlayNext = jest.fn();
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 5000,
        duration: 30000,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: mockPlayNext,
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { getByTestId } = render(<MiniPlayer />);

    const nextButton = getByTestId('next-button');
    fireEvent.press(nextButton);

    expect(mockPlayNext).toHaveBeenCalled();
  });

  it('should call playPrevious when previous button is pressed', () => {
    const mockPlayPrevious = jest.fn();
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 5000,
        duration: 30000,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: jest.fn(),
      playPrevious: mockPlayPrevious,
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { getByTestId } = render(<MiniPlayer />);

    const previousButton = getByTestId('previous-button');
    fireEvent.press(previousButton);

    expect(mockPlayPrevious).toHaveBeenCalled();
  });

  it('should navigate to player when content is pressed', () => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 5000,
        duration: 30000,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { getByTestId } = render(<MiniPlayer />);

    const content = getByTestId('mini-player-content');
    fireEvent.press(content);

    expect(mockRouter.push).toHaveBeenCalledWith('/player');
  });

  it('should show progress bar when duration is available', () => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 15000,
        duration: 30000,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { getByTestId } = render(<MiniPlayer />);

    const progressBar = getByTestId('progress-bar');
    expect(progressBar).toBeTruthy();
  });

  it('should not show progress bar when duration is 0', () => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAudioPlayer.mockReturnValue({
      state: {
        isPlaying: true,
        currentSurahId: 1,
        currentVerseId: 5,
        currentReciterId: 'abdul_basit',
        playbackSpeed: 1.0,
        repeatMode: 'none',
        position: 0,
        duration: 0,
        isLoading: false,
        currentReciter: {
          id: 'abdul_basit',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit',
          apiPath: 'Abdul_Basit_Murattal_192kbps',
          quality: '192kbps',
          style: 'مرتل',
          subfolder: 'Abdul_Basit_Murattal_192kbps',
        },
        isPlayingSurah: false,
      },
      togglePlayPause: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      playVerse: jest.fn(),
      playSurahFromVerse: jest.fn(),
      setPlaybackSpeed: jest.fn(),
      setRepeatMode: jest.fn(),
      setReciter: jest.fn(),
      seekTo: jest.fn(),
      stop: jest.fn(),
      resumeLastPosition: jest.fn(),
    });

    const { queryByTestId } = render(<MiniPlayer />);

    expect(queryByTestId('progress-bar')).toBeNull();
  });
});
