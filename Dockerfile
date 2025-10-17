# ✅ Flutter + Render Compatible Dockerfile
FROM debian:stable-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl git unzip xz-utils zip python3 sudo

# Non-root user for Flutter
RUN useradd -m flutteruser && adduser flutteruser sudo
USER flutteruser
WORKDIR /home/flutteruser

# Install Flutter SDK
RUN git clone https://github.com/flutter/flutter.git -b stable
ENV PATH="/home/flutteruser/flutter/bin:/home/flutteruser/.pub-cache/bin:${PATH}"

# Copy project
WORKDIR /home/flutteruser/app
COPY --chown=flutteruser:flutteruser . .

# Enable Flutter web
RUN flutter config --enable-web

# Fix SDK version
RUN flutter upgrade
RUN flutter pub get

# Build APK and Web
RUN flutter build apk --release
RUN flutter build web --release

# Serve Web build
CMD ["python3", "-m", "http.server", "8080", "--directory", "build/web"]
