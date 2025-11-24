# PowerShell script to fix CocoaPods CDN issues on Windows
# Note: This script is for reference. CocoaPods typically runs on macOS/Linux.
# If you're building on Windows, you'll need to use WSL or a macOS build environment.

Write-Host "🔧 CocoaPods CDN Fix Script" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: CocoaPods requires macOS or Linux." -ForegroundColor Yellow
Write-Host "If you're using EAS Build, the fix will be applied automatically via eas-hooks/post-install.sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "For local macOS builds, run:" -ForegroundColor Green
Write-Host "  bash scripts/fix-cocoapods-cdn.sh" -ForegroundColor White
Write-Host ""
Write-Host "For EAS Build, the post-install hook will handle this automatically." -ForegroundColor Green






