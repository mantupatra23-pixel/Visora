# ✅ Base image
FROM ubuntu:22.04

# ✅ Install basic dependencies
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip python3 ca-certificates && \
    apt-get clean

# ✅ Install Flutter (Stable channel)
RUN git clone https://github.com/flutter/flutter.git /usr/local/flutter -b stable
ENV PATH="/usr/local/flutter/bin:/usr/local/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Enable web build only (skip android)
RUN flutter config --enable-web

# ✅ Set working directory
WORKDIR /app
COPY . .

# ✅ Get flutter packages (safe mode, no gradle)
RUN flutter pub get --verbose || flutter pub get

# ✅ Build optimized web release
RUN flutter build web --release --web-renderer html

# ✅ Expose & Serve build on Render
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
