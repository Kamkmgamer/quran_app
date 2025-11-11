# Development Setup Guide

This guide provides comprehensive instructions for setting up the development environment for the Huda Al-Quran application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Project Installation](#project-installation)
4. [Development Tools](#development-tools)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Development Workflow](#development-workflow)

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free disk space
- **Processor**: 64-bit processor with 4+ cores

#### Recommended Requirements
- **Operating System**: Windows 11, macOS 12+, or Ubuntu 20.04+
- **RAM**: 16GB+ (32GB for optimal performance)
- **Storage**: 20GB+ free disk space (for Android SDK, iOS tools, and project files)
- **Processor**: 64-bit processor with 8+ cores

### Required Software

#### Core Dependencies
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **npm**: Version 9.x or 10.x (comes with Node.js)
- **Git**: Latest version for version control

#### Mobile Development Tools
- **Expo CLI**: Latest version
- **React Native CLI**: For native builds
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

#### Optional Tools
- **VS Code**: Recommended IDE with extensions
- **React Developer Tools**: Browser extension
- **Flipper**: Debugging platform for mobile apps
- **Genymotion**: Android emulator (alternative to Android Studio)

---

## Environment Setup

### 1. Node.js Installation

#### Windows
```bash
# Download and install Node.js from official website
# https://nodejs.org/en/download/

# Or use Chocolatey
choco install nodejs --version=18.19.0

# Or use Scoop
scoop install nodejs@18
```

#### macOS
```bash
# Using Homebrew (recommended)
brew install node@18

# Or download from official website
# https://nodejs.org/en/download/

# Or using nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using Snap
sudo snap install node --classic --channel=18
```

### 2. Git Installation

#### Windows
```bash
# Download and install from Git website
# https://git-scm.com/download/win

# Or using Chocolatey
choco install git

# Or using Scoop
scoop install git
```

#### macOS
```bash
# Using Homebrew
brew install git

# Or download from Git website
# https://git-scm.com/download/mac
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# Or using Snap
sudo snap install git --classic
```

### 3. Expo CLI Installation

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version
```

### 4. Mobile Development Environment

#### Android Development (All Platforms)

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install with default settings
   - Launch Android Studio after installation

2. **Configure Android SDK**
   ```bash
   # Open Android Studio
   # Go to Tools > SDK Manager
   # Install:
   # - Android SDK Platform-Tools
   # - Android SDK Build-Tools
   # - Android 13 (API level 33) or higher
   # - Android Virtual Device (AVD)
   ```

3. **Set Environment Variables**
   ```bash
   # Windows (in System Properties > Environment Variables)
   ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

   # macOS/Linux (add to ~/.bashrc, ~/.zshrc, or ~/.profile)
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   export ANDROID_HOME=$HOME/Android/Sdk          # Linux
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
   ```

4. **Create Android Virtual Device**
   ```bash
   # Open Android Studio
   # Go to Tools > AVD Manager
   # Create Virtual Device:
   # - Choose Pixel 6 or similar device
   # - Select API level 33 or higher
   # - Use x86_64 or ARM64 image based on your system
   ```

#### iOS Development (macOS Only)

1. **Install Xcode**
   ```bash
   # Install from Mac App Store
   # Or download from: https://developer.apple.com/xcode/

   # Install command line tools
   xcode-select --install
   ```

2. **Install Xcode Command Line Tools**
   ```bash
   # Open Xcode
   # Go to Xcode > Preferences > Locations
   # Select Command Line Tools
   ```

3. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   pod setup
   ```

---

## Project Installation

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/quran-app.git
cd quran-app

# Or using SSH
git clone git@github.com:your-username/quran-app.git
cd quran-app
```

### 2. Install Dependencies

```bash
# Install npm dependencies
npm install

# Or using yarn (if preferred)
yarn install
```

### 3. Verify Installation

```bash
# Check Node.js version
node --version  # Should be 18.x or 20.x

# Check npm version
npm --version   # Should be 9.x or 10.x

# Check Expo CLI version
expo --version

# Check project dependencies
npm ls --depth=0
```

---

## Development Tools

### 1. Visual Studio Code Setup

#### Installation
```bash
# Download from: https://code.visualstudio.com/
# Or using package managers:

# Windows (Chocolatey)
choco install vscode

# macOS (Homebrew)
brew install --cask visual-studio-code

# Linux (Snap)
sudo snap install code --classic
```

#### Recommended Extensions

Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-react-native",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-jest"
  ]
}
```

#### VS Code Configuration

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.js": "javascriptreact"
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### 2. React Developer Tools

#### Browser Extension
- Install from Chrome Web Store or Firefox Add-ons
- https://react.dev/learn/react-developer-tools

#### React Native Debugger
```bash
# Install React Native Debugger
# Download from: https://github.com/jhen0409/react-native-debugger

# macOS
brew install --cask react-native-debugger

# Windows/Linux
# Download executable from GitHub releases
```

### 3. Flipper Setup

```bash
# Install Flipper
# Download from: https://fbflipper.com/

# macOS
brew install --cask flipper

# Windows/Linux
# Download from website
```

Install React Native plugins in Flipper:
- React DevTools
- Network Inspector
- Layout Inspector
- SharedPreferences (Android)

---

## Configuration

### 1. Environment Variables

Create `.env.local` file (don't commit to git):
```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.aladhan.com/v1
EXPO_PUBLIC_AUDIO_BASE_URL=https://everyayah.com/data
EXPO_PUBLIC_LOCATION_API_URL=https://nominatim.openstreetmap.org

# Development Settings
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_DEBUG_MODE=true

# Analytics (optional)
EXPO_PUBLIC_ANALYTICS_ENABLED=false
```

### 2. Expo Configuration

Update `app.json` for development:
```json
{
  "expo": {
    "name": "Huda Al-Quran (Dev)",
    "slug": "quran-app-dev",
    "version": "0.2.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.quranapp.dev"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.quranapp.dev"
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-font"
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 3. ESLint and Prettier Configuration

Update `.eslintrc.js`:
```javascript
module.exports = {
  extends: [
    'expo',
    '@react-native-community',
    'prettier'
  ],
  plugins: [
    '@react-native-community',
    'react',
    'react-hooks'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'warn',
    'react-native/no-single-element-style-arrays': 'warn',
    'react-native/no-unused-styles': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    }
  ]
};
```

Update `.prettierrc`:
```json
{
  "arrowParens": "avoid",
  "bracketSameLine": true,
  "bracketSpacing": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80
}
```

---

## Running the Application

### 1. Development Server

```bash
# Start Expo development server
npm start

# Or using Expo CLI directly
expo start

# Options:
# --clear    # Clear Metro bundler cache
# --tunnel   # Use tunnel for network access
# --web      # Start web version
# --ios      # Start iOS simulator (macOS only)
# --android  # Start Android emulator
```

### 2. Platform-Specific Development

#### iOS Development
```bash
# Start iOS simulator
expo start --ios

# Or run with Xcode
npx expo run:ios

# Build for iOS device
npx expo run:ios --device
```

#### Android Development
```bash
# Start Android emulator
expo start --android

# Or run with Android Studio
npx expo run:android

# Build for Android device
npx expo run:android --device
```

#### Web Development
```bash
# Start web development server
expo start --web

# Or build for web
npx expo export --platform web
```

### 3. Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:components
npm run test:services
npm run test:contexts
```

### 4. Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npx prettier --write .
```

---

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset project
npm run reset-project

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Reset Android Studio
# File > Invalidate Caches / Restart

# Check Android SDK installation
echo $ANDROID_HOME
adb devices
```

#### 3. iOS Build Issues
```bash
# Clean iOS build
cd ios
xcodebuild clean
cd ..

# Reset iOS Simulator
# iOS Simulator > Device > Erase All Content and Settings

# Update CocoaPods
cd ios
pod install
cd ..
```

#### 4. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Switch Node.js version (using nvm)
nvm use 18
nvm install 18
nvm alias default 18
```

#### 5. Port Conflicts
```bash
# Kill processes on port 8081 (Metro)
lsof -ti:8081 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8081  # Windows

# Start Expo on different port
expo start --port 8082
```

### Performance Issues

#### 1. Slow Development Server
```bash
# Increase Metro memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Use faster bundler
npx expo start --dev-client
```

#### 2. Slow Emulator/Simulator
```bash
# Use hardware acceleration
# Android Studio > AVD Manager > Edit AVD > Advanced > Graphics: Hardware

# Increase emulator memory
# Android Studio > AVD Manager > Edit AVD > Advanced > RAM: 4096+
```

---

## Development Workflow

### 1. Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Start development server
npm start

# 4. Run tests in separate terminal
npm run test:watch

# 5. Make changes and test
# 6. Commit changes
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
```

### 2. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Development work
# ... make changes ...

# Run tests and linting
npm test
npm run lint

# Commit changes
git add .
git commit -m "feat: implement new feature"

# Push and create PR
git push origin feature/new-feature
```

### 3. Debugging Workflow

```bash
# 1. Start development server
npm start

# 2. Open app in simulator/emulator

# 3. Open debugger
# - Shake device (or press Ctrl+M/D)
# - Select "Debug with Chrome"
# - Open Chrome DevTools

# 4. Use Flipper for advanced debugging
# - Open Flipper
# - Connect to running app
# - Use available plugins
```

### 4. Performance Testing

```bash
# Profile React components
# Use React DevTools Profiler

# Monitor network requests
# Use Flipper Network Inspector

# Check memory usage
# Use Flipper Layout Inspector
# Or Chrome DevTools Memory tab
```

---

## Environment-Specific Notes

### Windows Development

#### WSL2 Setup (Recommended)
```bash
# Install WSL2
wsl --install

# Install Ubuntu
wsl --install -d Ubuntu

# Setup development environment in WSL2
sudo apt update
sudo apt install nodejs npm git
```

#### Windows-Specific Issues
- Use PowerShell or Git Bash for commands
- Configure Android Studio for Windows
- Use Windows Terminal for better experience
- Consider using WSL2 for Linux-like environment

### macOS Development

#### Xcode Setup
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept

# Install simulators
xcrun simctl list devices available
```

#### macOS-Specific Tools
```bash
# Homebrew for package management
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Useful development tools
brew install --cask react-native-debugger
brew install --cask flipper
```

### Linux Development

#### Ubuntu/Debian Setup
```bash
# Install required dependencies
sudo apt update
sudo apt install build-essential git curl

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Android development tools
sudo apt install openjdk-11-jdk
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip
sudo mv cmdline-tools /usr/local/android-sdk/cmdline-tools
```

---

## Next Steps

After completing the setup:

1. **Review the project structure** and understand the codebase
2. **Read the API documentation** to understand external integrations
3. **Check the architectural decision records** for technical decisions
4. **Run the test suite** to ensure everything is working
5. **Join the development team** communication channels
6. **Set up your development environment** preferences and tools

---

## Support

For setup issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [Expo documentation](https://docs.expo.dev/)
3. Check [React Native documentation](https://reactnative.dev/docs/getting-started)
4. Create an issue in the project repository
5. Contact the development team

---

*Last Updated: November 2025*  
*Version: 1.0*  
*Maintained by: Huda Al-Quran Development Team*
