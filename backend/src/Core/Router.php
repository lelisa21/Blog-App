<?php

declare(strict_types=1);

namespace App\Core;

use Closure;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, array|Closure $handler): void
    {
        $this->routes[strtoupper($method)][rtrim($path, '/') ?: '/'] = $handler;
    }

    public function dispatch(Request $request): array
    {
        $method = $request->method();
        $path = rtrim($request->path(), '/') ?: '/';
        $handler = $this->routes[$method][$path] ?? null;

        if ($handler === null) {
            return [
                'status' => 404,
                'body' => [
                    'success' => false,
                    'message' => 'Route not found.',
                ],
            ];
        }

        if ($handler instanceof Closure) {
            $result = $handler($request);
        } else {
            [$class, $action] = $handler;
            $controller = new $class();
            $result = $controller->{$action}($request);
        }

        if (is_array($result) && array_key_exists('status', $result) && array_key_exists('body', $result)) {
            return $result;
        }

        return [
            'status' => 200,
            'body' => [
                'success' => true,
                'data' => $result,
            ],
        ];
    }
}
