# ✅ Base Ubuntu
FROM ubuntu:22.04

# ✅ Install dependencies
RUN apt-get update -y && \
    apt-get install -y curl git unzip xz-utils zip libglu1-mesa openjdk-17-jdk python3 && \
    apt-get clean

# ✅ Install Flutter manually in safe directory
RUN mkdir -p /home/flutter
RUN git clone https://github.com/flutter/flutter.git /home/flutter -b stable
ENV PATH="/home/flutter/bin:/home/flutter/bin/cache/dart-sdk/bin:${PATH}"

# ✅ Preload Flutter SDK cache
RUN flutter upgrade
RUN flutter config --enable-web

# ✅ Create working directory
WORKDIR /app
COPY . .

# ✅ Get dependencies safely (no gradle / android)
RUN flutter pub get --no-precompile

# ✅ Build optimized web version
RUN flutter build web --release --web-renderer html

# ✅ Serve web app on port 8080
EXPOSE 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
