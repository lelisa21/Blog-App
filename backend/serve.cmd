@echo off
setlocal
cd /d "%~dp0"
"C:\Program Files\php\php.exe" -c "%~dp0php.ini" -S localhost:8000 router.php
endlocal
