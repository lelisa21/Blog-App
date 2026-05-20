<?php

declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$publicPath = __DIR__ . '/public' . $uri;
$storagePath = __DIR__ . $uri;

if ($uri !== '/' && is_file($publicPath)) {
    return false;
}

if (str_starts_with($uri, '/storage/') && is_file($storagePath)) {
    return false;
}

require __DIR__ . '/public/index.php';
