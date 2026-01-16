# Building the Quran App for Android (AAB for Play Store)

This guide provides instructions on how to build the Android application bundle (.aab) using Expo Application Services (EAS) for publishing to the Google Play Store.

## Prerequisites

Before starting, ensure you have the following:

1.  **Expo Account:** Sign up at [expo.dev](https://expo.dev/signup).
2.  **Google Play Developer Account:** Required to publish and manage your app on the Play Store.
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

### Configure Project (First time only)

If you haven't configured EAS yet:

```powershell
eas build:configure
```

- Select `Android` when prompted.

## 2. Building the Android App Bundle (AAB)

To build the project for production (Play Store):

```powershell
eas build --platform android --profile production
```

### What happens during the build?

1.  **Code Signing:** EAS will ask if you want it to handle your Android Keystore.
    - If it's your first time, let EAS generate and manage it for you (recommended).
    - If you have an existing keystore, you'll need to provide it.
2.  **Remote Build:** The build happens on Expo's servers. You don't need Android Studio installed locally for this.
3.  **Result:** Once finished, EAS will provide a link to download the `.aab` file.

## 3. Submitting to Google Play Store

Once the build is complete, you can download the `.aab` file and manually upload it to the [Google Play Console](https://play.google.com/console), or use EAS to submit it:

```powershell
eas submit --platform android --profile production
```

- You will need a Google Service Account Key (`.json`) for automated submission.
- Follow the prompts to select the build you just created.

## Troubleshooting

- **Keystore Issues:** If you lose your keystore, you cannot update your app on the Play Store. EAS safely stores it for you in their cloud.
- **Package Name:** Ensure the `package` in `app.json` (under `android`) is unique and matches what you set in the Play Console (currently: `com.alquran.quran`).
- **Version Numbers:** Each build for the Play Store must have a unique `versionCode`. The `eas.json` is configured with `"autoIncrement": true` to handle this automatically.

## Notes for Automation/LLMs

- **Working Directory:** Always run `eas` commands from `D:\QuranApp`.
- **Interactive Prompts:** The build process involves prompts for credentials and keystore management. It is best run by the developer.

## 4. Build Locally via Android Studio (Alternative)

If EAS Cloud builds fail (e.g., due to large files or timeouts), you can build locally on your machine.

### Prerequisites

- **Android Studio** installed.
- **Android SDK** and **Java** (bundled with Android Studio).

### Steps

1.  **Generate Native Project**:
    Open a terminal in `D:\QuranApp` and run:

    ```powershell
    npx expo prebuild --platform android
    ```

    This creates the `android` folder.

2.  **Open in Android Studio**:
    - Launch Android Studio.
    - Select **Open** (or "Open an existing Android Studio project").
    - Navigate to and select `D:\QuranApp\android`.
    - Wait for Gradle Sync to finish (it might take a few minutes to download dependencies).

3.  **Generate Signed Bundle**:
    - Go to **Build** > **Generate Signed Bundle / APK**.
    - Select **Android App Bundle**.
    - Click **Next**.

4.  **Keystore Configuration**:
    - **Key store path**: Click "Create new" if you don't have one, or "Choose existing".
    - _Important_: Keep this file safe! You need it to update the app later.
    - Fill in the passwords and alias (e.g., `key0`).
    - Click **Next**.

5.  **Build**:
    - Select **release** build variant.
    - Click **Create**.

6.  **Locate File**:
    - Once done, Android Studio will show a notification `locate`.
    - The file is usually in `android\app\release\app-release.aab`.
