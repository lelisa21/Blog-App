<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/Helpers/Response.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/ArticleController.php';
require_once __DIR__ . '/../src/Controllers/CommentController.php';
require_once __DIR__ . '/../src/Controllers/CommunityController.php';
require_once __DIR__ . '/../src/Controllers/EventController.php';
require_once __DIR__ . '/../src/Controllers/ResourceController.php';

use App\Controllers\ArticleController;
use App\Controllers\AuthController;
use App\Controllers\CommentController;
use App\Controllers\CommunityController;
use App\Controllers\EventController;
use App\Controllers\ResourceController;
use App\Helpers\Response;

$routes = require __DIR__ . '/../routes/api.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$query = $_GET;
$match = findRoute($routes, $method, $path);

if ($match === null) {
    Response::json([
        'success' => false,
        'message' => 'Route not found.',
    ], 404);
    return;
}

[$controllerClass, $action] = $match['handler'];
$controller = new $controllerClass();
$result = $controller->$action($match['params'], $query);

$status = $result['status'] ?? 200;
unset($result['status']);

Response::json($result, $status);

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
