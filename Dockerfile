# ✅ Flutter Base Image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install JDK + Tools
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 && apt-get clean

# ✅ Environment Setup
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# ✅ Install Android SDK
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

# ✅ Get Flutter packages
RUN flutter pub get

# ✅ Set SDK root explicitly for build
ENV ANDROID_SDK_ROOT=$ANDROID_HOME

# ✅ Build APK (with proper environment)
RUN flutter config --android-sdk $ANDROID_HOME && flutter doctor && \
    flutter build apk --release || (echo "⚠️ Release failed, building debug..." && flutter build apk --debug)

# ✅ Build Web version
RUN flutter build web --release

# ✅ Serve Web version on port 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
