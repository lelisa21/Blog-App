$php = (Get-Command php -ErrorAction SilentlyContinue)?.Source
if (-not $php) {
    $php = "C:\php\php.exe"
}
Set-Location $PSScriptRoot
& $php -c "$PSScriptRoot\php.ini" -S localhost:8000 router.php
