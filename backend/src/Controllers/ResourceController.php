<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;

class ResourceController
{
    public function index(array $params = [], array $query = []): array
    {
        return $this->placeholder('list resources', $params, $query);
    }

    public function download(array $params = [], array $query = []): array
    {
        return $this->placeholder('download resource', $params, $query);
    }

    public function rate(array $params = [], array $query = []): array
    {
        return $this->placeholder('rate resource', $params, $query);
    }

    public function learningPaths(array $params = [], array $query = []): array
    {
        return $this->placeholder('learning paths', $params, $query);
    }

    public function saveProgress(array $params = [], array $query = []): array
    {
        return $this->placeholder('save learning progress', $params, $query);
    }

    public function contact(array $params = [], array $query = []): array
    {
        return $this->placeholder('send contact message', $params, $query);
    }

    public function contactMessages(array $params = [], array $query = []): array
    {
        return $this->placeholder('list contact messages', $params, $query);
    }

    private function placeholder(string $action, array $params, array $query): array
    {
        return Response::success([
            'module' => 'resources and contact',
            'owner' => 'Person 6',
            'action' => $action,
            'params' => $params,
            'query' => $query,
            'file_to_edit' => 'src/Controllers/ResourceController.php',
        ], 'Starter endpoint is ready.');
    }
}
