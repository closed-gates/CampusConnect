@echo off
setlocal enabledelayedexpansion

:: 1. Search and resolve JDK 17 path
set "FOUND_JDK="
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\javac.exe" set "FOUND_JDK=%JAVA_HOME%"
)
if not defined FOUND_JDK (
    if exist "%USERPROFILE%\.jdks\jdk-17\bin\javac.exe" set "FOUND_JDK=%USERPROFILE%\.jdks\jdk-17"
)
if not defined FOUND_JDK (
    if exist "%USERPROFILE%\jdk-17\bin\javac.exe" set "FOUND_JDK=%USERPROFILE%\jdk-17"
)
if not defined FOUND_JDK (
    for /d %%d in ("C:\Program Files\Java\jdk-17*") do (
        if exist "%%d\bin\javac.exe" set "FOUND_JDK=%%d"
    )
)
if not defined FOUND_JDK (
    for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
        if exist "%%d\bin\javac.exe" set "FOUND_JDK=%%d"
    )
)

if not defined FOUND_JDK (
    echo [ERROR] JDK 17 was not found in standard system locations or JAVA_HOME.
    exit /b 1
)

set "JAVA_HOME=%FOUND_JDK%"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: 2. Search and resolve Maven executable
set "MVN_CMD="
where mvn >nul 2>nul
if %errorlevel% equ 0 (
    set "MVN_CMD=mvn"
)
if not defined MVN_CMD (
    if exist "E:\CS\maven\apache-maven-3.9.16\bin\mvn.cmd" set "MVN_CMD=E:\CS\maven\apache-maven-3.9.16\bin\mvn.cmd"
)
if not defined MVN_CMD (
    for /d %%m in ("E:\CS\maven\apache-maven*") do (
        if exist "%%m\bin\mvn.cmd" set "MVN_CMD=%%m\bin\mvn.cmd"
    )
)
if not defined MVN_CMD (
    if exist "%USERPROFILE%\.maven\apache-maven-3.9.16\bin\mvn.cmd" set "MVN_CMD=%USERPROFILE%\.maven\apache-maven-3.9.16\bin\mvn.cmd"
)
if not defined MVN_CMD (
    for /d %%m in ("%USERPROFILE%\.maven\apache-maven*") do (
        if exist "%%m\bin\mvn.cmd" set "MVN_CMD=%%m\bin\mvn.cmd"
    )
)
if not defined MVN_CMD (
    for /d %%m in ("C:\Program Files\apache-maven*") do (
        if exist "%%m\bin\mvn.cmd" set "MVN_CMD=%%m\bin\mvn.cmd"
    )
)

if not defined MVN_CMD (
    echo [ERROR] Maven executable was not found in system PATH or standard locations.
    exit /b 1
)

:: 3. Load environment variables from .env
if exist "%~dp0.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%i in ("%~dp0.env") do (
        set "%%i=%%j"
    )
)

cd /d "%~dp0"
"%MVN_CMD%" spring-boot:run
