#!/bin/bash
# visora-cloud-build.sh

# Step 1: Repo clone
git clone https://github.com/mantupatra23-pixel/Visora.git
cd Visora/web

# Step 2: Install dependencies
npm install

# Step 3: Build React + Tailwind app
npm run build

# Step 4: Capacitor Init
npm install @capacitor/core @capacitor/cli
npx cap init visora com.visora.app --web-dir=dist

# Step 5: Add Android Platform
npx cap add android

# Step 6: Sync Web Build
npx cap copy

# Step 7: Build APK (Cloud/CI mode)
cd android
./gradlew assembleRelease

echo "✅ Build Completed! APK file location:"
echo "Visora/web/android/app/build/outputs/apk/release/app-release.apk"
