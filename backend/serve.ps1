$php = "C:\Program Files\php\php.exe"
Set-Location $PSScriptRoot
& $php -c "$PSScriptRoot\php.ini" -S localhost:8000 router.php
