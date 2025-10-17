# ✅ Flutter base image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install lightweight dependencies
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl && apt-get clean

# ✅ Create non-root user (Render fix)
RUN useradd -m visora
USER visora
WORKDIR /home/visora

# ✅ Environment setup
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$JAVA_HOME/bin

# ✅ Copy app files
COPY --chown=visora:visora . .

# ✅ Get dependencies
RUN flutter pub get

# ✅ Build Flutter web (Render-safe)
RUN flutter build web --release

# ✅ Serve build
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
