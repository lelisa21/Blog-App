<?php

declare(strict_types=1);

// Load .env variables (PHP built-in server does not inherit shell env by default)
(static function (): void {
    $envPath = __DIR__ . '/../.env';
    if (!is_file($envPath)) {
        return;
    }
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key !== '' && getenv($key) === false) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
        }
    }
})();

use App\Controllers\ArticleController;
use App\Controllers\AuthController;
use App\Controllers\CommentController;
use App\Controllers\CommunityController;
use App\Controllers\EventController;
use App\Controllers\ResourceController;
use App\Helpers\Response;

$autoloadBase = realpath(__DIR__ . '/../src');
spl_autoload_register(static function (string $class) use ($autoloadBase): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix) || $autoloadBase === false) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = $autoloadBase . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $relative) . '.php';

    if (is_file($path)) {
        require_once $path;
    }
});

$routes = require __DIR__ . '/../routes/api.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$query = $_GET;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');

if ($method === 'OPTIONS') {
    http_response_code(204);
    return;
}

$match = findRoute($routes, $method, $path);

if ($match === null) {
    Response::json([
        'success' => false,
        'message' => 'Route not found.',
    ], 404);
    return;
}

try {
    [$controllerClass, $action] = $match['handler'];
    $controller = new $controllerClass();
    $result = $controller->$action($match['params'], $query);

    $status = $result['status'] ?? 200;
    unset($result['status']);

    Response::json($result, $status);
} catch (Throwable $exception) {
    Response::json([
        'success' => false,
        'message' => $exception->getMessage(),
    ], 500);
}

function findRoute(array $routes, string $method, string $path): ?array
{
    $requested = strtoupper($method) . ' ' . $path;

    foreach ($routes as $route => $handler) {
        [$routeMethod, $routePath] = explode(' ', $route, 2);

        if (strtoupper($routeMethod) !== strtoupper($method)) {
            continue;
        }

        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';

        if (!preg_match($pattern, $path, $matches)) {
            continue;
        }

        $params = [];
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = $value;
            }
        }

        return [
            'route' => $requested,
            'handler' => $handler,
            'params' => $params,
        ];
    }

    return null;
}
