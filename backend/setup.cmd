@echo off
setlocal
"C:\Program Files\php\php.exe" -c "%~dp0php.ini" "%~dp0scripts\setup.php"
endlocal
