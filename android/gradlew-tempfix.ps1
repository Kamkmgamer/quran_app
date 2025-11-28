# Wrapper script to set temp directory for SQLite JDBC before running Gradle
# This fixes permission issues on Windows

$tempDir = "$env:USERPROFILE\.gradle\tmp"
$env:TMP = $tempDir
$env:TEMP = $tempDir
$env:TMPDIR = $tempDir

# Create the directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Set GRADLE_OPTS to pass java.io.tmpdir to all JVM processes including workers
$env:GRADLE_OPTS = "-Djava.io.tmpdir=$tempDir"

# Run gradlew with all arguments passed to this script
& .\gradlew.bat $args

