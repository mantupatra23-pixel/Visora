# ✅ Base Flutter image
FROM ghcr.io/cirruslabs/flutter:3.24.0

# ✅ Install system dependencies
RUN apt-get update -y && apt-get install -y openjdk-17-jdk wget unzip python3 curl git && apt-get clean

# ✅ Disable git safe directory check globally (fixes dubious ownership)
RUN git config --global --add safe.directory '*' 

# ✅ Create user (non-root)
RUN useradd -m visora
USER visora
WORKDIR /home/visora

# ✅ Environment setup
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:/home/visora/flutter/bin:$JAVA_HOME/bin

# ✅ Copy project files
COPY --chown=visora:visora . .

# ✅ Fetch dependencies
RUN flutter pub get || flutter pub get --offline

# ✅ Build optimized web version
RUN flutter build web --release

# ✅ Serve on port 8080
CMD ["bash", "-c", "python3 -m http.server 8080 --directory build/web"]
