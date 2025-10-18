# ✅ Base Ubuntu image
FROM ubuntu:22.04

# ✅ Install dependencies
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip libglu1-mesa openjdk-17-jdk python3 ca-certificates && \
    apt-get clean

# ✅ Install Flutter in safe path
RUN mkdir -p /usr/local/flutter
RUN git clone https://github.com/flutter/flutter.git /usr/local/flutter -b stable
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Set permissions to avoid ownership issues
RUN chmod -R 777 /usr/local/flutter

# ✅ Configure Flutter for Web only (no Android SDK setup)
RUN flutter config --enable-web
RUN flutter upgrade

# ✅ Create working directory and copy source
WORKDIR /app
COPY . .

# ✅ Fetch only web dependencies (skip gradle/android)
RUN flutter pub get --offline || flutter pub get

# ✅ Build web optimized release
RUN flutter build web --release --web-renderer html

# ✅ Expose port and serve the web build
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
