@echo off
REM ============================================================
REM CampusConnect – Maven Wrapper for Windows
REM Forces Java 17 regardless of system PATH.
REM ============================================================

SET JAVA17=C:\Program Files\Java\jdk-17\bin\java.exe
SET WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar

IF NOT EXIST "%JAVA17%" (
    echo ERROR: Java 17 not found at %JAVA17%
    echo Please install JDK 17 or update the JAVA17 path in mvnw.cmd
    EXIT /B 1
)

"%JAVA17%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%~dp0" org.apache.maven.wrapper.MavenWrapperMain %*

EXIT /B %ERRORLEVEL%
