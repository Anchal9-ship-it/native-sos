#!/bin/bash

# Emergency SOS App - Rebuild Script with All Fixes
# Run this after applying all fixes from FIXES_AND_LIMITATIONS.md

echo "🚨 Emergency SOS App - Rebuild Script"
echo "======================================"
echo ""

cd /app/frontend

echo "📋 Step 1: Cleaning old builds..."
rm -rf node_modules .expo .metro-cache android ios
echo "✅ Clean complete"
echo ""

echo "📦 Step 2: Installing dependencies..."
yarn install
echo "✅ Dependencies installed"
echo ""

echo "🔧 Step 3: Installing performance optimizations..."
yarn add @shopify/flash-list
echo "✅ FlashList added"
echo ""

echo "🎵 Step 4: Setting up audio (migrating from expo-av)..."
# Note: expo-av will work but is deprecated
# Uncomment below to migrate to expo-audio for SDK 54+
# yarn remove expo-av
# yarn add expo-audio
echo "⚠️  expo-av is deprecated - consider migrating to expo-audio"
echo ""

echo "📱 Step 5: Running prebuild (applies native plugins)..."
echo "⚠️  This will generate android/ and ios/ folders"
read -p "Continue with prebuild? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    expo prebuild --clean
    echo "✅ Prebuild complete"
else
    echo "⏭️  Skipping prebuild"
fi
echo ""

echo "🏗️  Step 6: Building APK..."
echo ""
echo "Choose build profile:"
echo "1) preview  - Quick build for testing (recommended)"
echo "2) production - Optimized build for release"
echo ""
read -p "Enter choice (1 or 2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]
then
    echo "Building preview APK..."
    eas build --platform android --profile preview --clear-cache
elif [[ $REPLY == "2" ]]
then
    echo "Building production APK..."
    eas build --platform android --profile production --clear-cache
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Download APK from Expo dashboard: https://expo.dev"
echo "2. Install on Android device"
echo "3. Grant ALL permissions when prompted"
echo "4. Test features one by one"
echo ""
echo "⚠️  Remember:"
echo "- Lock screen features WON'T work (platform limitation)"
echo "- Volume buttons WON'T work (needs native development)"
echo "- Ensure phone is NOT on silent mode for alarm"
echo "- Enable Bluetooth manually before testing BLE"
echo ""
echo "📖 Read FIXES_AND_LIMITATIONS.md for detailed info"
