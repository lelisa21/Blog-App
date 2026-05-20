<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Controllers\Concerns\AuthenticatesRequests;
use App\Helpers\Response;
use App\Models\Article;
use App\Support\Request;
use RuntimeException;

class ArticleController
{
    use AuthenticatesRequests;

    private ?Article $articles = null;

    public function index(array $params = [], array $query = []): array
    {
        $viewer = $this->optionalUser();
        $filters = [
            'page' => $query['page'] ?? 1,
            'per_page' => $query['per_page'] ?? 12,
            'category_id' => $query['category_id'] ?? null,
            'category_slug' => $query['category'] ?? $query['category_slug'] ?? null,
            'tag_slug' => $query['tag'] ?? null,
            'author_id' => $query['author_id'] ?? null,
            'sort' => $query['sort'] ?? 'newest',
            'max_reading_time' => $query['max_reading_time'] ?? null,
            'status' => $query['status'] ?? 'published',
        ];

        if ($viewer !== null && $this->isAdmin($viewer) && !empty($query['include_drafts'])) {
            $filters['status'] = $query['status'] ?? 'all';
        }

        $result = $this->model()->paginate(array_filter($filters, static fn ($v) => $v !== null && $v !== ''), $viewer['id'] ?? null);

        return Response::success($result, 'Articles loaded.');
    }

    public function show(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return Response::error('Article id is required.', 422);
        }

        $viewer = $this->optionalUser();
        $article = $this->model()->findById($id, $viewer['id'] ?? null, $viewer !== null && $this->isAdmin($viewer));

        if ($article === null) {
            return Response::error('Article not found.', 404);
        }

        $this->model()->incrementViews($id);

        return Response::success(['article' => $article], 'Article loaded.');
    }

    public function showBySlug(array $params = [], array $query = []): array
    {
        $slug = trim((string) ($params['slug'] ?? ''));
        if ($slug === '') {
            return Response::error('Article slug is required.', 422);
        }

        $viewer = $this->optionalUser();
        $article = $this->model()->findBySlug($slug, $viewer['id'] ?? null);

        if ($article === null) {
            return Response::error('Article not found.', 404);
        }

        $this->model()->incrementViews((int) $article['id']);

        return Response::success(['article' => $article], 'Article loaded.');
    }

    public function categories(array $params = [], array $query = []): array
    {
        return Response::success([
            'categories' => $this->model()->categories(),
        ], 'Categories loaded.');
    }

    public function tags(array $params = [], array $query = []): array
    {
        return Response::success([
            'tags' => $this->model()->tags(),
        ], 'Tags loaded.');
    }

    public function store(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();
        $errors = $this->validateArticlePayload($payload, true);
        if ($errors !== []) {
            return Response::error('Article validation failed.', 422, $errors);
        }

        $payload['author_id'] = (int) $user['id'];
        if (!$this->isAdmin($user)) {
            $payload['status'] = 'draft';
        }

        $article = $this->model()->create($payload);

        return Response::success(['article' => $article], 'Article created.', 201);
    }

    public function update(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return Response::error('Article id is required.', 422);
        }

        $existing = $this->model()->findById($id, null, true);
        if ($existing === null) {
            return Response::error('Article not found.', 404);
        }

        if ((int) $existing['author']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot edit this article.', 403);
        }

        $payload = Request::body();
        $article = $this->model()->update($id, $payload);
        if ($article === null) {
            return Response::error('Article could not be updated.', 500);
        }

        return Response::success(['article' => $article], 'Article updated.');
    }

    public function destroy(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        $existing = $this->model()->findById($id, null, true);
        if ($existing === null) {
            return Response::error('Article not found.', 404);
        }

        if ((int) $existing['author']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot delete this article.', 403);
        }

        $this->model()->delete($id);

        return Response::success([], 'Article deleted.');
    }

    public function search(array $params = [], array $query = []): array
    {
        $term = trim((string) ($query['q'] ?? $query['query'] ?? ''));
        if ($term === '') {
            return Response::error('Search query is required.', 422);
        }

        $limit = isset($query['limit']) ? max(1, min(50, (int) $query['limit'])) : 20;

        return Response::success([
            'articles' => $this->model()->search($term, $limit),
            'query' => $term,
        ], 'Search results loaded.');
    }

    private function validateArticlePayload(array $payload, bool $requireContent): array
    {
        $errors = [];

        if (trim((string) ($payload['title'] ?? '')) === '') {
            $errors['title'][] = 'Title is required.';
        }

        if ($requireContent && trim((string) ($payload['content'] ?? '')) === '') {
            $errors['content'][] = 'Content is required.';
        }

        if (!empty($payload['status']) && !in_array($payload['status'], ['draft', 'published', 'archived'], true)) {
            $errors['status'][] = 'Invalid status.';
        }

        return $errors;
    }

    private function model(): Article
    {
        if (!$this->articles instanceof Article) {
            $this->articles = new Article();
        }

        return $this->articles;
    }
}
