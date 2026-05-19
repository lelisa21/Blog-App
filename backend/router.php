<?php

declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$publicPath = __DIR__ . '/public' . $uri;
$storagePath = __DIR__ . $uri;

// Serve real static files from the public/ directory
if ($uri !== '/' && is_file($publicPath)) {
    return false;
}

// Serve storage/ files directly (e.g. storage/downloads/...)
if (str_starts_with($uri, '/storage/') && is_file($storagePath)) {
    return false;
}

// Serve backend root static files (assets, etc.) if they exist
if ($uri !== '/' && is_file(__DIR__ . $uri)) {
    return false;
}

require __DIR__ . '/public/index.php';
