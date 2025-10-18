# ✅ Base image
FROM ubuntu:22.04

# ✅ Install required packages
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip python3 ca-certificates && \
    apt-get clean

# ✅ Install Flutter (stable)
RUN git clone https://github.com/flutter/flutter.git /usr/local/flutter -b stable
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Enable web build only
RUN flutter config --enable-web

# ✅ Disable Gradle completely
ENV ANDROID_SDK_ROOT=""
ENV GRADLE_USER_HOME="/tmp"
RUN rm -rf /usr/local/flutter/.pub-cache || true

# ✅ Working directory
WORKDIR /app
COPY . .

# ✅ Bypass git permission issue (Render sandbox fix)
RUN git config --global --add safe.directory /usr/local/flutter

# ✅ Get Flutter dependencies safely
RUN flutter pub get --no-precompile || true

# ✅ Build optimized web release (skip gradle)
RUN flutter build web --release --web-renderer html

# ✅ Serve web files on Render
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
