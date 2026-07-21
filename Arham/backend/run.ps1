# CampusConnect – Run Script (PowerShell)
# Usage: .\run.ps1
# Builds and starts the Spring Boot backend using Java 17.

$JAVA17 = "C:\Program Files\Java\jdk-17\bin\java.exe"
$JAR    = "$PSScriptRoot\target\backend-0.1.0-SNAPSHOT.jar"

if (-not (Test-Path $JAVA17)) {
    Write-Error "Java 17 not found at $JAVA17. Please install JDK 17."
    exit 1
}

if (-not (Test-Path $JAR)) {
    Write-Host "JAR not found. Building first..." -ForegroundColor Yellow
    & $JAVA17 -classpath "$PSScriptRoot\.mvn\wrapper\maven-wrapper.jar" `
        "-Dmaven.multiModuleProjectDirectory=$PSScriptRoot" `
        org.apache.maven.wrapper.MavenWrapperMain `
        clean package -DskipTests
}

Write-Host ""
Write-Host "Starting CampusConnect Backend..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:8080" -ForegroundColor Green
Write-Host "Health check:               http://localhost:8080/api/health" -ForegroundColor Green
Write-Host "H2 Console:                 http://localhost:8080/h2-console" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

& $JAVA17 -jar $JAR
