#!/usr/bin/env bash
# Run the database setup/migration script on Linux/Mac
set -e
cd "$(dirname "$0")"

if ! command -v php &>/dev/null; then
    echo "PHP not found in PATH. Please install PHP 8.1+ and try again."
    exit 1
fi

echo "Running database setup..."
php -c php.ini scripts/setup.php
