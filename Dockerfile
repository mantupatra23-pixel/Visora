# ✅ Flutter Base Image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install Java (JDK) for Android build
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip && \
    apt-get clean

# ✅ Set Environment Variables
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin

# ✅ Install Android SDK & Accept Licenses
RUN mkdir -p $ANDROID_HOME/cmdline-tools/latest && \
    cd $ANDROID_HOME/cmdline-tools/latest && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip && rm tools.zip && \
    ln -sf $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager /usr/local/bin/sdkmanager && \
    yes | sdkmanager --sdk_root=$ANDROID_HOME --licenses && \
    yes | sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# ✅ Copy project files
WORKDIR /app
COPY . .

# ✅ Get Flutter Dependencies
RUN flutter pub get

# ✅ Build APK and Web
RUN flutter build apk --release || (echo "⚠️ Release failed, building debug APK..." && flutter build apk --debug)
RUN flutter build web --release

# ✅ Serve Web Build
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
