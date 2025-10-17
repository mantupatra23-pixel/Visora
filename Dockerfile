# ✅ Flutter Base Image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install dependencies
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl gradle && apt-get clean

# ✅ Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin:$JAVA_HOME/bin

# ✅ Install Android SDK
RUN mkdir -p $ANDROID_HOME/cmdline-tools/latest && \
    cd $ANDROID_HOME/cmdline-tools/latest && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip && rm tools.zip && \
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses && \
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# ✅ Copy project files
WORKDIR /app
COPY . .

# ✅ Get dependencies
RUN flutter pub get

# ✅ Tell Flutter the SDK location manually
RUN flutter config --android-sdk $ANDROID_HOME

# ✅ Verify SDK + Flutter setup
RUN echo "ANDROID SDK = $ANDROID_HOME" && flutter doctor -v

# ✅ Build APK and Web separately
RUN flutter build apk --debug || flutter build apk --release
RUN flutter build web --release

# ✅ Serve web on port 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
