# Flutter Auto Builder & Web Host (by Aimantuvya)
FROM cirrusci/flutter:latest

WORKDIR /app
COPY . .

# Install dependencies
RUN flutter pub get

# Build Web + APK
RUN flutter build web --release
RUN flutter build apk --release

# Copy build output for Render web hosting
RUN mkdir -p /app/build_output && cp -r build/web/* /app/build_output/

# Web server setup
RUN apt-get update && apt-get install -y python3
CMD ["python3", "-m", "http.server", "8080", "--directory", "/app/build_output"]
