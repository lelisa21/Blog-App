<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;

class ArticleController
{
    public function index(array $params = [], array $query = []): array
    {
        return $this->placeholder('list articles', $params, $query);
    }

    public function show(array $params = [], array $query = []): array
    {
        return $this->placeholder('show article by id', $params, $query);
    }

    public function showBySlug(array $params = [], array $query = []): array
    {
        return $this->placeholder('show article by slug', $params, $query);
    }

    public function categories(array $params = [], array $query = []): array
    {
        return $this->placeholder('list categories', $params, $query);
    }

    public function tags(array $params = [], array $query = []): array
    {
        return $this->placeholder('list tags', $params, $query);
    }

    public function store(array $params = [], array $query = []): array
    {
        return $this->placeholder('create article', $params, $query);
    }

    public function update(array $params = [], array $query = []): array
    {
        return $this->placeholder('update article', $params, $query);
    }

    public function destroy(array $params = [], array $query = []): array
    {
        return $this->placeholder('delete article', $params, $query);
    }

    public function search(array $params = [], array $query = []): array
    {
        return $this->placeholder('search articles', $params, $query);
    }

    private function placeholder(string $action, array $params, array $query): array
    {
        return Response::success([
            'module' => 'articles',
            'owner' => 'Person 2',
            'action' => $action,
            'params' => $params,
            'query' => $query,
            'file_to_edit' => 'src/Controllers/ArticleController.php',
        ], 'Starter endpoint is ready.');
    }
}
