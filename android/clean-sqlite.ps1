# Script to clean SQLite JDBC files from C:\WINDOWS
# This is needed because SQLite JDBC tries to write to C:\WINDOWS by default on Windows

Write-Host "Cleaning SQLite JDBC files from C:\WINDOWS..."

# Try to remove SQLite files (may require admin, but we try anyway)
$files = Get-ChildItem "C:\WINDOWS\sqlite-*.dll*" -ErrorAction SilentlyContinue
if ($files) {
    Write-Host "Found $($files.Count) SQLite files to clean"
    foreach ($file in $files) {
        try {
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
            Write-Host "Removed: $($file.Name)"
        } catch {
            Write-Host "Could not remove $($file.Name) - may require admin privileges"
        }
    }
} else {
    Write-Host "No SQLite files found in C:\WINDOWS"
}

Write-Host "Done."

