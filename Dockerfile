# ✅ Flutter Base Image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install dependencies
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl gradle && apt-get clean

# ✅ Environment Variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin:$JAVA_HOME/bin

# ✅ Install Android SDK (Fixed path)
RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    cd $ANDROID_HOME/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip -d $ANDROID_HOME/cmdline-tools && rm tools.zip && \
    yes | $ANDROID_HOME/cmdline-tools/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses && \
    yes | $ANDROID_HOME/cmdline-tools/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# ✅ Copy project files
WORKDIR /app
COPY . .

# ✅ Get Flutter dependencies
RUN flutter pub get

# ✅ Set SDK path for Flutter
RUN flutter config --android-sdk $ANDROID_HOME && flutter doctor -v

# ✅ Build APK + Web
RUN flutter build apk --debug || flutter build apk --release
RUN flutter build web --release

# ✅ Serve build on port 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
