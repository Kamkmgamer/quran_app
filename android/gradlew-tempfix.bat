@echo off
REM Wrapper script to set temp directory for SQLite JDBC before running Gradle
REM This fixes permission issues on Windows

set TEMP_DIR=%USERPROFILE%\.gradle\tmp
set TMP=%TEMP_DIR%
set TEMP=%TEMP_DIR%
set TMPDIR=%TEMP_DIR%

REM Create the directory if it doesn't exist
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Set GRADLE_OPTS to pass java.io.tmpdir to all JVM processes including workers
set GRADLE_OPTS=-Djava.io.tmpdir=%TEMP_DIR%

REM Run gradlew with all arguments passed to this script
call gradlew.bat %*

