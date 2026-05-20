$php = (Get-Command php -ErrorAction SilentlyContinue)?.Source
if (-not $php) {
    $php = "C:\php\php.exe"
}
& $php -c "$PSScriptRoot\php.ini" "$PSScriptRoot\scripts\setup.php"
