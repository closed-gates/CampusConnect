@echo off
for /f "usebackq eol=# tokens=1,* delims==" %%i in (.env) do (
    set "%%i=%%j"
)
..\maven\apache-maven-3.9.16\bin\mvn.cmd spring-boot:run
