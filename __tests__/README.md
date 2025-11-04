# Testing Guide for Quran App

This document provides comprehensive information about the testing setup and best practices for the Quran App project.

## 🧪 Testing Setup

### Configuration Files
- `jest.config.js` - Main Jest configuration with coverage settings and module mapping
- `jest.setup.js` - Global test setup with mocks and utility functions

### Test Structure
```
__tests__/
├── utils/
│   ├── testHelpers.tsx    # Custom render functions and test utilities
│   └── testData.ts        # Mock data for consistent testing
├── mocks/
│   └── expoMocks.ts       # Comprehensive Expo module mocks
└── README.md              # This file
```

### Test Files Location
- `services/__tests__/` - Service layer unit tests
- `components/__tests__/` - Component tests
- `contexts/__tests__/` - Context provider tests
- `app/__tests__/` - Screen/component tests (when needed)

## 🚀 Available Test Scripts

```bash
# Run all tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, coverage enabled)
npm run test:ci

# Run tests silently (no watch, minimal output)
npm run test:silent

# Run specific test suites
npm run test:services
npm run test:components
npm run test:contexts

# Debug tests with detailed output
npm run test:debug
```

## 📦 Testing Dependencies

### Core Dependencies
- `jest` - Testing framework
- `jest-expo` - Expo-specific Jest preset
- `@testing-library/react-native` - Component testing utilities
- `react-test-renderer` - Snapshot testing

### Mocked Dependencies
All Expo modules and external dependencies are mocked in `jest.setup.js`:
- `expo-av` - Audio functionality
- `expo-file-system` - File operations
- `@react-native-async-storage/async-storage` - Local storage
- `expo-router` - Navigation
- `expo-location` - Location services
- `expo-sensors` - Device sensors

## 🛠️ Testing Utilities

### Custom Render Function
```tsx
import { render } from '__tests__/utils/testHelpers';

// Uses all providers automatically
const { getByText } = render(<MyComponent />);
```

### Mock Data Helpers
```tsx
import { 
  createMockSurah,
  createMockReciter,
  mockQuranData,
  mockRecitersData 
} from '__tests__/utils/testData';

const surah = createMockSurah(1, 'Al-Fatihah', 7);
```

### Expo Mocks
```tsx
import { 
  mockAudioSound,
  mockFileSystem,
  mockAsyncStorage 
} from '__tests__/mocks/expoMocks';

// Reset all mocks before each test
beforeEach(() => {
  resetAllMocks();
});
```

## 📋 Testing Best Practices

### 1. Component Testing
- Test user interactions (press, input, scroll)
- Test component rendering with different props
- Test conditional rendering
- Use `testID` props for reliable element selection

### 2. Service Testing
- Test all public methods
- Test error handling scenarios
- Mock external dependencies
- Test async operations properly

### 3. Context Testing
- Test context provider functionality
- Test state updates
- Test context consumer behavior
- Test error boundaries

### 4. Mock Strategy
- Mock external APIs and services
- Use consistent mock data
- Reset mocks between tests
- Avoid over-mocking

## 🎯 Test Coverage Goals

### Minimum Coverage Requirements
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

### Priority Areas
1. **Service Layer** - Critical business logic
2. **Audio Functionality** - Core app feature
3. **Storage Operations** - Data persistence
4. **Navigation** - User flow
5. **UI Components** - User interaction

## 📊 Coverage Reports

Coverage reports are generated in:
- `coverage/lcov.info` - LCOV format for CI integration
- `coverage/html/index.html` - Interactive HTML report

### Viewing Coverage Report
```bash
npm run test:coverage
# Open coverage/html/index.html in browser
```

## 🔧 Debugging Tests

### Common Issues
1. **Async Operations**: Use `act()` from React Test Utils
2. **Timer Issues**: Use `jest.useFakeTimers()`
3. **Memory Leaks**: Use `--detectOpenHandles` flag
4. **Mock Persistence**: Reset mocks in `beforeEach`

### Debug Commands
```bash
# Run tests with debugging info
npm run test:debug

# Run specific test file
npm test -- --testPathPattern=StorageService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should save"
```

## 🚨 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./coverage/lcov.info
```

### Coverage Thresholds
Configure in `jest.config.js`:
```js
coverageThreshold: {
  global: {
    branches: 75,
    functions: 85,
    lines: 80,
    statements: 80
  }
}
```

## 📝 Writing New Tests

### Test Template
```tsx
import React from 'react';
import { render, fireEvent } from '__tests__/utils/testHelpers';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByTestId } = render(<MyComponent />);
    expect(getByTestId('my-component')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<MyComponent onPress={mockFn} />);
    
    fireEvent.press(getByTestId('my-button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Service Test Template
```ts
import MyService from '../MyService';
import { mockAsyncStorage } from '__tests__/mocks/expoMocks';

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should perform action correctly', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('mock-data');
    
    const result = await MyService.getData();
    
    expect(result).toBe('mock-data');
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('key');
  });
});
```

## 🎉 Running Tests

### Development Mode
```bash
# Watch mode for development
npm test

# Run specific test suite
npm run test:services
```

### Production Mode
```bash
# CI mode with coverage
npm run test:ci

# Silent mode for automation
npm run test:silent
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
