@echo off
setlocal
cd /d "%~dp0"
set "PHP_EXE=php"
where php >nul 2>&1 || set "PHP_EXE=C:\php\php.exe"
"%PHP_EXE%" -c "%~dp0php.ini" -S localhost:8000 router.php
endlocal
