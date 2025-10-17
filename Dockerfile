# ✅ Flutter Base Image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install JDK + Gradle + Python
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl gradle && apt-get clean

# ✅ Environment Variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin:$JAVA_HOME/bin

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

# ✅ Get Flutter Dependencies
RUN flutter pub get

# ✅ Clean and prepare Gradle
RUN flutter clean && rm -rf ~/.gradle && mkdir -p ~/.gradle/caches

# ✅ Build APK and Web
RUN flutter doctor -v && \
    flutter build apk --debug || flutter build apk --release
RUN flutter build web --release

# ✅ Serve web build
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
