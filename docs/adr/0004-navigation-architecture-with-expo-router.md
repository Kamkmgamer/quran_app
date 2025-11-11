# ADR-0004: Navigation Architecture with Expo Router

## Status
Accepted

## Context
The Huda Al-Quran application requires a comprehensive navigation system to handle multiple screens and user flows:

- **Main Navigation**: Home, Quran Reader, Prayer Times, Qibla Direction
- **Feature Screens**: Audio Player, Reciters Selection, Bookmarks, Settings
- **Modal Flows**: Font Size Adjustment, Prayer Details
- **Deep Linking**: Support for direct navigation to specific verses/surahs
- **RTL Support**: Right-to-left navigation for Arabic interface

The navigation needed to support:

- File-based routing for better organization
- Type-safe navigation with TypeScript
- Smooth transitions and animations
- Tab navigation for quick access
- Stack navigation for hierarchical flows
- Modal presentation for overlays

## Decision
We chose Expo Router (file-based routing) as the navigation solution, built on top of React Navigation.

### Architecture Overview

#### 1. File-Based Structure
```
app/
├── _layout.tsx              # Root layout with providers
├── index.tsx                # Home screen
├── quran.tsx                # Quran reader
├── prayer-times.tsx         # Prayer times
├── qibla.tsx                # Qibla direction
├── player.tsx               # Audio player
├── reciters.tsx             # Reciter selection
├── bookmarks.tsx            # Bookmarks management
├── font-size.tsx            # Font size settings
├── prayer-detail.tsx        # Prayer detail modal
├── +not-found.tsx           # 404 screen
└── +html.tsx                # Web fallback
```

#### 2. Navigation Hierarchy
```typescript
// Root layout with stack navigation
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="quran" options={{ headerShown: false }} />
  <Stack.Screen name="prayer-times" options={{ headerShown: false }} />
  <Stack.Screen name="qibla" options={{ headerShown: false }} />
  <Stack.Screen name="player" options={{ headerShown: false }} />
  <Stack.Screen name="reciters" options={{ headerShown: false }} />
  <Stack.Screen name="bookmarks" options={{ headerShown: false }} />
  <Stack.Screen name="font-size" options={{ headerShown: false }} />
  <Stack.Screen name="prayer-detail" options={{ headerShown: false }} />
</Stack>
```

#### 3. Provider Integration
```typescript
export default function RootLayout() {
  return (
    <ActionSheetProvider>
      <AudioPlayerProvider>
        <LocationProvider>
          <ThemeProvider value={DarkTheme}>
            <View style={{ flex: 1 }}>
              <Stack>
                {/* Navigation screens */}
              </Stack>
              <MiniPlayer /> {/* Global audio controls */}
            </View>
          </ThemeProvider>
        </LocationProvider>
      </AudioPlayerProvider>
    </ActionSheetProvider>
  );
}
```

## Rationale

### Why Expo Router?

#### 1. **File-Based Routing**
- Intuitive organization matching file structure
- Automatic route generation
- Easy to understand and maintain
- Clear separation of concerns

#### 2. **Type Safety**
- Built-in TypeScript support
- Type-safe navigation parameters
- Autocomplete for route names
- Compile-time error checking

#### 3. **Deep Linking Support**
- Automatic deep linking setup
- URL-based navigation
- State preservation through URLs
- Web platform compatibility

#### 4. **Performance**
- Code splitting by route
- Lazy loading of screens
- Optimized bundle sizes
- Fast navigation transitions

### Why Not React Navigation Directly?

#### Traditional React Navigation
- **Manual configuration**: Requires explicit route definitions
- **More boilerplate**: Complex setup for nested navigators
- **No deep linking**: Requires additional configuration
- **Type safety**: Needs manual TypeScript setup

#### Expo Router Advantages
- **Zero-config**: Works out of the box
- **Convention over configuration**: Follows file system conventions
- **Better DX**: Improved developer experience
- **Future-proof**: Aligned with Expo ecosystem

## Implementation Details

### 1. RTL Support Configuration
```typescript
// Force RTL layout for Arabic interface
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
```

### 2. Navigation Patterns

#### Stack Navigation
- Used for main app flow
- Hierarchical navigation between screens
- Back button support
- Gesture-based navigation

#### Modal Presentation
```typescript
// Modal for settings and details
<Stack.Screen
  name="font-size"
  options={{
    presentation: 'modal',
    headerShown: false,
  }}
/>
```

#### Tab Navigation (Future)
- Quick access to main features
- Bottom tab bar for easy navigation
- Badge support for notifications

### 3. Global Components
```typescript
// MiniPlayer available on all screens
<View style={{ flex: 1 }}>
  <Stack>
    {/* Navigation screens */}
  </Stack>
  <MiniPlayer /> {/* Persistent audio controls */}
</View>
```

### 4. Route Organization

#### Feature-Based Grouping
- Related screens in same directory
- Shared components and utilities
- Consistent naming conventions

#### Dynamic Routes
```typescript
// Support for dynamic verse navigation
// /quran/[surah]/[verse]
```

## Consequences

### Positive
- **Developer Experience**: Intuitive file-based organization
- **Type Safety**: Full TypeScript support with autocomplete
- **Performance**: Automatic code splitting and lazy loading
- **Deep Linking**: Built-in support for URL navigation
- **Maintainability**: Clear structure and conventions

### Negative
- **Learning Curve**: Team needs to learn Expo Router patterns
- **Convention Constraints**: Less flexibility than manual configuration
- **Debugging**: File-based routing can be harder to debug initially
- **Migration Effort**: Existing navigation needs refactoring

### Neutral
- **Bundle Size**: Slightly larger due to additional routing logic
- **Build Time**: File system scanning adds to build time
- **Tooling**: Requires Expo Router specific tooling

## Navigation Flows

### 1. Quran Reading Flow
```
Home → Quran Reader → Select Surah → Verse View
                    ↓
              Audio Player (modal)
                    ↓
              Reciter Selection
```

### 2. Prayer Times Flow
```
Home → Prayer Times → Prayer Detail (modal)
      ↓              ↓
   Qibla Direction  Settings
```

### 3. Settings Flow
```
Home → Font Size (modal) → Reciter Selection → Bookmarks
```

## Performance Optimizations

### 1. Lazy Loading
- Screens loaded on demand
- Reduced initial bundle size
- Faster app startup

### 2. Route-Based Code Splitting
```typescript
// Automatic code splitting by route
// quran.tsx -> quran.bundle.js
// player.tsx -> player.bundle.js
```

### 3. Navigation Optimization
```typescript
// Optimized navigation with preloading
const navigator = useNavigation();
// Preload critical routes
```

## Future Enhancements

### 1. Advanced Navigation
- Nested navigators for complex flows
- Custom transitions and animations
- Navigation state persistence

### 2. Deep Linking Expansion
- Direct verse navigation via URLs
- Sharing specific Quran positions
- Web-to-app deep linking

### 3. Performance Improvements
- Route preloading strategies
- Navigation caching
- Bundle optimization

### 4. Accessibility
- Screen reader support
- Navigation announcements
- Keyboard navigation

## Alternatives Considered

### 1. React Navigation (Manual)
- **Pros**: Full control, established library
- **Cons**: More boilerplate, manual type setup

### 2. React Native Navigation (Wix)
- **Pros**: Native performance, platform-specific
- **Cons**: Complex setup, less React-like

### 3. Custom Navigation Solution
- **Pros**: Tailored to specific needs
- **Cons**: Maintenance burden, reinventing wheel

### 4. Single Screen Application
- **Pros**: Simplest approach
- **Cons**: Poor UX, no navigation structure

---

*Decision Date: November 2025*  
*Status: Accepted*  
*Next Review: When navigation requirements significantly change or performance issues arise*
