# LLM Build Guide for Quran App on Windows

This guide is intended for Large Language Models (LLMs) to build the release APK for the Quran App on this specific Windows machine. This environment has specific quirks that require a precise sequence of commands.

**Execute the following commands in sequence from the project root directory (`D:\QuranApp`):**

1.  **Create the temporary build directory:**
    This is a critical step. The Gradle build will fail with a `java.io.tmpdir` error if this directory does not exist.
    ```powershell
    mkdir D:\QuranApp\android\build\tmp
    ```

2.  **Build the release APK:**
    This command builds the release APK. The `-p` flag specifies the project directory for the Gradle build.
    ```powershell
    .\gradlew assembleRelease -p D:\QuranApp\android
    ```

**Expected Outcome:**

A successful build will result in the creation of the release APK file at the following location:

`D:\QuranApp\android\app\build\outputs\apk\release\app-release.apk`

---

## How LLMs Typically Get This Wrong

LLMs often fail this build for the following reasons. **Avoid these common pitfalls:**

*   **Incorrect Working Directory:**
    *   **Mistake:** Running `.\gradlew assembleRelease` from the `D:\QuranApp\android` directory.
    *   **Correction:** Run all commands from the project root directory, `D:\QuranApp`.

*   **Skipping the `mkdir` Command:**
    *   **Mistake:** Assuming the temporary directory exists and proceeding directly to the build command.
    *   **Correction:** Always run the `mkdir` command first. It is a required workaround for this environment.

*   **Using Incorrect Path Separators:**
    *   **Mistake:** Using forward slashes (`/`) in paths instead of backslashes (`\`).
    *   **Correction:** This is a Windows machine. All paths must use backslashes.

*   **Not Using Absolute Paths:**
    *   **Mistake:** Using relative paths (e.g., `android\build\tmp`).
    *   **Correction:** Use the full, absolute paths provided in the commands.

*   **Reacting to Warnings:**
    *   **Mistake:** Attempting to "fix" the numerous warnings about deprecated features or inconsistent SDK locations that appear during the build process.
    *   **Correction:** These warnings are not fatal to the build. Ignore them and let the build process complete.

**Revised Notes for the LLM:**

*   **Strictly follow the commands in the order provided.**
*   **Execute all commands from the `D:\QuranApp` directory.**
*   **Do not attempt to "fix" warnings.**
*   **The build process is lengthy; allow it to complete without interruption.**

