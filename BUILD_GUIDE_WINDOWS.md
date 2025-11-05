# Building the Quran App Release APK on Windows

This guide provides detailed instructions on how to build the release APK for the Quran App on a Windows machine.

## Prerequisites

Before you begin, ensure you have the following software installed and configured:

*   **Node.js and npm:** Download and install from [nodejs.org](https://nodejs.org/).
*   **Java Development Kit (JDK):** The app is compatible with JDK 11. You can download it from [Oracle](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) or use a distribution like [AdoptOpenJDK](https://adoptopenjdk.net/).
*   **Android Studio:** Download and install from the [Android Developer website](https://developer.android.com/studio). This will also install the Android SDK.
*   **Git:** Download and install from [git-scm.com](https://git-scm.com/).

## Environment Variables

Properly configured environment variables are crucial for the build process.

1.  **ANDROID_HOME:**
    *   Open the "System Properties" window (search for "environment variables" in the Start Menu).
    *   Click on "Environment Variables...".
    *   Under "System variables", click "New...".
    *   Set the "Variable name" to `ANDROID_HOME`.
    *   Set the "Variable value" to the path of your Android SDK. By default, this is `C:\Users\<Your-Username>\AppData\Local\Android\Sdk`.
2.  **Path:**
    *   In the same "Environment Variables" window, find the `Path` variable under "System variables" and click "Edit...".
    *   Add a new entry and paste the path to your Android SDK's `platform-tools` directory. This is typically `%ANDROID_HOME%\platform-tools`.

## Project Setup

1.  **Clone the Repository (Optional):**
    If you haven't already, clone the project repository to your local machine:
    ```bash
    git clone <repository-url>
    cd QuranApp
    ```

2.  **Install Dependencies:**
    Open a terminal or command prompt in the project's root directory and run the following command to install the necessary Node.js dependencies:
    ```bash
    npm install
    ```

## Building the Release APK

1.  **Navigate to the `android` Directory:**
    All build commands must be run from the `android` directory.
    ```bash
    cd android
    ```

2.  **Create a Temporary Directory (Workaround):**
    A known issue can cause the build to fail if a specific temporary directory doesn't exist. Create it manually with this command:
    ```bash
    mkdir build\tmp
    ```

3.  **Run the Build Command:**
    Now, you can start the build process by running the following command. This will assemble the release APK.
    ```bash
    .\gradlew assembleRelease
    ```
    The build process can take a significant amount of time, especially on the first run.

## Locating the APK

Once the build is successful, you will find the release APK file in the following directory:

`D:\QuranApp\android\app\build\outputs\apk\release\app-release.apk`

## Troubleshooting

*   **`java.io.tmpdir` Error:**
    If you encounter an error similar to `java.io.IOException: java.io.tmpdir is set to a directory that doesn't exist`, it means the temporary directory for Gradle is missing. The workaround is to create it manually as described in the "Building the Release APK" section.

*   **Build Fails with Other Errors:**
    *   Ensure your Android SDK is up to date.
    *   Verify that your environment variables are set correctly.
    *   Clean the Gradle build cache by running `.\gradlew clean` in the `android` directory and then try building again.
