<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;

class CommentController
{
    public function likeArticle(array $params = [], array $query = []): array
    {
        return $this->placeholder('like article', $params, $query);
    }

    public function unlikeArticle(array $params = [], array $query = []): array
    {
        return $this->placeholder('remove article like', $params, $query);
    }

    public function bookmarkArticle(array $params = [], array $query = []): array
    {
        return $this->placeholder('bookmark article', $params, $query);
    }

    public function removeBookmark(array $params = [], array $query = []): array
    {
        return $this->placeholder('remove bookmark', $params, $query);
    }

    public function articleComments(array $params = [], array $query = []): array
    {
        return $this->placeholder('list article comments', $params, $query);
    }

    public function storeArticleComment(array $params = [], array $query = []): array
    {
        return $this->placeholder('create article comment', $params, $query);
    }

    public function updateComment(array $params = [], array $query = []): array
    {
        return $this->placeholder('update comment', $params, $query);
    }

    public function deleteComment(array $params = [], array $query = []): array
    {
        return $this->placeholder('delete comment', $params, $query);
    }

    public function likeComment(array $params = [], array $query = []): array
    {
        return $this->placeholder('like comment', $params, $query);
    }

    private function placeholder(string $action, array $params, array $query): array
    {
        return Response::success([
            'module' => 'post interactions',
            'owner' => 'Person 3',
            'action' => $action,
            'params' => $params,
            'query' => $query,
            'file_to_edit' => 'src/Controllers/CommentController.php',
        ], 'Starter endpoint is ready.');
    }
}
