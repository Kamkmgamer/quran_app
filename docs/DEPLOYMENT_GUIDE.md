# Deployment Guide

This comprehensive guide covers the deployment process for the Huda Al-Quran application across all platforms including iOS, Android, and Web.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Build Configuration](#build-configuration)
4. [iOS Deployment](#ios-deployment)
5. [Android Deployment](#android-deployment)
6. [Web Deployment](#web-deployment)
7. [Environment Management](#environment-management)
8. [Release Process](#release-process)
9. [Monitoring and Analytics](#monitoring-and-analytics)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Targets

- **iOS App Store**: Production deployment for iOS devices
- **Google Play Store**: Production deployment for Android devices
- **Web Application**: Progressive Web App (PWA) for browsers
- **OTA Updates**: Over-the-air updates for installed apps
- **Development Builds**: Testing and staging environments

### Deployment Strategy

The application uses **Expo Application Services (EAS)** for streamlined deployment across all platforms with:

- Automated build processes
- Environment-specific configurations
- Code signing and certificate management
- Store submission automation
- Rollback capabilities

---

## Prerequisites

### Account Requirements

#### Development Accounts
- **Expo Account**: Free account for build services
- **GitHub Account**: For CI/CD integration
- **Apple Developer Account**: $99/year for iOS deployment
- **Google Play Developer Account**: $25 one-time fee for Android deployment

#### Platform-Specific Requirements

##### iOS Deployment
- **Mac Computer**: Required for iOS builds
- **Xcode**: Latest version (14.x or higher)
- **iOS Simulator**: For testing
- **Apple Developer Program**: Paid membership

##### Android Deployment
- **Android Studio**: Latest stable version
- **Java Development Kit**: JDK 11 or higher
- **Android SDK**: API level 33 or higher
- **Keystore File**: For app signing

##### Web Deployment
- **Hosting Provider**: Vercel, Netlify, AWS S3, or similar
- **Domain Name**: Custom domain (optional)
- **SSL Certificate**: For HTTPS (usually provided by host)

### Tool Installation

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Link project to Expo
eas project:info
```

---

## Build Configuration

### 1. EAS Configuration

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "development"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "aab",
        "resourceClass": "medium"
      },
      "web": {
        "bundler": "metro"
      }
    },
    "staging": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "AB12CD34EF"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 2. App Configuration

Update `app.json` for production:

```json
{
  "expo": {
    "name": "Huda Al-Quran",
    "slug": "huda-al-quran",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a237e"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.huda.quran",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs location access to calculate accurate prayer times.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Location access is used for prayer time calculations and Qibla direction.",
        "NSMicrophoneUsageDescription": "Microphone access is not required by this application.",
        "NSCameraUsageDescription": "Camera access is not required by this application."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1a237e"
      },
      "package": "com.huda.quran",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-font",
      "expo-asset",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Huda Al-Quran to use your location for prayer times and Qibla direction."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      },
      "apiBaseUrl": "https://api.aladhan.com/v1",
      "audioBaseUrl": "https://everyayah.com/data"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/your-project-id",
      "enabled": true,
      "fallbackToCacheTimeout": 0
    }
  }
}
```

### 3. Environment Configuration

Create environment-specific files:

#### `.env.production`
```env
# Production API URLs
EXPO_PUBLIC_API_BASE_URL=https://api.aladhan.com/v1
EXPO_PUBLIC_AUDIO_BASE_URL=https://everyayah.com/data
EXPO_PUBLIC_LOCATION_API_URL=https://nominatim.openstreetmap.org

# Production Settings
EXPO_PUBLIC_DEV_MODE=false
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_CRASH_REPORTING_ENABLED=true

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=your-production-encryption-key
```

#### `.env.staging`
```env
# Staging API URLs
EXPO_PUBLIC_API_BASE_URL=https://api-staging.aladhan.com/v1
EXPO_PUBLIC_AUDIO_BASE_URL=https://everyayah.com/data
EXPO_PUBLIC_LOCATION_API_URL=https://nominatim.openstreetmap.org

# Staging Settings
EXPO_PUBLIC_DEV_MODE=false
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_CRASH_REPORTING_ENABLED=true

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=your-staging-encryption-key
```

---

## iOS Deployment

### 1. Apple Developer Setup

#### App Store Connect Configuration
```bash
# 1. Login to App Store Connect
# https://appstoreconnect.apple.com

# 2. Create new app
# - App Name: Huda Al-Quran
# - Primary Language: English
# - Bundle ID: com.huda.quran
# - SKU: QURAN001

# 3. Configure app information
# - Category: Reference
# - Content Rights: No third-party content
# - App Privacy: Configure location data usage
```

#### Certificate and Provisioning Profiles
```bash
# Using EAS (recommended)
eas credentials

# Or manually in Xcode:
# 1. Open Xcode
# 2. Preferences > Accounts
# 3. Add Apple ID
# 4. Select team and manage certificates
```

### 2. Build Process

#### Development Build
```bash
# Build for iOS simulator
eas build --platform ios --profile development

# Build for development device
eas build --platform ios --profile preview
```

#### Production Build
```bash
# Build for App Store submission
eas build --platform ios --profile production

# Build with specific version
eas build --platform ios --profile production --version "1.0.0" --build-number "1"
```

#### Staging Build
```bash
# Build for internal testing
eas build --platform ios --profile staging
```

### 3. App Store Submission

#### Pre-Submission Checklist
```bash
# 1. Test on physical device
eas build --platform ios --profile preview
# Install on device via TestFlight or direct installation

# 2. Run automated tests
npm run test:ci

# 3. Check app size and performance
# Target: < 100MB app size, < 3 second launch time

# 4. Verify app store guidelines compliance
# https://developer.apple.com/app-store/review/guidelines/
```

#### Submission Process
```bash
# 1. Build production version
eas build --platform ios --profile production

# 2. Submit to App Store Connect
eas submit --platform ios --profile production

# 3. Configure App Store Connect metadata
# - App description and screenshots
# - Privacy policy URL
# - Support URL
# - Marketing URL

# 4. Submit for review
# Manual step in App Store Connect
```

#### TestFlight Beta Testing
```bash
# 1. Build for internal testing
eas build --platform ios --profile preview

# 2. Upload to TestFlight
eas submit --platform ios --profile preview

# 3. Add testers in App Store Connect
# 4. Monitor feedback and crash reports
```

### 4. iOS-Specific Configuration

#### Info.plist Modifications
```xml
<!-- Add to app.json ios.infoPlist section -->
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

#### App Icon and Splash Screen
```bash
# Generate app icons
npx expo-cli generate-app-icons

# Generate splash screens
npx expo-cli generate-splash

# Or use EAS Asset Generation
eas asset:generate --platform ios
```

---

## Android Deployment

### 1. Google Play Console Setup

#### App Configuration
```bash
# 1. Login to Google Play Console
# https://play.google.com/console

# 2. Create new app
# - App name: Huda Al-Quran
# - Default language: English
# - App or game: App
# - Free or paid: Free

# 3. Fill out store listing
# - App description
# - Screenshots (phone, tablet)
# - Icon and feature graphic
# - Content rating questionnaire
```

#### Content Rating and Privacy
```bash
# 1. Complete content rating questionnaire
# - Age appropriate content
# - Privacy policy requirements
# - Data collection practices

# 2. Upload privacy policy
# - Host privacy policy on your website
# - Provide URL in Play Console

# 3. Configure app content
# - Target audience
# - Content guidelines
# - Ads policy
```

### 2. Build Configuration

#### Keystore Management
```bash
# Generate keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 -keystore quran-app.keystore -alias quran-app-key -keyalg RSA -keysize 2048 -validity 10000

# Store keystore securely (don't commit to git)
# Add keystore credentials to environment variables
```

#### Build Process
```bash
# Development build (APK for testing)
eas build --platform android --profile development

# Staging build (AAB for internal testing)
eas build --platform android --profile staging

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### 3. Play Store Submission

#### Pre-Launch Checklist
```bash
# 1. Test on multiple devices
# - Different Android versions (API 24+)
# - Different screen sizes
# - Different manufacturers

# 2. Run automated tests
npm run test:ci

# 3. Check app performance
# Target: < 150MB APK size, < 3 second launch time

# 4. Verify Play Console policies
# https://play.google.com/console/about/policies/
```

#### Submission Process
```bash
# 1. Build production AAB
eas build --platform android --profile production

# 2. Submit to Google Play
eas submit --platform android --profile production

# 3. Complete Play Console setup
# - Store listing
# - Release notes
# - Content rating
# - Pricing and distribution

# 4. Create release
# - Internal testing (first)
# - Closed testing (beta)
# - Open testing (optional)
# - Production release
```

#### Release Tracks
```bash
# Internal Testing
eas submit --platform android --profile staging --track internal

# Closed Testing
eas submit --platform android --profile production --track beta

# Production
eas submit --platform android --profile production --track production
```

### 4. Android-Specific Configuration

#### Gradle Configuration
```groovy
// android/app/build.gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }

    defaultConfig {
        applicationId "com.huda.quran"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode project.ext.versionCode
        versionName project.ext.versionName
        multiDexEnabled true
    }

    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

---

## Web Deployment

### 1. Build Configuration

#### Metro Bundler Setup
```bash
# Build for web production
npx expo export --platform web

# Or with custom output directory
npx expo export --platform web --output-dir dist

# Build with environment variables
EXPO_PUBLIC_ENV=production npx expo export --platform web
```

#### Optimization Configuration
```json
// Add to app.json web section
"web": {
  "favicon": "./assets/images/favicon.png",
  "bundler": "metro",
  "output": "static",
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### 2. Hosting Options

#### Vercel Deployment (Recommended)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build and deploy
vercel --prod

# 3. Configure vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Netlify Deployment
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build and deploy
netlify deploy --prod --dir=dist

# 3. Configure netlify.toml
[build]
  publish = "dist"
  command = "npx expo export --platform web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### AWS S3 Deployment
```bash
# 1. Install AWS CLI
# Configure AWS credentials

# 2. Build and upload
npx expo export --platform web
aws s3 sync dist/ s3://your-bucket-name --delete

# 3. Configure CloudFront
# Create distribution pointing to S3 bucket
# Configure custom domain and SSL
```

### 3. PWA Configuration

#### Service Worker Setup
```javascript
// public/sw.js
const CACHE_NAME = 'quran-app-v1';
const urlsToCache = [
  '/',
  '/assets/fonts/Othmani.ttf',
  '/assets/Quran.json',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

#### Web App Manifest
```json
{
  "name": "Huda Al-Quran",
  "short_name": "Quran",
  "description": "Digital Quran with audio recitation",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a237e",
  "theme_color": "#1a237e",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Environment Management

### 1. CI/CD Pipeline

#### GitHub Actions Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run linting
        run: npm run lint

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npx expo export --platform web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### Environment Variables Setup
```bash
# GitHub Secrets
EXPO_TOKEN=your-expo-token
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id

# EAS Secrets
eas secret:create --name API_KEY --value "your-api-key"
eas secret:create --name ENCRYPTION_KEY --value "your-encryption-key"
```

### 2. Version Management

#### Semantic Versioning
```bash
# Update version in app.json
{
  "expo": {
    "version": "1.2.3",
    "ios": {
      "buildNumber": "45"
    },
    "android": {
      "versionCode": 45
    }
  }
}

# Automated version bumping
npm version patch  # 1.2.3 -> 1.2.4
npm version minor  # 1.2.3 -> 1.3.0
npm version major  # 1.2.3 -> 2.0.0
```

#### Release Branch Strategy
```bash
# Create release branch
git checkout -b release/v1.2.3

# Update version and changelog
npm version patch --no-git-tag-version
# Update CHANGELOG.md

# Commit and tag
git add .
git commit -m "chore: release v1.2.3"
git tag v1.2.3

# Push and deploy
git push origin release/v1.2.3
git push origin v1.2.3

# Merge to main after successful deployment
git checkout main
git merge release/v1.2.3
git push origin main
```

---

## Release Process

### 1. Pre-Release Checklist

#### Quality Assurance
```bash
# 1. Automated testing
npm run test:ci
npm run lint
npm run type-check

# 2. Manual testing checklist
# - [ ] App launches successfully
# - [ ] All screens load properly
# - [ ] Audio playback works
# - [ ] Location services function
# - [ ] Offline mode works
# - [ ] Settings are saved
# - [ ] Performance is acceptable

# 3. Device testing
# - [ ] iOS (iPhone, iPad)
# - [ ] Android (multiple manufacturers)
# - [ ] Different OS versions
# - [ ] Different screen sizes

# 4. Store compliance
# - [ ] App Store guidelines
# - [ ] Google Play policies
# - [ ] Privacy policy updated
# - [ ] Content rating complete
```

#### Performance Monitoring
```bash
# 1. Bundle size analysis
npx expo export --platform web
# Check bundle size: < 5MB for web, < 100MB for mobile

# 2. Performance metrics
# - Launch time: < 3 seconds
# - Memory usage: < 200MB peak
# - Battery usage: < 10%/hour background

# 3. Error monitoring
# Check crash reports in development
# Verify error handling in production
```

### 2. Release Deployment

#### Staging Release
```bash
# 1. Build staging versions
eas build --platform ios --profile staging
eas build --platform android --profile staging

# 2. Deploy to internal testing
eas submit --platform ios --profile staging --track internal
eas submit --platform android --profile staging --track internal

# 3. Monitor for issues
# Check crash reports
# Monitor performance
# Gather feedback from testers
```

#### Production Release
```bash
# 1. Build production versions
eas build --platform ios --profile production
eas build --platform android --profile production

# 2. Deploy to app stores
eas submit --platform ios --profile production
eas submit --platform android --profile production

# 3. Deploy web
npx expo export --platform web
vercel --prod

# 4. Update documentation
# Update changelog
# Notify users of new features
# Update app store descriptions
```

### 3. Post-Release Monitoring

#### Analytics and Metrics
```bash
# 1. Monitor download numbers
# App Store Analytics
# Google Play Console

# 2. Track crash rates
# Expo Dashboard
# Firebase Crashlytics

# 3. Monitor performance
# Bundle size
# Launch times
# API response times

# 4. User feedback
# App store reviews
# Support tickets
# User analytics
```

#### Issue Response
```bash
# 1. Critical issues
# Hotfix release process
# Emergency OTA update
# Store review communication

# 2. Minor issues
# Regular release schedule
# User communication
# Documentation updates

# 3. Performance issues
# Performance monitoring
# Optimization roadmap
# Infrastructure scaling
```

---

## Monitoring and Analytics

### 1. Application Monitoring

#### Expo Dashboard
```bash
# 1. Setup project monitoring
# Link to Expo project
# Configure build notifications
# Set up error alerts

# 2. Monitor OTA updates
# Update adoption rates
# Rollback capabilities
# A/B testing setup
```

#### Custom Analytics
```typescript
// Analytics service setup
class AnalyticsService {
  static trackEvent(eventName: string, properties?: Record<string, any>) {
    if (__DEV__) return; // Skip in development
    
    // Send to analytics service
    Analytics.track(eventName, {
      ...properties,
      timestamp: Date.now(),
      version: Constants.expoConfig.version,
      platform: Platform.OS,
    });
  }

  static trackError(error: Error, context?: string) {
    this.trackEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  static trackUserAction(action: string, details?: Record<string, any>) {
    this.trackEvent('user_action', {
      action,
      ...details,
    });
  }
}
```

### 2. Performance Monitoring

#### Metrics Collection
```typescript
// Performance monitoring service
class PerformanceMonitor {
  static measureStartupTime() {
    const startTime = Date.now();
    
    // Measure until app is ready
    const measureReady = () => {
      const loadTime = Date.now() - startTime;
      AnalyticsService.trackEvent('app_startup', {
        load_time: loadTime,
        platform: Platform.OS,
      });
    };

    return measureReady;
  }

  static measureScreenLoad(screenName: string) {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      AnalyticsService.trackEvent('screen_load', {
        screen_name: screenName,
        load_time: Math.round(loadTime),
      });
    };
  }
}
```

---

## Troubleshooting

### Common Build Issues

#### iOS Build Failures
```bash
# 1. Certificate issues
eas credentials
# Check certificate validity
# Revoke and recreate if needed

# 2. Provisioning profile issues
# Update team ID in app.json
# Check bundle identifier uniqueness
# Verify device registration

# 3. Build timeout
# Increase resource class in eas.json
# Check build logs for specific errors
# Use development build for debugging
```

#### Android Build Failures
```bash
# 1. Keystore issues
# Verify keystore file exists
# Check keystore passwords
# Update signing configuration

# 2. Gradle errors
# Clean build directory
# Update Android SDK
# Check dependency conflicts

# 3. Play Console rejection
# Review policy violations
# Update app content
# Resubmit after fixes
```

#### Web Build Issues
```bash
# 1. Bundle size issues
# Analyze bundle with webpack-bundle-analyzer
# Optimize imports and dependencies
# Use code splitting

# 2. Routing issues
# Configure server-side routing
# Update redirect rules
# Test 404 handling

# 3. Asset loading issues
# Check asset paths
# Configure CDN if needed
# Verify CORS settings
```

### Deployment Automation Issues

#### CI/CD Failures
```bash
# 1. Authentication issues
# Update GitHub secrets
# Refresh Expo tokens
# Check API key validity

# 2. Build environment issues
# Update Node.js version
# Clear dependency cache
# Check disk space

# 3. Test failures
# Review test logs
# Update test expectations
# Check for flaky tests
```

---

## Best Practices

### 1. Release Strategy
- Use semantic versioning
- Maintain release notes
- Test on real devices
- Monitor post-release metrics

### 2. Security
- Never commit secrets
- Use environment variables
- Regularly update dependencies
- Follow secure coding practices

### 3. Performance
- Monitor bundle sizes
- Optimize images and assets
- Use lazy loading
- Test on low-end devices

### 4. User Experience
- Test offline functionality
- Verify accessibility
- Check multi-language support
- Validate responsive design

---

## Support Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/console/about/policies/)

### Tools and Services
- [Expo Dashboard](https://expo.dev/)
- [EAS Build](https://expo.dev/builds)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native+expo)

---

*Last Updated: November 2025*  
*Version: 1.0*  
*Maintained by: Huda Al-Quran Development Team*
