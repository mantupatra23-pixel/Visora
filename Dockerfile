# ✅ Base Flutter image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install Java, Python, etc.
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl git && apt-get clean

# ✅ Fix Flutter SDK ownership and safety
RUN git config --global --add safe.directory /sdks/flutter && \
    chown -R 1000:1000 /sdks/flutter || true && \
    chmod -R 777 /sdks/flutter

# ✅ Create user (non-root)
RUN useradd -m visora
USER visora
WORKDIR /home/visora

# ✅ Set environment paths
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:/home/visora/flutter/bin:$JAVA_HOME/bin

# ✅ Copy all project files
COPY --chown=visora:visora . .

# ✅ Get Flutter dependencies
RUN flutter pub get --verbose || flutter pub get --offline

# ✅ Build Flutter web (Render-friendly)
RUN flutter build web --release

# ✅ Serve the built web app
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
