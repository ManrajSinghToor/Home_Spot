# Stage 1: Build the Application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/homespot-backend-1.0.0.jar app.jar

# Expose port (default 5001 or provided PORT env var)
EXPOSE 5001

# Entry point
ENTRYPOINT ["java", "-jar", "app.jar"]
