#!/bin/bash
# Script to fix CocoaPods CDN issues by switching to git-based spec repo
# Usage: Run this script before building iOS

set -e

echo "🔧 Fixing CocoaPods CDN issues..."

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods is not installed. Please install it first:"
    echo "   sudo gem install cocoapods"
    exit 1
fi

# Remove CDN-based trunk repo
echo "Removing CDN-based trunk repo..."
pod repo remove trunk 2>/dev/null || echo "Trunk repo not found or already removed"

# Add git-based trunk repo
echo "Adding git-based trunk repo..."
pod repo add trunk https://github.com/CocoaPods/Specs.git || echo "Trunk repo already exists"

# Update the repo
echo "Updating CocoaPods spec repo..."
pod repo update trunk

echo "✅ CocoaPods configured to use git-based spec repo"
echo "You can now retry your build."



