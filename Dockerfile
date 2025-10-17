# ✅ Lightweight Flutter base image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install minimum dependencies only
RUN apt-get update -y && \
    apt-get install -y openjdk-17-jdk wget unzip python3 curl && \
    apt-get clean

# ✅ Environment setup
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/bin:$ANDROID_HOME/platform-tools:$JAVA_HOME/bin

# ✅ Install Android SDK (light version)
RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    cd $ANDROID_HOME/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip -d $ANDROID_HOME/cmdline-tools && rm tools.zip && \
    yes | $ANDROID_HOME/cmdline-tools/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses && \
    yes | $ANDROID_HOME/cmdline-tools/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "build-tools;34.0.0" "platforms;android-34"

# ✅ Set working directory
WORKDIR /app
COPY . .

# ✅ Fetch dependencies (offline mode to reduce memory)
RUN flutter pub get --offline || flutter pub get

# ✅ Build only Web (Render friendly)
RUN flutter build web --release

# ✅ Serve web build on port 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
