# Use official Flutter image
FROM cirrusci/flutter:3.24.0

# Set environment variables
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Install Android SDK (for APK build)
RUN apt-get update -y && apt-get install -y wget unzip && \
    mkdir -p $ANDROID_HOME && \
    cd /opt && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdtools.zip && \
    unzip cmdtools.zip -d $ANDROID_HOME && \
    yes | $ANDROID_HOME/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Copy project files
WORKDIR /app
COPY . .

# Get dependencies
RUN flutter pub get

# Build APK and Web
RUN flutter build apk --release
RUN flutter build web --release

# Serve web build
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
