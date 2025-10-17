# -----------------------------------------------------
# 🧱 Base setup for Flutter APK build (Render compatible)
# -----------------------------------------------------

FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl git unzip xz-utils zip libglu1-mesa \
    openjdk-17-jdk wget && \
    apt-get clean

# Install Flutter SDK (stable)
RUN git clone https://github.com/flutter/flutter.git -b stable /usr/local/flutter
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# Verify Flutter setup
RUN flutter doctor -v

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Get dependencies
RUN flutter pub get

# Build APK
RUN flutter build apk --release

# Move APK to an easy-access folder
RUN mkdir -p /app/output && cp build/app/outputs/flutter-apk/app-release.apk /app/output/visora-release.apk

# ✅ Final message
CMD echo "✅ Visora APK Build Complete! File saved at /app/output/visora-release.apk"
