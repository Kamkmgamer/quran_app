# Component Documentation

This comprehensive documentation covers all React Native components used in the Huda Al-Quran application, including their props, usage examples, and implementation details.

## Table of Contents

1. [Core Components](#core-components)
2. [Themed Components](#themed-components)
3. [Audio Components](#audio-components)
4. [Navigation Components](#navigation-components)
5. [UI Components](#ui-components)
6. [Utility Components](#utility-components)
7. [Component Testing](#component-testing)

---

## Core Components

### MiniPlayer

A compact audio player component that appears at the bottom of the screen when audio is playing.

#### Props
None (uses AudioPlayerContext for state management)

#### Features
- Displays current surah and verse information
- Play/pause functionality
- Previous/next track navigation
- Progress bar visualization
- Tap to open full player
- RTL support for Arabic text

#### Usage
```tsx
import MiniPlayer from '@/components/MiniPlayer';

// In your layout or screen component
<MiniPlayer />
```

#### Dependencies
- `AudioPlayerContext` for state management
- `Quran.json` for surah data
- `expo-router` for navigation

#### Styling
- Fixed position at bottom of screen
- White background with green accent colors
- Shadow effect for elevation
- Responsive design for all screen sizes

#### Accessibility
- Test IDs for all interactive elements
- Semantic button labels
- Screen reader support

---

## Themed Components

### ThemedText

A text component that automatically adapts to the current theme (light/dark mode).

#### Props
```tsx
type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};
```

#### Text Types
- **default**: 16px font size, 24px line height
- **title**: 32px bold font, 32px line height
- **defaultSemiBold**: 16px semi-bold font, 24px line height
- **subtitle**: 20px bold font
- **link**: 16px font, 30px line height, blue color

#### Usage
```tsx
import { ThemedText } from '@/components/ThemedText';

// Basic usage
<ThemedText>Regular text</ThemedText>

// With text type
<ThemedText type="title">Title Text</ThemedText>
<ThemedText type="subtitle">Subtitle Text</ThemedText>
<ThemedText type="link">Link Text</ThemedText>

// With custom colors
<ThemedText lightColor="#333" darkColor="#fff">Custom colored text</ThemedText>

// With standard Text props
<ThemedText numberOfLines={2} ellipsizeMode="tail">
  Long text that will be truncated
</ThemedText>
```

#### Implementation Details
- Uses `useThemeColor` hook for theme-aware coloring
- Inherits all React Native Text props
- Supports custom light/dark color overrides
- TypeScript support for type safety

### ThemedView

A view component that automatically adapts its background color to the current theme.

#### Props
```tsx
type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};
```

#### Usage
```tsx
import { ThemedView } from '@/components/ThemedView';

// Basic usage
<ThemedView>
  <ThemedText>Themed content</ThemedText>
</ThemedView>

// With custom colors
<ThemedView 
  lightColor="#f5f5f5" 
  darkColor="#1a1a1a"
>
  Custom themed background
</ThemedView>

// With standard View props
<ThemedView 
  style={styles.container}
  onLayout={handleLayout}
>
  Content with view props
</ThemedView>
```

#### Implementation Details
- Uses `useThemeColor` hook for theme-aware backgrounds
- Inherits all React Native View props
- Supports custom light/dark color overrides
- Provides consistent theming across the app

---

## Audio Components

### MiniPlayer (Detailed)

#### State Management
The component connects to `AudioPlayerContext` to access:
- `state.currentSurahId`: Currently playing surah
- `state.currentVerseId`: Currently playing verse
- `state.isPlaying`: Playback state
- `state.currentReciter`: Current reciter information
- `state.position`: Current playback position
- `state.duration`: Total audio duration

#### Event Handlers
```tsx
const handlePress = () => {
  router.push('/player');
};

const togglePlayPause = () => {
  // Context method to toggle playback
};

const playNext = () => {
  // Context method to play next verse
};

const playPrevious = () => {
  // Context method to play previous verse
};
```

#### Progress Bar
```tsx
{state.duration > 0 && (
  <View style={styles.progressBar}>
    <View
      style={[
        styles.progressFill,
        {
          width: `${(state.position / state.duration) * 100}%`,
        },
      ]}
    />
  </View>
)}
```

#### Conditional Rendering
The component returns `null` when no audio is playing:
```tsx
if (state.currentSurahId === null || state.currentVerseId === null) {
  return null;
}
```

---

## Navigation Components

### TabBarIcon

A standardized icon component for bottom tab navigation.

#### Props
```tsx
type TabBarIconProps = IconProps<ComponentProps<typeof Ionicons>['name']> & {
  style?: any;
};
```

#### Usage
```tsx
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

// In tab layout configuration
<TabBarIcon name="home" color={color} />
<TabBarIcon name="book" color={color} />
<TabBarIcon name="musical-notes" color={color} />
```

#### Features
- Standardized size (28px)
- Consistent styling across tabs
- Inherits all Ionicons props
- TypeScript support for icon names

#### Implementation Details
- Uses Ionicons from @expo/vector-icons
- Applies consistent margin-bottom for alignment
- Supports all Ionicons icon names and props

---

## UI Components

### Menu

A slide-out navigation menu with settings and navigation options.

#### Props
```tsx
interface MenuProps {
  visible: boolean;
  onClose: () => void;
}
```

#### Features
- Slide-in animation from right side
- Overlay with tap-to-close functionality
- Navigation items (Bookmarks, Prayer Times, Qibla)
- Reciter selection dropdown
- Font size selection dropdown
- RTL support for Arabic text

#### Usage
```tsx
import Menu from '@/components/Menu';

// In your main layout
<Menu 
  visible={isMenuVisible} 
  onClose={() => setMenuVisible(false)} 
/>
```

#### Menu Items
```tsx
const menuItems = [
  {
    id: 'bookmarks',
    title: 'العلامات المرجعية',
    icon: 'bookmark',
    onPress: () => router.push('/bookmarks'),
  },
  {
    id: 'prayer-times',
    title: 'مواقيت الصلاة',
    icon: 'time',
    onPress: () => router.push('/prayer-times'),
  },
  {
    id: 'qibla',
    title: 'اتجاه القبلة',
    icon: 'compass',
    onPress: () => router.push('/qibla'),
  },
];
```

#### State Management
- Loads saved font size from AsyncStorage
- Gets current reciter from AudioPlayerContext
- Handles menu visibility state

#### Styling
- 70% screen width for menu container
- Green theme with gold accents
- RTL layout for Arabic text
- Responsive design with device width

### Collapsible

A collapsible/expandable content section with animated chevron icon.

#### Props
```tsx
type CollapsibleProps = PropsWithChildren & {
  title: string;
};
```

#### Usage
```tsx
import { Collapsible } from '@/components/Collapsible';

<Collapsible title="Section Title">
  <ThemedText>Collapsible content here</ThemedText>
</Collapsible>
```

#### Features
- Animated chevron icon rotation
- Theme-aware styling
- Touch feedback with active opacity
- Smooth expand/collapse animation

#### Implementation Details
- Uses useState for open/closed state
- Theme-aware icon colors
- Configurable animation duration
- Accessible touch targets

### ExternalLink

A link component that opens external URLs in the appropriate browser.

#### Props
```tsx
type ExternalLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};
```

#### Usage
```tsx
import { ExternalLink } from '@/components/ExternalLink';

<ExternalLink href="https://example.com">
  Open external link
</ExternalLink>
```

#### Platform Behavior
- **Web**: Opens in new browser tab
- **iOS/Android**: Opens in in-app browser
- Prevents default behavior on native platforms

#### Implementation Details
- Uses expo-web-browser for native platforms
- Uses expo-router Link for web platform
- Handles platform-specific behavior automatically

### ParallaxScrollView

A scroll view with parallax header effect and theme support.

#### Props
```tsx
type ParallaxScrollViewProps = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;
```

#### Usage
```tsx
import ParallaxScrollView from '@/components/ParallaxScrollView';

<ParallaxScrollView
  headerImage={<Image source={require('@/assets/images/header.png')} />}
  headerBackgroundColor={{ light: '#a1c4fd', dark: '#1a1a1a' }}
>
  <ThemedText>Content with parallax header</ThemedText>
</ParallaxScrollView>
```

#### Features
- Parallax scrolling effect for header
- Theme-aware background colors
- Smooth animations using Reanimated 2
- Configurable header height (250px default)

#### Animation Details
```tsx
const headerAnimatedStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value, 
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT], 
          [2, 1, 1]
        ),
      },
    ],
  };
});
```

---

## Utility Components

### HelloWave

An animated waving hand emoji component for welcome screens.

#### Props
None

#### Usage
```tsx
import { HelloWave } from '@/components/HelloWave';

<HelloWave />
```

#### Animation Details
- Uses React Native Reanimated 2
- 4-time repeat animation sequence
- 150ms duration per animation phase
- 25-degree rotation amplitude

#### Implementation
```tsx
const rotationAnimation = useSharedValue(0);

rotationAnimation.value = withRepeat(
  withSequence(
    withTiming(25, { duration: 150 }),
    withTiming(0, { duration: 150 }),
  ),
  4, // Run 4 times
);
```

---

## Component Testing

### Testing Strategy

#### Test Files Location
- Component tests: `components/__tests__/`
- Test utilities: `__tests__/utils/`
- Mock data: `__tests__/mocks/`

#### Testing Tools
- Jest for test framework
- React Native Testing Library for component testing
- React Test Renderer for snapshot testing

#### Test Coverage Requirements
- 90%+ statement coverage
- 85%+ branch coverage
- 95%+ function coverage
- 100% coverage for critical components

### MiniPlayer Test Example

```tsx
// components/__tests__/MiniPlayer.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import MiniPlayer from '../MiniPlayer';
import { AudioPlayerProvider } from '../../contexts/AudioPlayerContext';

// Mock dependencies
jest.mock('expo-router');
jest.mock('../../assets/Quran.json', () => [
  { id: 1, name: 'Al-Fatihah' },
  { id: 2, name: 'Al-Baqarah' },
]);

describe('MiniPlayer', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AudioPlayerProvider>
        {component}
      </AudioPlayerProvider>
    );
  };

  it('should not render when no audio is playing', () => {
    const { queryByTestId } = renderWithProvider(<MiniPlayer />);
    expect(queryByTestId('mini-player')).toBeNull();
  });

  it('should render when audio is playing', () => {
    // Mock audio playing state
    const { getByTestId } = renderWithProvider(<MiniPlayer />);
    expect(getByTestId('mini-player')).toBeTruthy();
  });

  it('should navigate to player when pressed', () => {
    const { getByTestId } = renderWithProvider(<MiniPlayer />);
    
    fireEvent.press(getByTestId('mini-player-content'));
    expect(mockRouter.push).toHaveBeenCalledWith('/player');
  });

  it('should toggle play/pause when play button is pressed', () => {
    const { getByTestId } = renderWithProvider(<MiniPlayer />);
    
    fireEvent.press(getByTestId('play-pause-button'));
    // Assert play/pause toggle function called
  });

  it('should show correct surah and verse information', () => {
    const { getByText } = renderWithProvider(<MiniPlayer />);
    
    expect(getByText('Al-Fatihah')).toBeTruthy();
    expect(getByText('آية 1')).toBeTruthy();
  });
});
```

### ThemedText Test Example

```tsx
// components/__tests__/ThemedText-test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';

jest.mock('../../hooks/useThemeColor');

describe('ThemedText', () => {
  const mockUseThemeColor = useThemeColor as jest.MockedFunction<typeof useThemeColor>;

  beforeEach(() => {
    mockUseThemeColor.mockReturnValue('#000000');
  });

  it('should render with default styling', () => {
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);
    
    const textElement = getByText('Test Text');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toContainEqual({ color: '#000000' });
  });

  it('should apply title styling', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    
    const textElement = getByText('Title');
    expect(textElement.props.style).toContainEqual(styles.title);
  });

  it('should use custom colors', () => {
    mockUseThemeColor.mockReturnValue('#ff0000');
    
    const { getByText } = render(
      <ThemedText lightColor="#ff0000" darkColor="#00ff00">
        Custom Color
      </ThemedText>
    );
    
    const textElement = getByText('Custom Color');
    expect(textElement.props.style).toContainEqual({ color: '#ff0000' });
  });
});
```

---

## Component Best Practices

### 1. TypeScript Usage
- Define clear prop interfaces
- Use generic types where appropriate
- Export types for external usage
- Provide default prop values

### 2. Accessibility
- Add test IDs for all interactive elements
- Use semantic HTML elements
- Provide accessibility labels
- Support screen readers

### 3. Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders
- Use useCallback and useMemo hooks

### 4. Styling
- Use StyleSheet.create for performance
- Implement theme support
- Support RTL for Arabic text
- Use responsive design principles

### 5. Testing
- Write unit tests for all components
- Test user interactions
- Mock external dependencies
- Maintain high test coverage

---

## Component Development Guidelines

### Creating New Components

1. **File Structure**
   ```
   components/
   ├── ComponentName/
   │   ├── ComponentName.tsx
   │   ├── ComponentName.styles.ts
   │   ├── ComponentName.types.ts
   │   ├── __tests__/
   │   │   └── ComponentName.test.tsx
   │   └── index.ts
   ```

2. **Component Template**
   ```tsx
   import React from 'react';
   import { View, StyleSheet } from 'react-native';
   import { ThemedText } from './ThemedText';

   interface ComponentNameProps {
     // Define props here
   }

   export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
     return (
       <View style={styles.container}>
         <ThemedText>Component content</ThemedText>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       // Style definitions
     },
   });

   export default ComponentName;
   ```

3. **Testing Template**
   ```tsx
   import React from 'react';
   import { render } from '@testing-library/react-native';
   import ComponentName from '../ComponentName';

   describe('ComponentName', () => {
     it('should render correctly', () => {
       const { getByText } = render(<ComponentName />);
       expect(getByText('Component content')).toBeTruthy();
     });
   });
   ```

### Component Review Checklist

- [ ] TypeScript types defined and exported
- [ ] Props documented with JSDoc
- [ ] Accessibility features implemented
- [ ] Theme support added
- [ ] RTL support for Arabic text
- [ ] Unit tests written
- [ ] Integration tests considered
- [ ] Performance implications evaluated
- [ ] Error handling implemented
- [ ] Loading states considered

---

## Component Dependencies

### External Libraries
- `@expo/vector-icons` - Icon components
- `expo-router` - Navigation components
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Gesture handling
- `@react-native-async-storage/async-storage` - Local storage

### Internal Dependencies
- `contexts/AudioPlayerContext` - Audio state management
- `hooks/useThemeColor` - Theme color hook
- `constants/Colors` - Color definitions
- `assets/Quran.json` - Quran data

### Peer Dependencies
- `react` - React framework
- `react-native` - React Native framework
- `expo` - Expo SDK

---

## Troubleshooting

### Common Component Issues

#### Theme Not Applying
- Check `useThemeColor` hook usage
- Verify color scheme context provider
- Ensure color constants are defined

#### Animation Performance
- Use `useNativeDriver: true` where possible
- Avoid layout animations in production
- Profile with React DevTools

#### Memory Leaks
- Clean up subscriptions in useEffect
- Remove event listeners on unmount
- Avoid circular references

#### Test Failures
- Mock external dependencies
- Check async test handling
- Verify test environment setup

---

*Last Updated: November 2025*  
*Version: 1.0*  
*Maintained by: Huda Al-Quran Development Team*
