# Building the Quran App for iOS (Remote Build via EAS)

This guide provides instructions on how to build the iOS application remotely using Expo Application Services (EAS) and upload it to TestFlight. This method is required for Windows users as iOS apps cannot be built locally on Windows.

## Prerequisites

Before starting, ensure you have the following:

1.  **Expo Account:** Sign up at [expo.dev](https://expo.dev/signup).
2.  **Apple Developer Account:** Enrolled in the Apple Developer Program (Required for TestFlight).
3.  **EAS CLI:** Installed globally via npm:
    ```powershell
    npm install -g eas-cli
    ```

## 1. Setup and Configuration

Execute these commands from the project root directory (`D:\QuranApp`).

### Login to EAS

Login with your Expo account credentials:

```powershell
eas login
```

### Configure Project

If this is the first time building, configure the project. This will update `eas.json`.

```powershell
eas build:configure
```

- Select `iOS` when prompted.

## 2. Building the iOS App

To start a remote build for iOS:

```powershell
eas build --platform ios --auto-submit
```

- **--auto-submit:** This flag automatically starts the submission process to TestFlight after a successful build.
- **Credentials:** EAS will ask to log in to your Apple ID to handle certificates and provisioning profiles automatically. Follow the interactive prompts.

### Build Only (Without Submission)

If you only want to build the IPA file without submitting:

```powershell
eas build --platform ios
```

## 3. Submitting to TestFlight (Manual)

If you built the app without `--auto-submit`, you can upload the binary to App Store Connect later:

```powershell
eas submit --platform ios
```

- Select the build ID from the list presented.
- The CLI will upload the binary to TestFlight.

## 4. Testing

1.  **Wait for Processing:** After submission, Apple processes the build (can take 10-20 minutes).
2.  **TestFlight App:** Install the TestFlight app on your iOS device.
3.  **Invite Testers:** Go to [App Store Connect](https://appstoreconnect.apple.com/), select your app, go to TestFlight, and add internal testers.
4.  **Install:** Testers will receive an email to install the app via TestFlight.

## Troubleshooting

- **Apple ID Authentication:** If EAS fails to log in to Apple, ensure 2FA is handled correctly or generate an App Specific Password if prompted.
- **Bundle Identifier:** Ensure the `bundleIdentifier` in `app.json` (under `ios`) matches your Apple Developer account settings.
- **Free Apple Account:** You cannot build for TestFlight with a free Apple Developer account; a paid membership is required. For release builds, you generally need a paid account.

## Notes for Automation/LLMs

- **Working Directory:** Always run `eas` commands from `D:\QuranApp`.
- **Interactive Prompts:** The `eas build` command is highly interactive (asking for credentials, certificate generation). It is best run by a human user, not an automated script, unless `eas.json` and credentials are fully pre-configured.
