# Environment Configuration Guide

This guide covers the comprehensive environment configuration for the Huda Al-Quran application across different deployment environments and platforms.

## Table of Contents

1. [Overview](#overview)
2. [Environment Types](#environment-types)
3. [Configuration Files](#configuration-files)
4. [Environment Variables](#environment-variables)
5. [Platform-Specific Configuration](#platform-specific-configuration)
6. [Security Configuration](#security-configuration)
7. [Development Environment Setup](#development-environment-setup)
8. [Testing Environment Setup](#testing-environment-setup)
9. [Staging Environment Setup](#staging-environment-setup)
10. [Production Environment Setup](#production-environment-setup)
11. [Environment Management](#environment-management)

---

## Overview

### Environment Strategy

The Huda Al-Quran application uses a multi-environment strategy to ensure proper separation between development, testing, and production configurations:

- **Development**: Local development with hot reload and debugging
- **Testing**: Automated testing environment with mocked services
- **Staging**: Pre-production environment with real services
- **Production**: Live environment with optimized configurations

### Configuration Management

Configuration is managed through:
- Environment-specific files (`.env.*`)
- Platform-specific configuration (`app.json`, `eas.json`)
- Runtime configuration loading
- Secure secret management

---

## Environment Types

### 1. Development Environment

**Purpose**: Local development and debugging
**Characteristics**:
- Hot reload enabled
- Debug mode active
- Mock data for offline development
- Verbose logging
- Development API endpoints

### 2. Testing Environment

**Purpose**: Automated testing and CI/CD
**Characteristics**:
- Headless operation
- Mocked external services
- Fast execution optimized
- Test data fixtures
- No user data persistence

### 3. Staging Environment

**Characteristics**:
- Production-like setup
- Real API integration
- Test user accounts
- Performance monitoring
- Feature flag testing

### 4. Production Environment

**Purpose**: Live deployment for end users
**Characteristics**:
- Optimized performance
- Minimal logging
- Real API endpoints
- User data persistence
- Error monitoring enabled

---

## Configuration Files

### 1. Environment Files

#### `.env.development`
```env
# Development Configuration
NODE_ENV=development
EXPO_PUBLIC_ENV=development

# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_AUDIO_BASE_URL=http://localhost:3001/audio
EXPO_PUBLIC_LOCATION_API_URL=http://localhost:3002/location

# Development Settings
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_MOCK_APIS=true

# Feature Flags
EXPO_PUBLIC_FEATURE_ANALYTICS=false
EXPO_PUBLIC_FEATURE_CRASH_REPORTING=false
EXPO_PUBLIC_FEATURE_PERFORMANCE_MONITORING=false

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=dev-encryption-key-12345
EXPO_PUBLIC_API_KEY=dev-api-key-12345

# Cache Settings
EXPO_PUBLIC_CACHE_TTL=300000
EXPO_PUBLIC_MAX_CACHE_SIZE=50

# Audio Settings
EXPO_PUBLIC_AUDIO_QUALITY=medium
EXPO_PUBLIC_PRELOAD_AUDIO=true

# Development Tools
EXPO_PUBLIC_FLIPPER_ENABLED=true
EXPO_PUBLIC_REMOTE_DEBUGGING=true
```

#### `.env.testing`
```env
# Testing Configuration
NODE_ENV=test
EXPO_PUBLIC_ENV=testing

# API Configuration (Mocked)
EXPO_PUBLIC_API_BASE_URL=http://mock-api:3000
EXPO_PUBLIC_AUDIO_BASE_URL=http://mock-audio:3001
EXPO_PUBLIC_LOCATION_API_URL=http://mock-location:3002

# Testing Settings
EXPO_PUBLIC_DEV_MODE=false
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_LOG_LEVEL=error
EXPO_PUBLIC_MOCK_APIS=true

# Feature Flags
EXPO_PUBLIC_FEATURE_ANALYTICS=false
EXPO_PUBLIC_FEATURE_CRASH_REPORTING=false
EXPO_PUBLIC_FEATURE_PERFORMANCE_MONITORING=true

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=test-encryption-key-67890
EXPO_PUBLIC_API_KEY=test-api-key-67890

# Cache Settings
EXPO_PUBLIC_CACHE_TTL=60000
EXPO_PUBLIC_MAX_CACHE_SIZE=10

# Audio Settings
EXPO_PUBLIC_AUDIO_QUALITY=low
EXPO_PUBLIC_PRELOAD_AUDIO=false

# Testing Configuration
EXPO_PUBLIC_TEST_MODE=true
EXPO_PUBLIC_HEADLESS_MODE=true
EXPO_PUBLIC_FAST_RENDERS=true
```

#### `.env.staging`
```env
# Staging Configuration
NODE_ENV=staging
EXPO_PUBLIC_ENV=staging

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://staging-api.huda-quran.com/v1
EXPO_PUBLIC_AUDIO_BASE_URL=https://staging-audio.huda-quran.com
EXPO_PUBLIC_LOCATION_API_URL=https://staging-location.huda-quran.com

# Staging Settings
EXPO_PUBLIC_DEV_MODE=false
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=info
EXPO_PUBLIC_MOCK_APIS=false

# Feature Flags
EXPO_PUBLIC_FEATURE_ANALYTICS=true
EXPO_PUBLIC_FEATURE_CRASH_REPORTING=true
EXPO_PUBLIC_FEATURE_PERFORMANCE_MONITORING=true

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=staging-encryption-key-abcdef
EXPO_PUBLIC_API_KEY=staging-api-key-abcdef

# Cache Settings
EXPO_PUBLIC_CACHE_TTL=1800000
EXPO_PUBLIC_MAX_CACHE_SIZE=100

# Audio Settings
EXPO_PUBLIC_AUDIO_QUALITY=high
EXPO_PUBLIC_PRELOAD_AUDIO=true

# Monitoring
EXPO_PUBLIC_SENTRY_DSN=https://staging-sentry-dsn@sentry.io/123456
EXPO_PUBLIC_ANALYTICS_ID=staging-analytics-id
```

#### `.env.production`
```env
# Production Configuration
NODE_ENV=production
EXPO_PUBLIC_ENV=production

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.huda-quran.com/v1
EXPO_PUBLIC_AUDIO_BASE_URL=https://audio.huda-quran.com
EXPO_PUBLIC_LOCATION_API_URL=https://nominatim.openstreetmap.org

# Production Settings
EXPO_PUBLIC_DEV_MODE=false
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_LOG_LEVEL=error
EXPO_PUBLIC_MOCK_APIS=false

# Feature Flags
EXPO_PUBLIC_FEATURE_ANALYTICS=true
EXPO_PUBLIC_FEATURE_CRASH_REPORTING=true
EXPO_PUBLIC_FEATURE_PERFORMANCE_MONITORING=true

# Security
EXPO_PUBLIC_ENCRYPTION_KEY=production-encryption-key-ghijkl
EXPO_PUBLIC_API_KEY=production-api-key-ghijkl

# Cache Settings
EXPO_PUBLIC_CACHE_TTL=3600000
EXPO_PUBLIC_MAX_CACHE_SIZE=200

# Audio Settings
EXPO_PUBLIC_AUDIO_QUALITY=high
EXPO_PUBLIC_PRELOAD_AUDIO=true

# Monitoring
EXPO_PUBLIC_SENTRY_DSN=https://production-sentry-dsn@sentry.io/789012
EXPO_PUBLIC_ANALYTICS_ID=production-analytics-id

# Performance
EXPO_PUBLIC_BUNDLE_OPTIMIZATION=true
EXPO_PUBLIC_IMAGE_OPTIMIZATION=true
EXPO_PUBLIC_CODE_SPLITTING=true
```

### 2. Platform Configuration

#### `app.json` (Base Configuration)
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
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Location access is used for prayer time calculations and Qibla direction."
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
        "ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-font",
      "expo-location",
      "expo-av",
      "expo-secure-store"
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
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

#### `eas.json` (Build Configuration)
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "apk",
        "resourceClass": "medium"
      }
    },
    "testing": {
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "apk",
        "resourceClass": "medium"
      }
    },
    "staging": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release",
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "aab",
        "resourceClass": "medium"
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
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "deploy@huda-quran.com",
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

---

## Environment Variables

### 1. Variable Categories

#### API Configuration
```typescript
interface APIConfig {
  baseUrl: string;
  audioBaseUrl: string;
  locationApiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}
```

#### Feature Flags
```typescript
interface FeatureFlags {
  analytics: boolean;
  crashReporting: boolean;
  performanceMonitoring: boolean;
  remoteConfig: boolean;
  betaFeatures: boolean;
}
```

#### Security Configuration
```typescript
interface SecurityConfig {
  encryptionKey: string;
  apiPublicKey: string;
  certificatePinning: boolean;
  secureStorage: boolean;
  tokenRefreshInterval: number;
}
```

#### Performance Configuration
```typescript
interface PerformanceConfig {
  cacheTTL: number;
  maxCacheSize: number;
  preloadAudio: boolean;
  imageOptimization: boolean;
  bundleOptimization: boolean;
}
```

### 2. Configuration Service

#### Environment Configuration Loader
```typescript
// config/EnvironmentConfig.ts
class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): EnvironmentConfig {
    if (!this.instance) {
      this.instance = new EnvironmentConfig();
    }
    return this.instance;
  }

  private loadConfig(): AppConfig {
    const environment = process.env.EXPO_PUBLIC_ENV || 'development';
    
    const baseConfig = {
      environment,
      isDevelopment: environment === 'development',
      isTesting: environment === 'testing',
      isStaging: environment === 'staging',
      isProduction: environment === 'production',
    };

    const apiConfig = this.loadAPIConfig();
    const featureFlags = this.loadFeatureFlags();
    const securityConfig = this.loadSecurityConfig();
    const performanceConfig = this.loadPerformanceConfig();

    return {
      ...baseConfig,
      api: apiConfig,
      features: featureFlags,
      security: securityConfig,
      performance: performanceConfig,
    };
  }

  private loadAPIConfig(): APIConfig {
    return {
      baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
      audioBaseUrl: process.env.EXPO_PUBLIC_AUDIO_BASE_URL || '',
      locationApiUrl: process.env.EXPO_PUBLIC_LOCATION_API_URL || '',
      apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
      timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
      retryAttempts: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3'),
    };
  }

  private loadFeatureFlags(): FeatureFlags {
    return {
      analytics: process.env.EXPO_PUBLIC_FEATURE_ANALYTICS === 'true',
      crashReporting: process.env.EXPO_PUBLIC_FEATURE_CRASH_REPORTING === 'true',
      performanceMonitoring: process.env.EXPO_PUBLIC_FEATURE_PERFORMANCE_MONITORING === 'true',
      remoteConfig: process.env.EXPO_PUBLIC_FEATURE_REMOTE_CONFIG === 'true',
      betaFeatures: process.env.EXPO_PUBLIC_FEATURE_BETA_FEATURES === 'true',
    };
  }

  private loadSecurityConfig(): SecurityConfig {
    return {
      encryptionKey: process.env.EXPO_PUBLIC_ENCRYPTION_KEY || '',
      apiPublicKey: process.env.EXPO_PUBLIC_API_PUBLIC_KEY || '',
      certificatePinning: process.env.EXPO_PUBLIC_CERTIFICATE_PINNING === 'true',
      secureStorage: process.env.EXPO_PUBLIC_SECURE_STORAGE === 'true',
      tokenRefreshInterval: parseInt(process.env.EXPO_PUBLIC_TOKEN_REFRESH_INTERVAL || '3600'),
    };
  }

  private loadPerformanceConfig(): PerformanceConfig {
    return {
      cacheTTL: parseInt(process.env.EXPO_PUBLIC_CACHE_TTL || '300000'),
      maxCacheSize: parseInt(process.env.EXPO_PUBLIC_MAX_CACHE_SIZE || '50'),
      preloadAudio: process.env.EXPO_PUBLIC_PRELOAD_AUDIO === 'true',
      imageOptimization: process.env.EXPO_PUBLIC_IMAGE_OPTIMIZATION === 'true',
      bundleOptimization: process.env.EXPO_PUBLIC_BUNDLE_OPTIMIZATION === 'true',
    };
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.features[feature];
  }
}

// Type definitions
interface AppConfig {
  environment: string;
  isDevelopment: boolean;
  isTesting: boolean;
  isStaging: boolean;
  isProduction: boolean;
  api: APIConfig;
  features: FeatureFlags;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

export default EnvironmentConfig;
```

#### Configuration Hook
```typescript
// hooks/useEnvironmentConfig.ts
import { useContext, createContext, ReactNode } from 'react';
import EnvironmentConfig from '../config/EnvironmentConfig';

const ConfigContext = createContext<EnvironmentConfig | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const config = EnvironmentConfig.getInstance();

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useEnvironmentConfig = () => {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error('useEnvironmentConfig must be used within ConfigProvider');
  }
  return config;
};

export const useFeatureFlag = (feature: keyof FeatureFlags) => {
  const config = useEnvironmentConfig();
  return config.isFeatureEnabled(feature);
};
```

---

## Platform-Specific Configuration

### 1. iOS Configuration

#### iOS-Specific Settings
```json
// app.json ios section
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.huda.quran",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs location access to calculate accurate prayer times.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Location access is used for prayer time calculations and Qibla direction.",
        "UIBackgroundModes": ["audio"],
        "UIStatusBarStyle": "UIStatusBarStyleLightContent",
        "UIViewControllerBasedStatusBarAppearance": false,
        "ITSAppUsesNonExemptEncryption": false,
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false,
          "NSExceptionDomains": {
            "api.huda-quran.com": {
              "NSExceptionRequiresForwardSecrecy": false,
              "NSExceptionMinimumTLSVersion": "TLSv1.2"
            },
            "everyayah.com": {
              "NSExceptionAllowsInsecureHTTPLoads": true,
              "NSExceptionMinimumTLSVersion": "TLSv1.0"
            }
          }
        }
      },
      "associatedDomains": ["applinks:huda-quran.com"],
      "capabilities": [
        "com.apple.developer.networking.wifi-info"
      ]
    }
  }
}
```

#### iOS Build Configuration
```json
// eas.json ios build profiles
{
  "build": {
    "development": {
      "ios": {
        "simulator": true,
        "resourceClass": "m1-medium"
      }
    },
    "staging": {
      "ios": {
        "buildConfiguration": "Release",
        "resourceClass": "m1-medium",
        "enterpriseProvisioning": "universal"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "resourceClass": "m1-medium",
        "autoIncrement": true
      }
    }
  }
}
```

### 2. Android Configuration

#### Android-Specific Settings
```json
// app.json android section
{
  "expo": {
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
        "READ_EXTERNAL_STORAGE",
        "WAKE_LOCK",
        "FOREGROUND_SERVICE"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "quran"
          },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ],
      "config": {
        "googleMaps": {
          "apiKey": "your-google-maps-api-key"
        }
      }
    }
  }
}
```

#### Android Build Configuration
```json
// eas.json android build profiles
{
  "build": {
    "development": {
      "android": {
        "buildType": "apk",
        "resourceClass": "medium"
      }
    },
    "staging": {
      "android": {
        "buildType": "aab",
        "resourceClass": "medium",
        "autoIncrement": true
      }
    },
    "production": {
      "android": {
        "buildType": "aab",
        "resourceClass": "medium",
        "autoIncrement": true
      }
    }
  }
}
```

### 3. Web Configuration

#### Web-Specific Settings
```json
// app.json web section
{
  "expo": {
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro",
      "output": "static",
      "build": {
        "env": {
          "NODE_ENV": "production"
        }
      },
      "meta": {
        "viewport": "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      }
    }
  }
}
```

#### Web Manifest
```json
// public/manifest.json
{
  "name": "Huda Al-Quran",
  "short_name": "Quran",
  "description": "Digital Quran with audio recitation and prayer times",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a237e",
  "theme_color": "#1a237e",
  "orientation": "portrait",
  "scope": "/",
  "lang": "en",
  "dir": "rtl",
  "icons": [
    {
      "src": "/assets/images/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/assets/images/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/assets/images/screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

---

## Security Configuration

### 1. Environment Variable Security

#### Secure Variable Management
```typescript
// config/SecureConfig.ts
class SecureConfig {
  private static sensitiveKeys = [
    'EXPO_PUBLIC_ENCRYPTION_KEY',
    'EXPO_PUBLIC_API_KEY',
    'EXPO_PUBLIC_SENTRY_DSN',
    'EXPO_PUBLIC_ANALYTICS_ID',
  ];

  static validateEnvironment(): void {
    const missingVars = this.sensitiveKeys.filter(key => !process.env[key]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  static maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    
    for (const key in masked) {
      if (this.sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }

    return masked;
  }

  static getSecureValue(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing secure environment variable: ${key}`);
    }
    return value;
  }
}
```

#### Certificate Pinning Configuration
```typescript
// config/CertificatePinning.ts
interface CertificatePin {
  hostname: string;
  certificateHash: string;
  backupCertificateHash?: string;
}

class CertificatePinning {
  private static certificates: CertificatePin[] = [
    {
      hostname: 'api.huda-quran.com',
      certificateHash: 'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      backupCertificateHash: 'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
    },
    {
      hostname: 'everyayah.com',
      certificateHash: 'sha256/CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=',
    },
  ];

  static getCertificateForHost(hostname: string): CertificatePin | null {
    return this.certificates.find(cert => cert.hostname === hostname) || null;
  }

  static validateCertificate(hostname: string, certificateHash: string): boolean {
    const cert = this.getCertificateForHost(hostname);
    if (!cert) return false;

    return cert.certificateHash === certificateHash || 
           cert.backupCertificateHash === certificateHash;
  }
}
```

### 2. API Security Configuration

#### Request Signing
```typescript
// services/SecureAPIService.ts
import CryptoJS from 'crypto-js';

class SecureAPIService {
  private static getSignature(url: string, method: string, timestamp: number): string {
    const payload = `${method.toUpperCase()}${url}${timestamp}`;
    const secretKey = EnvironmentConfig.getInstance().get('security').encryptionKey;
    
    return CryptoJS.HmacSHA256(payload, secretKey).toString();
  }

  static async makeSecureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const timestamp = Date.now();
    const signature = this.getSignature(url, options.method || 'GET', timestamp);
    
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
        'X-API-Key': EnvironmentConfig.getInstance().get('api').apiKey,
        'Content-Type': 'application/json',
      },
    };

    return fetch(url, secureOptions);
  }
}
```

---

## Development Environment Setup

### 1. Local Development Configuration

#### Development Scripts
```json
// package.json scripts
{
  "scripts": {
    "start": "expo start",
    "start:dev": "EXPO_PUBLIC_ENV=development expo start",
    "start:test": "EXPO_PUBLIC_ENV=testing expo start",
    "start:staging": "EXPO_PUBLIC_ENV=staging expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:dev": "eas build --profile development",
    "build:test": "eas build --profile testing",
    "build:staging": "eas build --profile staging",
    "build:prod": "eas build --profile production"
  }
}
```

#### Development Docker Setup
```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose Expo port
EXPOSE 8081

# Start development server
CMD ["npm", "run", "start:dev"]
```

#### Docker Compose for Development
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  quran-app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8081:8081"
    environment:
      - EXPO_PUBLIC_ENV=development
      - EXPO_PUBLIC_API_BASE_URL=http://mock-api:3000
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mock-api
      - mock-audio
      - mock-location

  mock-api:
    image: mockserver/mockserver
    ports:
      - "3000:1080"
    volumes:
      - ./mocks/api:/config

  mock-audio:
    image: nginx:alpine
    ports:
      - "3001:80"
    volumes:
      - ./mocks/audio:/usr/share/nginx/html

  mock-location:
    image: mockserver/mockserver
    ports:
      - "3002:1080"
    volumes:
      - ./mocks/location:/config
```

### 2. Development Tools Configuration

#### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/.DS_Store": true,
    "**/Thumbs.db": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.expo": true
  }
}
```

#### VS Code Launch Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Expo",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/expo",
      "args": ["start"],
      "cwd": "${workspaceFolder}",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "cwd": "${workspaceFolder}",
      "env": {
        "EXPO_PUBLIC_ENV": "testing"
      }
    }
  ]
}
```

---

## Testing Environment Setup

### 1. Unit Testing Configuration

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@react-navigation)',
  ],
  testEnvironment: 'node',
};
```

#### Test Setup
```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock expo modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  downloadAsync: jest.fn(),
}));

// Global test configuration
global.__DEV__ = true;

// Mock environment variables
process.env.EXPO_PUBLIC_ENV = 'testing';
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://mock-api:3000';
process.env.EXPO_PUBLIC_MOCK_APIS = 'true';
```

### 2. Integration Testing Configuration

#### Test Utilities
```typescript
// __tests__/utils/testUtils.tsx
import { render, RenderOptions } from '@testing-library/react-native';
import { ReactElement } from 'react';
import { ConfigProvider } from '../../hooks/useEnvironmentConfig';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
```

#### Mock Services
```typescript
// __tests__/mocks/mockServices.ts
export const mockAudioService = {
  loadAndPlayVerse: jest.fn(),
  togglePlayPause: jest.fn(),
  setPlaybackSpeed: jest.fn(),
  stop: jest.fn(),
};

export const mockPrayerTimesService = {
  getPrayerTimes: jest.fn(),
  getCalculationMethods: jest.fn(),
};

export const mockStorageService = {
  getPreferences: jest.fn(),
  savePreferences: jest.fn(),
  getLastPosition: jest.fn(),
  saveLastPosition: jest.fn(),
};
```

---

## Staging Environment Setup

### 1. Staging Configuration

#### Staging Build Script
```bash
#!/bin/bash
# scripts/build-staging.sh

set -e

echo "Building staging environment..."

# Load staging environment
export EXPO_PUBLIC_ENV=staging
source .env.staging

# Run tests
echo "Running tests..."
npm run test:ci

# Build for iOS
echo "Building iOS staging..."
eas build --platform ios --profile staging --non-interactive

# Build for Android
echo "Building Android staging..."
eas build --platform android --profile staging --non-interactive

# Build for web
echo "Building web staging..."
npx expo export --platform web

echo "Staging build completed successfully!"
```

#### Staging Deployment Script
```bash
#!/bin/bash
# scripts/deploy-staging.sh

set -e

echo "Deploying to staging environment..."

# Deploy to internal testing
echo "Deploying iOS to TestFlight..."
eas submit --platform ios --profile staging --track internal

echo "Deploying Android to internal testing..."
eas submit --platform android --profile staging --track internal

# Deploy web to staging server
echo "Deploying web to staging..."
npx expo export --platform web
rsync -av dist/ staging-server:/var/www/staging.huda-quran.com/

echo "Staging deployment completed!"
```

### 2. Staging Monitoring

#### Health Check Configuration
```typescript
// config/HealthCheck.ts
class HealthCheck {
  static async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Check API connectivity
      const apiStatus = await this.checkAPIHealth();
      
      // Check audio service
      const audioStatus = await this.checkAudioHealth();
      
      // Check location service
      const locationStatus = await this.checkLocationHealth();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        services: {
          api: apiStatus,
          audio: audioStatus,
          location: locationStatus,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static async checkAPIHealth(): Promise<ServiceHealth> {
    const config = EnvironmentConfig.getInstance().get('api');
    
    try {
      const response = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: 0, // Would measure actual response time
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private static async checkAudioHealth(): Promise<ServiceHealth> {
    // Check audio service availability
    return {
      status: 'healthy',
      responseTime: 0,
    };
  }

  private static async checkLocationHealth(): Promise<ServiceHealth> {
    // Check location service availability
    return {
      status: 'healthy',
      responseTime: 0,
    };
  }
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  services?: {
    api: ServiceHealth;
    audio: ServiceHealth;
    location: ServiceHealth;
  };
  error?: string;
  timestamp: string;
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}
```

---

## Production Environment Setup

### 1. Production Configuration

#### Production Build Script
```bash
#!/bin/bash
# scripts/build-production.sh

set -e

echo "Building production environment..."

# Load production environment
export EXPO_PUBLIC_ENV=production
source .env.production

# Validate environment
node scripts/validate-environment.js

# Run comprehensive tests
echo "Running comprehensive tests..."
npm run test:ci
npm run test:e2e
npm run test:performance

# Security audit
echo "Running security audit..."
npm audit --audit-level moderate

# Build for production
echo "Building iOS production..."
eas build --platform ios --profile production --non-interactive

echo "Building Android production..."
eas build --platform android --profile production --non-interactive

echo "Building web production..."
npx expo export --platform web --output-dir dist

echo "Production build completed successfully!"
```

#### Environment Validation
```javascript
// scripts/validate-environment.js
const EnvironmentConfig = require('../src/config/EnvironmentConfig');

function validateEnvironment() {
  const config = EnvironmentConfig.getInstance();
  
  // Validate required variables
  const requiredVars = [
    'EXPO_PUBLIC_API_BASE_URL',
    'EXPO_PUBLIC_ENCRYPTION_KEY',
    'EXPO_PUBLIC_API_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }

  // Validate URLs
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl.startsWith('https://')) {
    console.error('API base URL must use HTTPS in production');
    process.exit(1);
  }

  // Validate feature flags
  const requiredFeatures = ['analytics', 'crashReporting'];
  const disabledFeatures = requiredFeatures.filter(feature => 
    process.env[`EXPO_PUBLIC_FEATURE_${feature.toUpperCase()}`] !== 'true'
  );

  if (disabledFeatures.length > 0) {
    console.warn('Warning: Recommended features disabled:', disabledFeatures);
  }

  console.log('Environment validation passed');
}

validateEnvironment();
```

### 2. Production Monitoring

#### Error Tracking Configuration
```typescript
// config/ErrorTracking.ts
import * as Sentry from '@sentry/react-native';

class ErrorTracking {
  static initialize(): void {
    const config = EnvironmentConfig.getInstance();
    
    if (config.isFeatureEnabled('crashReporting')) {
      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        environment: config.get('environment'),
        enableAutoSessionTracking: true,
        tracesSampleRate: 0.1,
      });
    }
  }

  static captureError(error: Error, context?: any): void {
    if (EnvironmentConfig.getInstance().isFeatureEnabled('crashReporting')) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (EnvironmentConfig.getInstance().isFeatureEnabled('crashReporting')) {
      Sentry.captureMessage(message, level);
    }
  }
}
```

#### Performance Monitoring
```typescript
// config/PerformanceMonitoring.ts
import { Performance } from 'expo-performance';

class PerformanceMonitoring {
  static initialize(): void {
    if (EnvironmentConfig.getInstance().isFeatureEnabled('performanceMonitoring')) {
      this.setupPerformanceObservers();
    }
  }

  private static setupPerformanceObservers(): void {
    // Monitor app startup
    this.measureStartupTime();
    
    // Monitor screen transitions
    this.measureScreenTransitions();
    
    // Monitor API calls
    this.measureAPICalls();
  }

  static measureStartupTime(): void {
    const startTime = Date.now();
    
    // Measure until app is ready
    const measureReady = () => {
      const loadTime = Date.now() - startTime;
      
      // Send to analytics
      AnalyticsService.trackEvent('app_startup_performance', {
        load_time: loadTime,
        environment: EnvironmentConfig.getInstance().get('environment'),
      });

      // Alert if startup is slow
      if (loadTime > 3000) {
        ErrorTracking.captureMessage(`Slow app startup: ${loadTime}ms`, 'warning');
      }
    };

    return measureReady;
  }

  static measureScreenTransition(screenName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      
      AnalyticsService.trackEvent('screen_transition_performance', {
        screen_name: screenName,
        load_time: Math.round(loadTime),
      });
    };
  }
}
```

---

## Environment Management

### 1. Environment Switching

#### Environment Switch Script
```bash
#!/bin/bash
# scripts/switch-environment.sh

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./switch-environment.sh [development|testing|staging|production]"
  exit 1
fi

echo "Switching to $ENVIRONMENT environment..."

# Copy environment file
cp .env.$ENVIRONMENT .env.local

# Update app.json if needed
case $ENVIRONMENT in
  "production")
    node scripts/update-app-config.js --env=production
    ;;
  "staging")
    node scripts/update-app-config.js --env=staging
    ;;
  *)
    node scripts/update-app-config.js --env=development
    ;;
esac

echo "Environment switched to $ENVIRONMENT"
echo "Run 'npm start' to begin development"
```

#### App Config Updater
```javascript
// scripts/update-app-config.js
const fs = require('fs');
const path = require('path');

function updateAppConfig(env) {
  const configPath = path.join(__dirname, '../app.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Update app name for different environments
  switch (env) {
    case 'staging':
      config.expo.name = 'Huda Al-Quran (Staging)';
      config.expo.slug = 'huda-al-quran-staging';
      config.expo.ios.bundleIdentifier = 'com.huda.quran.staging';
      config.expo.android.package = 'com.huda.quran.staging';
      break;
    case 'production':
      config.expo.name = 'Huda Al-Quran';
      config.expo.slug = 'huda-al-quran';
      config.expo.ios.bundleIdentifier = 'com.huda.quran';
      config.expo.android.package = 'com.huda.quran';
      break;
    default:
      config.expo.name = 'Huda Al-Quran (Dev)';
      config.expo.slug = 'huda-al-quran-dev';
      config.expo.ios.bundleIdentifier = 'com.huda.quran.dev';
      config.expo.android.package = 'com.huda.quran.dev';
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Updated app configuration for ${env} environment`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1];

if (!env) {
  console.error('Environment not specified');
  process.exit(1);
}

updateAppConfig(env);
```

### 2. Environment Validation

#### Pre-Commit Hook
```bash
#!/bin/bash
# .husky/pre-commit

echo "Running pre-commit checks..."

# Check if environment file exists
if [ ! -f .env.local ]; then
  echo "Warning: .env.local not found. Run './scripts/switch-environment.sh development'"
fi

# Run linting
npm run lint

# Run tests
npm run test:ci

# Check for sensitive data in commits
if git diff --cached --name-only | xargs grep -l "EXPO_PUBLIC.*KEY\|EXPO_PUBLIC.*SECRET" 2>/dev/null; then
  echo "Error: Sensitive data detected in staged files"
  exit 1
fi

echo "Pre-commit checks passed"
```

### 3. Environment Documentation

#### Configuration Documentation Generator
```typescript
// scripts/generate-config-docs.ts
import EnvironmentConfig from '../src/config/EnvironmentConfig';
import fs from 'fs';

function generateConfigDocs() {
  const config = EnvironmentConfig.getInstance();
  const allConfig = config.getAll();
  
  let markdown = '# Environment Configuration Documentation\n\n';
  markdown += 'This document describes all available environment variables and their usage.\n\n';
  
  // API Configuration
  markdown += '## API Configuration\n\n';
  markdown += '| Variable | Description | Default | Required |\n';
  markdown += '|----------|-------------|---------|----------|\n';
  markdown += '| `EXPO_PUBLIC_API_BASE_URL` | Base URL for API endpoints | - | Yes |\n';
  markdown += '| `EXPO_PUBLIC_AUDIO_BASE_URL` | Base URL for audio files | - | Yes |\n';
  markdown += '| `EXPO_PUBLIC_API_KEY` | API authentication key | - | Yes |\n';
  markdown += '| `EXPO_PUBLIC_API_TIMEOUT` | API request timeout in ms | 10000 | No |\n';
  
  // Feature Flags
  markdown += '\n## Feature Flags\n\n';
  markdown += '| Variable | Description | Default |\n';
  markdown += '|----------|-------------|---------|\n';
  markdown += '| `EXPO_PUBLIC_FEATURE_ANALYTICS` | Enable analytics tracking | false |\n';
  markdown += '| `EXPO_PUBLIC_FEATURE_CRASH_REPORTING` | Enable crash reporting | false |\n';
  markdown += '| `EXPO_PUBLIC_FEATURE_PERFORMANCE_MONITORING` | Enable performance monitoring | false |\n';
  
  // Security
  markdown += '\n## Security Configuration\n\n';
  markdown += '| Variable | Description | Default | Required |\n';
  markdown += '|----------|-------------|---------|----------|\n';
  markdown += '| `EXPO_PUBLIC_ENCRYPTION_KEY` | Encryption key for secure storage | - | Yes |\n';
  markdown += '| `EXPO_PUBLIC_CERTIFICATE_PINNING` | Enable certificate pinning | false | No |\n';
  
  // Performance
  markdown += '\n## Performance Configuration\n\n';
  markdown += '| Variable | Description | Default |\n';
  markdown += '|----------|-------------|---------|\n';
  markdown += '| `EXPO_PUBLIC_CACHE_TTL` | Cache time-to-live in ms | 300000 |\n';
  markdown += '| `EXPO_PUBLIC_MAX_CACHE_SIZE` | Maximum cache size in MB | 50 |\n';
  markdown += '| `EXPO_PUBLIC_PRELOAD_AUDIO` | Enable audio preloading | true |\n';
  
  fs.writeFileSync('docs/ENVIRONMENT_VARIABLES.md', markdown);
  console.log('Environment configuration documentation generated');
}

generateConfigDocs();
```

---

## Best Practices

### 1. Environment Security
- Never commit `.env.local` or sensitive environment files
- Use different API keys for each environment
- Rotate secrets regularly
- Use EAS secrets for sensitive data

### 2. Configuration Management
- Use TypeScript for configuration type safety
- Validate environment variables at startup
- Provide sensible defaults for non-critical variables
- Document all environment variables

### 3. Deployment Strategy
- Use feature flags for gradual rollouts
- Test in staging before production deployment
- Monitor environment-specific metrics
- Have rollback procedures ready

### 4. Development Workflow
- Use environment switching scripts
- Maintain separate mock data for testing
- Use Docker for consistent development environments
- Automate environment validation

---

## Troubleshooting

### Common Issues

#### Environment Variable Loading
```bash
# Check if variables are loaded
echo $EXPO_PUBLIC_ENV

# Verify environment file exists
ls -la .env*

# Check for syntax errors in environment files
node -e "require('dotenv').config(); console.log(process.env.EXPO_PUBLIC_ENV)"
```

#### Build Configuration Issues
```bash
# Validate eas.json syntax
eas build:list --platform all

# Check app.json syntax
npx expo export --validate

# Verify environment-specific configuration
eas build:configure --profile staging
```

#### Certificate and Signing Issues
```bash
# Check iOS credentials
eas credentials:list --platform ios

# Check Android credentials
eas credentials:list --platform android

# Validate signing configuration
eas build:configure --profile production
```

---

*Last Updated: November 2025*  
*Version: 1.0*  
*Maintained by: Huda Al-Quran Development Team*
