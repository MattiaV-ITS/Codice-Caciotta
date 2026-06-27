# Build stage
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean install -DskipTests

# Runtime stage
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu
WORKDIR /app
COPY --from=builder /app/target/*.jar application.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "application.jar"]
