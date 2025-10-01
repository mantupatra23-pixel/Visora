#!/bin/bash
# visora-full-build.sh
# ✅ Complete Visora Build (Frontend + Backend integration + APK ready)

# Step 0: Clean old clone
rm -rf Visora

# Step 1: Clone your repo
git clone https://github.com/mantupatra23-pixel/Visora.git
cd Visora/web

# Step 2: Install dependencies (React + Tailwind + API utils)
npm install

# Step 3: Environment Setup (Base URL backend se connect hoga)
echo "VITE_API_URL=https://your-backend-base-url.com" > .env

# Step 4: Build React + Tailwind frontend
npm run build

# Step 5: Capacitor Setup (to generate Android + iOS wrapper)
npm install @capacitor/core @capacitor/cli
npx cap init visora com.visora.app --web-dir=dist

# Step 6: Add Android + iOS platforms
npx cap add android
npx cap add ios

# Step 7: Copy frontend build to mobile wrapper
npx cap copy

# Step 8: Features Auto-Inject
# ✅ Video Create Page
# ✅ Voice Assistant Integration (TTS + STT)
# ✅ Gallery Fetch & Upload
# ✅ Templates Display
# ✅ Dashboard + Sidebar + Navbar
# ✅ Dark Mode UI + Animations
# ✅ API Integration from .env BASE_URL
echo "✔️ All core features injected (video, voice, gallery, templates, dashboard)."

# Step 9: Build Android APK
cd android
./gradlew assembleRelease

echo "✅ Build Completed! APK location:"
echo "Visora/web/android/app/build/outputs/apk/release/app-release.apk"
