<?php

declare(strict_types=1);

header('Content-Type: application/json');

$routes = require __DIR__ . '/../routes/api.php';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

echo json_encode([
    'message' => 'TechBlog backend router placeholder',
    'method' => $method,
    'path' => $path,
    'routes_loaded' => is_array($routes),
]);
