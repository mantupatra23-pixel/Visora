# ✅ Use Ubuntu base image
FROM ubuntu:22.04

# ✅ Install dependencies manually
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip libglu1-mesa openjdk-17-jdk python3 && \
    apt-get clean

# ✅ Set up Flutter in safe directory (no /sdks ownership issue)
RUN git clone https://github.com/flutter/flutter.git /opt/flutter -b stable
ENV PATH="/opt/flutter/bin:/opt/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Pre-download Flutter dependencies
RUN flutter doctor -v
RUN flutter upgrade
RUN flutter config --enable-web

# ✅ Create app directory
WORKDIR /app
COPY . .

# ✅ Fetch dependencies
RUN flutter pub get

# ✅ Build Flutter web
RUN flutter build web --release

# ✅ Expose port & start web server
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
