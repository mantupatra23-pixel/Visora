# ✅ Working Flutter base image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Android SDK environment
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin

# ✅ Install Android SDK & Accept Licenses
RUN apt-get update -y && apt-get install -y wget unzip && \
    mkdir -p $ANDROID_HOME/cmdline-tools && \
    cd $ANDROID_HOME/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip -d latest && \
    rm tools.zip && \
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses && \
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# ✅ Copy project
WORKDIR /app
COPY . .

# ✅ Get dependencies
RUN flutter pub get

# ✅ Build APK & Web
RUN flutter build apk --release || (echo "⚠️ APK release failed, building debug instead..." && flutter build apk --debug)
RUN flutter build web --release

# ✅ Serve web version
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
