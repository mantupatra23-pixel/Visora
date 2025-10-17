# ✅ Flutter base image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install lightweight dependencies
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl && apt-get clean

# ✅ Fix permissions for Flutter SDK
RUN chown -R 1000:1000 /sdks/flutter || true
RUN git config --global --add safe.directory /sdks/flutter

# ✅ Create non-root user
RUN useradd -m visora
USER visora
WORKDIR /home/visora

# ✅ Set environment
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:/home/visora/flutter/bin:$JAVA_HOME/bin

# ✅ Copy app files
COPY --chown=visora:visora . .

# ✅ Get dependencies safely
RUN flutter pub get || flutter pub get --offline

# ✅ Build Flutter web (Render-safe)
RUN flutter build web --release

# ✅ Serve Flutter web
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
