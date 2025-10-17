# ✅ Base Ubuntu image
FROM ubuntu:22.04

# ✅ Install dependencies
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip libglu1-mesa openjdk-17-jdk python3 && \
    apt-get clean

# ✅ Clone Flutter SDK to safe path (no permission issue)
RUN git clone https://github.com/flutter/flutter.git /opt/flutter -b stable
ENV PATH="/opt/flutter/bin:/opt/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Enable Flutter web
RUN flutter config --enable-web
RUN flutter upgrade

# ✅ Create working directory
WORKDIR /app
COPY . .

# ✅ Fetch dependencies
RUN flutter pub get

# ✅ Build Flutter web (release mode)
RUN flutter build web --release

# ✅ Serve app on port 8080
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
