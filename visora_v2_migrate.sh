#!/data/data/com.termux/files/usr/bin/bash
echo "🚀 Migrating Visora project to Android V2 embedding..."

# Clean old data
flutter clean
rm -rf build .dart_tool pubspec.lock

# Ensure Android folder exists
mkdir -p android/app/src/main/kotlin/com/example/visora

# Fix MainActivity (Kotlin version)
cat > android/app/src/main/kotlin/com/example/visora/MainActivity.kt <<'EOF'
package com.example.visora

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}
EOF

# Fix AndroidManifest.xml
cat > android/app/src/main/AndroidManifest.xml <<'EOF'
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.visora">
    <application
        android:name="${applicationName}"
        android:label="visora"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name="io.flutter.embedding.android.FlutterActivity"
            android:exported="true"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Update Gradle settings
sed -i 's/gradle-wrapper.properties/gradle-wrapper.properties/' android/gradle/wrapper/gradle-wrapper.properties
echo "distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-all.zip" > android/gradle/wrapper/gradle-wrapper.properties

echo "✅ Migration done! Running pub get..."
flutter pub get

echo "🧱 Now committing changes..."
git add .
git commit -m "🚀 Migrated to Android V2 embedding"
git push -u origin main

echo "🎯 All done! GitHub Actions will now rebuild automatically."
