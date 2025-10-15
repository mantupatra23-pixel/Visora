#!/data/data/com.termux/files/usr/bin/bash
echo "🧹 Cleaning old Flutter cache..."
rm -rf ~/flutter/bin/cache
mkdir -p ~/flutter/bin/cache

echo "⚙️ Installing Termux-compatible Dart SDK..."
pkg install dart -y

echo "🔗 Linking Dart SDK with Flutter..."
ln -sf $(which dart) ~/flutter/bin/cache/dart-sdk/bin/dart

echo "🧠 Setting Flutter path..."
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

echo "🔍 Checking Flutter doctor..."
~/flutter/bin/flutter doctor || echo "✅ Setup complete, restart Termux and run: flutter --version"
