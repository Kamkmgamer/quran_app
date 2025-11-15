# قرآن - Quran App

<div align="center">

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

**A comprehensive Islamic mobile application for reading the Holy Quran with audio recitation, prayer times, and Qibla direction.**

[Features](#features) • [Installation](#installation) • [Building](#building) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📖 About

This is a full-featured Quran application built with React Native and Expo, providing Muslims with essential tools for their daily worship including:

- 📕 Complete Quran text with beautiful Arabic typography
- 🎧 Audio recitation from 8+ renowned reciters
- 🕌 Accurate prayer times based on location
- 🧭 Qibla direction finder with compass
- 🔖 Bookmarks and reading progress tracking
- 🌙 Dark/Light mode support
- 📱 Cross-platform support (iOS, Android, Web)

---

## 🌟 Features

### Quran Reading
- Complete Quran text in Arabic
- Verse-by-verse navigation
- Adjustable font sizes
- Bookmarking system
- Copy and share verses
- Search functionality

### Audio Recitation
- 8+ world-renowned reciters including:
  - Abdul Basit Abdul Samad
  - Maher Al Muaiqly
  - Mishary Rashid Alafasy
  - Mahmoud Khalil Al-Hussary
  - And more...
- Verse-by-verse synchronization with text highlighting
- Playback speed control (0.5x - 2.0x)
- Repeat modes (verse, surah, all)
- Download for offline listening
- Mini player with full-screen player
- Resume playback feature

### Prayer Times
- Accurate prayer times based on GPS location
- Multiple calculation methods
- Prayer time notifications
- Qibla direction with compass
- Location-based services

### User Experience
- Beautiful, modern UI with Arabic design elements
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Gesture controls
- Accessibility support

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kamkmgamer/quran_app.git
   cd quran_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your preferred platform:**
   ```bash
   # Android
   npm run android

   # iOS (macOS only)
   npm run ios

   # Web
   npm run web
   ```

---

## 🔨 Building

### Android APK

For detailed instructions on building the Android release APK on Windows, see [BUILD_GUIDE_WINDOWS.md](./BUILD_GUIDE_WINDOWS.md).

**Quick build:**
```bash
cd android
mkdir build\tmp
.\gradlew assembleRelease
```

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### iOS Build

```bash
npm run ios
```

For production builds, use Xcode to archive and distribute.

---

## 📚 Documentation

- **[Audio Recitation System](./AUDIO_RECITATION_README.md)** - Comprehensive guide to the audio player features
- **[Build Guide for Windows](./BUILD_GUIDE_WINDOWS.md)** - Step-by-step Android build instructions
- **[LLM Build Guide](./LLM_BUILD_GUIDE.md)** - AI-assisted development guide
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Architecture Decision Records](./docs/adr/)** - Technical decisions and rationale

---

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:services
npm run test:components
npm run test:contexts

# Run tests in CI mode
npm run test:ci
```

---

## 🛠️ Tech Stack

- **Framework:** React Native 0.74.5
- **Navigation:** Expo Router 3.5.24
- **State Management:** React Context API
- **Audio:** Expo AV
- **Storage:** AsyncStorage
- **Location Services:** Expo Location
- **Sensors:** Expo Sensors (for Qibla compass)
- **Testing:** Jest + React Native Testing Library
- **Code Quality:** ESLint + Prettier
- **Type Safety:** TypeScript

---

## 📁 Project Structure

```
QuranApp/
├── app/                    # Main application screens (Expo Router)
│   ├── index.tsx          # Home screen
│   ├── quran.tsx          # Quran reading screen
│   ├── player.tsx         # Full audio player
│   ├── reciters.tsx       # Reciter selection
│   ├── prayer-times.tsx   # Prayer times screen
│   ├── qibla.tsx          # Qibla direction finder
│   └── settings.tsx       # App settings
├── components/            # Reusable UI components
│   ├── MiniPlayer.tsx     # Floating mini player
│   ├── Menu.tsx           # Navigation menu
│   └── ...
├── contexts/              # React Context providers
│   └── AudioPlayerContext.tsx
├── services/              # Business logic and API services
│   ├── AudioService.ts    # Audio playback management
│   ├── StorageService.ts  # Local storage and downloads
│   ├── TimingService.ts   # Audio sync timing
│   └── PrayerTimesService.ts
├── assets/                # Static assets
│   ├── reciters.json      # Reciter data
│   └── timings/           # Audio sync timing files
├── __tests__/             # Test files
└── docs/                  # Documentation
```

---

## 🔧 Configuration

### Environment Variables

The app uses Expo's configuration system. Key settings are in:
- `app.json` - Expo configuration
- `eas.json` - EAS Build configuration

### Permissions

The app requires the following permissions:
- **Location** - For prayer times and Qibla direction
- **Storage** - For downloading audio files
- **Internet** - For streaming audio and fetching data

---

## 🌐 API Sources

- **Audio Recitations:** [Everyayah.com](https://everyayah.com)
- **Quran Text:** Tanzil.net
- **Prayer Times:** Custom calculation service

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow the ESLint configuration
- Use Prettier for formatting
- Write tests for new features
- Update documentation as needed

```bash
# Lint your code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

---

## 🐛 Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

Common issues:
- **Build failures:** Check [BUILD_GUIDE_WINDOWS.md](./BUILD_GUIDE_WINDOWS.md)
- **Audio not playing:** Verify internet connection for streaming
- **Location not working:** Ensure location permissions are granted

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- **Everyayah.com** - Audio recitation source
- **Tanzil.net** - Quran text reference
- **Expo Team** - Amazing development framework
- **React Native Community** - Excellent libraries and support

---

## 📞 Contact

**Repository:** [https://github.com/Kamkmgamer/quran_app](https://github.com/Kamkmgamer/quran_app)

---

<div align="center">

**تم التطوير بـ ❤️ لخدمة كتاب الله**

*Developed with ❤️ to serve the Book of Allah*

</div>
