<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;

class AuthController
{
    public function health(array $params = [], array $query = []): array
    {
        return Response::success([
            'service' => 'backend',
            'module' => 'auth',
        ], 'API is running');
    }

    public function register(array $params = [], array $query = []): array
    {
        return $this->placeholder('register', $params, $query);
    }

    public function login(array $params = [], array $query = []): array
    {
        return $this->placeholder('login', $params, $query);
    }

    public function logout(array $params = [], array $query = []): array
    {
        return $this->placeholder('logout', $params, $query);
    }

    public function refresh(array $params = [], array $query = []): array
    {
        return $this->placeholder('refresh token', $params, $query);
    }

    public function me(array $params = [], array $query = []): array
    {
        return $this->placeholder('current user profile', $params, $query);
    }

    public function updateProfile(array $params = [], array $query = []): array
    {
        return $this->placeholder('update profile', $params, $query);
    }

    private function placeholder(string $action, array $params, array $query): array
    {
        return Response::success([
            'module' => 'auth',
            'owner' => 'Person 1',
            'action' => $action,
            'params' => $params,
            'query' => $query,
            'file_to_edit' => 'src/Controllers/AuthController.php',
        ], 'Starter endpoint is ready.');
    }
}
