# ✅ Base image
FROM ubuntu:22.04

# ✅ Install dependencies
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip libglu1-mesa python3 ca-certificates && \
    apt-get clean

# ✅ Install Flutter safely
RUN mkdir -p /usr/local/flutter
RUN git clone https://github.com/flutter/flutter.git /usr/local/flutter -b stable
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Disable Android SDK auto-download
ENV ANDROID_SDK_ROOT=/usr/local/flutter/android
ENV GRADLE_USER_HOME=/usr/local/flutter/.gradle
RUN mkdir -p $GRADLE_USER_HOME && chmod -R 777 $GRADLE_USER_HOME

# ✅ Configure Flutter for web only
RUN flutter config --enable-web
RUN flutter upgrade

# ✅ Work directory
WORKDIR /app
COPY . .

# ✅ Clean Flutter cache (to skip gradle download)
RUN flutter clean
RUN rm -rf /usr/local/flutter/.pub-cache/*

# ✅ Get dependencies (no gradle/android)
RUN flutter pub get --verbose || flutter pub get

# ✅ Build web optimized version
RUN flutter build web --release --web-renderer html

# ✅ Serve web on Render
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
