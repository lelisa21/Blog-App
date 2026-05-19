<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Controllers\Concerns\AuthenticatesRequests;
use App\Helpers\Response;
use App\Models\Article;
use App\Models\Comment;
use App\Support\Request;
use RuntimeException;

class CommentController
{
    use AuthenticatesRequests;

    private ?Comment $comments = null;
    private ?Article $articles = null;

    public function likeArticle(array $params = [], array $query = []): array
    {
        return $this->mutateArticleInteraction($params, 'like');
    }

    public function unlikeArticle(array $params = [], array $query = []): array
    {
        return $this->mutateArticleInteraction($params, 'unlike');
    }

    public function bookmarkArticle(array $params = [], array $query = []): array
    {
        return $this->mutateArticleInteraction($params, 'bookmark');
    }

    public function removeBookmark(array $params = [], array $query = []): array
    {
        return $this->mutateArticleInteraction($params, 'remove_bookmark');
    }

    public function articleComments(array $params = [], array $query = []): array
    {
        $articleId = (int) ($params['id'] ?? 0);
        if ($articleId <= 0 || !$this->model()->articleExists($articleId)) {
            return Response::error('Article not found.', 404);
        }

        return Response::success([
            'comments' => $this->model()->forArticle($articleId),
        ], 'Comments loaded.');
    }

    public function storeArticleComment(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $articleId = (int) ($params['id'] ?? 0);
        if ($articleId <= 0 || !$this->model()->articleExists($articleId)) {
            return Response::error('Article not found.', 404);
        }

        $payload = Request::body();
        $content = trim((string) ($payload['content'] ?? ''));
        if ($content === '') {
            return Response::error('Comment content is required.', 422, [
                'content' => ['Content is required.'],
            ]);
        }

        $parentId = isset($payload['parent_id']) ? (int) $payload['parent_id'] : null;
        $comment = $this->model()->create($articleId, (int) $user['id'], $content, $parentId);

        return Response::success(['comment' => $comment], 'Comment created.', 201);
    }

    public function updateComment(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        $comment = $this->model()->findById($id);
        if ($comment === null) {
            return Response::error('Comment not found.', 404);
        }

        if ((int) $comment['author']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot edit this comment.', 403);
        }

        $content = trim((string) (Request::body()['content'] ?? ''));
        if ($content === '') {
            return Response::error('Comment content is required.', 422);
        }

        $updated = $this->model()->update($id, $content);

        return Response::success(['comment' => $updated], 'Comment updated.');
    }

    public function deleteComment(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        $comment = $this->model()->findById($id);
        if ($comment === null) {
            return Response::error('Comment not found.', 404);
        }

        if ((int) $comment['author']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot delete this comment.', 403);
        }

        $this->model()->delete($id);

        return Response::success([], 'Comment deleted.');
    }

    public function likeComment(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        $comment = $this->model()->findById($id);
        if ($comment === null) {
            return Response::error('Comment not found.', 404);
        }

        $likes = $this->model()->likeComment($id);

        return Response::success(['likes' => $likes], 'Comment liked.');
    }

    private function mutateArticleInteraction(array $params, string $action): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $articleId = (int) ($params['id'] ?? 0);
        if ($articleId <= 0 || !$this->model()->articleExists($articleId)) {
            return Response::error('Article not found.', 404);
        }

        $userId = (int) $user['id'];

        match ($action) {
            'like' => $this->model()->likeArticle($userId, $articleId),
            'unlike' => $this->model()->unlikeArticle($userId, $articleId),
            'bookmark' => $this->model()->bookmarkArticle($userId, $articleId),
            'remove_bookmark' => $this->model()->removeBookmark($userId, $articleId),
        };

        $article = $this->articles()->findById($articleId, $userId);

        return Response::success([
            'article_id' => $articleId,
            'liked' => $article['liked'] ?? false,
            'bookmarked' => $article['bookmarked'] ?? false,
        ], 'Interaction updated.');
    }

    private function model(): Comment
    {
        if (!$this->comments instanceof Comment) {
            $this->comments = new Comment();
        }

        return $this->comments;
    }

    private function articles(): Article
    {
        if (!$this->articles instanceof Article) {
            $this->articles = new Article();
        }

        return $this->articles;
    }
}
