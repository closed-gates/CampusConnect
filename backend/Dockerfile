# ============================================================
# Stage 1: Build JAR using Maven with Java 17
# ============================================================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source files
COPY pom.xml .
COPY src ./src

# Build production snapshot/release artifact without executing unit tests
RUN mvn clean package -DskipTests

# ============================================================
# Stage 2: Minimal Java 17 Runtime
# ============================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built JAR from build container
COPY --from=build /app/target/*.jar app.jar

# Render default port
EXPOSE 10000

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
