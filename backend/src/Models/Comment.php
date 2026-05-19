<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Database;
use PDO;

class Comment
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function forArticle(int $articleId): array
    {
        $statement = $this->db->prepare(
            'SELECT c.*, u.username, u.full_name, u.avatar
             FROM comments c
             INNER JOIN users u ON u.id = c.user_id
             WHERE c.article_id = :article_id AND c.is_approved = TRUE
             ORDER BY c.created_at ASC'
        );
        $statement->execute(['article_id' => $articleId]);
        $rows = $statement->fetchAll() ?: [];

        $indexed = [];
        $tree = [];

        foreach ($rows as $row) {
            $comment = $this->formatComment($row);
            $indexed[$comment['id']] = $comment;
        }

        foreach ($indexed as $id => $comment) {
            $parentId = $comment['parent_id'];
            if ($parentId !== null && isset($indexed[$parentId])) {
                $indexed[$parentId]['replies'][] = &$indexed[$id];
            } else {
                $tree[] = &$indexed[$id];
            }
        }

        return $tree;
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT c.*, u.username, u.full_name, u.avatar
             FROM comments c
             INNER JOIN users u ON u.id = c.user_id
             WHERE c.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        return $row !== false ? $this->formatComment($row) : null;
    }

    public function create(int $articleId, int $userId, string $content, ?int $parentId = null): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO comments (article_id, user_id, parent_id, content)
             VALUES (:article_id, :user_id, :parent_id, :content)'
        );
        $statement->execute([
            'article_id' => $articleId,
            'user_id' => $userId,
            'parent_id' => $parentId,
            'content' => $content,
        ]);

        return $this->findById((int) $this->db->lastInsertId()) ?? [];
    }

    public function update(int $id, string $content): ?array
    {
        $statement = $this->db->prepare(
            'UPDATE comments SET content = :content, updated_at = NOW() WHERE id = :id'
        );
        $statement->execute(['id' => $id, 'content' => $content]);

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM comments WHERE id = :id');

        return $statement->execute(['id' => $id]);
    }

    public function likeArticle(int $userId, int $articleId): bool
    {
        $statement = $this->db->prepare(
            'INSERT IGNORE INTO article_likes (user_id, article_id) VALUES (:user_id, :article_id)'
        );

        return $statement->execute(['user_id' => $userId, 'article_id' => $articleId]);
    }

    public function unlikeArticle(int $userId, int $articleId): bool
    {
        $statement = $this->db->prepare(
            'DELETE FROM article_likes WHERE user_id = :user_id AND article_id = :article_id'
        );

        return $statement->execute(['user_id' => $userId, 'article_id' => $articleId]);
    }

    public function bookmarkArticle(int $userId, int $articleId): bool
    {
        $statement = $this->db->prepare(
            'INSERT IGNORE INTO bookmarks (user_id, article_id) VALUES (:user_id, :article_id)'
        );

        return $statement->execute(['user_id' => $userId, 'article_id' => $articleId]);
    }

    public function removeBookmark(int $userId, int $articleId): bool
    {
        $statement = $this->db->prepare(
            'DELETE FROM bookmarks WHERE user_id = :user_id AND article_id = :article_id'
        );

        return $statement->execute(['user_id' => $userId, 'article_id' => $articleId]);
    }

    public function likeComment(int $commentId): int
    {
        $statement = $this->db->prepare('UPDATE comments SET likes = likes + 1 WHERE id = :id');
        $statement->execute(['id' => $commentId]);

        $fetch = $this->db->prepare('SELECT likes FROM comments WHERE id = :id LIMIT 1');
        $fetch->execute(['id' => $commentId]);
        $row = $fetch->fetch();

        return (int) ($row['likes'] ?? 0);
    }

    public function articleExists(int $articleId): bool
    {
        $statement = $this->db->prepare('SELECT id FROM articles WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $articleId]);

        return $statement->fetch() !== false;
    }

    private function formatComment(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'article_id' => (int) $row['article_id'],
            'parent_id' => $row['parent_id'] !== null ? (int) $row['parent_id'] : null,
            'content' => (string) $row['content'],
            'likes' => (int) ($row['likes'] ?? 0),
            'is_approved' => (bool) ($row['is_approved'] ?? true),
            'author' => [
                'id' => (int) $row['user_id'],
                'username' => (string) $row['username'],
                'full_name' => (string) ($row['full_name'] ?: $row['username']),
                'avatar' => (string) ($row['avatar'] ?? 'default-avatar.png'),
            ],
            'replies' => [],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
