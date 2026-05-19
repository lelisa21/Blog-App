#!/usr/bin/env bash
# Start the TechBlog backend dev server on Linux/Mac
set -e
cd "$(dirname "$0")"

if ! command -v php &>/dev/null; then
    echo "PHP not found in PATH. Please install PHP 8.1+ and try again."
    exit 1
fi

PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;')
echo "Using PHP $PHP_VERSION"
echo "Starting dev server at http://localhost:8000"
echo "Press Ctrl+C to stop."
echo ""

php -c php.ini -S localhost:8000 router.php
