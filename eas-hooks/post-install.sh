#!/bin/bash
# EAS Build hook to configure CocoaPods to use git-based spec repo as fallback
# This helps when CocoaPods CDN is experiencing issues

set -e

echo "Configuring CocoaPods to use git-based spec repo as fallback..."

# Check if we're on iOS build
if [ -d "ios" ]; then
  # Remove CDN source if it exists and add git-based trunk repo
  pod repo remove trunk 2>/dev/null || true
  pod repo add trunk https://github.com/CocoaPods/Specs.git || true
  
  echo "CocoaPods configured to use git-based spec repo"
else
  echo "iOS directory not found, skipping CocoaPods configuration"
fi

