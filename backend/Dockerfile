# ═══════════════════════════════════════════════════════════════════
# Stage 1 — Build
# Uses the full JDK to compile and package the Spring Boot fat-jar.
# ═══════════════════════════════════════════════════════════════════
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and POM first (layer-cache dependency downloads)
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Pre-fetch all dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build — skipping tests for a faster image build
COPY src src
RUN ./mvnw clean package -DskipTests -q

# ═══════════════════════════════════════════════════════════════════
# Stage 2 — Run
# Minimal JRE-only image: ~100 MB vs ~400 MB for the full JDK.
# ═══════════════════════════════════════════════════════════════════
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S eventsphere && adduser -S eventsphere -G eventsphere
USER eventsphere

COPY --from=build /app/target/eventsphere-*.jar app.jar

EXPOSE 8080

# JVM tuning: limit heap for container environments
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
