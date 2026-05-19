<?php

declare(strict_types=1);

namespace App\Models;

use App\Helpers\Str;
use App\Support\Database;
use PDO;

class Forum
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function topics(array $filters = []): array
    {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['category'])) {
            $where[] = 'ft.category = :category';
            $params['category'] = (string) $filters['category'];
        }

        if (!empty($filters['q'])) {
            $where[] = '(ft.title LIKE :search OR ft.content LIKE :search)';
            $params['search'] = '%' . (string) $filters['q'] . '%';
        }

        $whereSql = implode(' AND ', $where);
        $limit = max(1, min(100, (int) ($filters['limit'] ?? 50)));

        $sql = "SELECT ft.*, u.username, u.full_name, u.avatar,
                       (SELECT COUNT(*) FROM forum_replies fr WHERE fr.topic_id = ft.id) AS reply_count
                FROM forum_topics ft
                INNER JOIN users u ON u.id = ft.author_id
                WHERE {$whereSql}
                ORDER BY ft.is_pinned DESC, ft.updated_at DESC
                LIMIT :limit";

        $statement = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $statement->bindValue($key, $value);
        }
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return array_map([$this, 'formatTopic'], $statement->fetchAll() ?: []);
    }

    public function findTopic(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT ft.*, u.username, u.full_name, u.avatar,
                    (SELECT COUNT(*) FROM forum_replies fr WHERE fr.topic_id = ft.id) AS reply_count
             FROM forum_topics ft
             INNER JOIN users u ON u.id = ft.author_id
             WHERE ft.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        if ($row === false) {
            return null;
        }

        $this->incrementTopicViews($id);

        return $this->formatTopic($row);
    }

    public function createTopic(int $authorId, array $data): array
    {
        $title = trim((string) $data['title']);
        $slug = Str::uniqueSlug($this->db, 'forum_topics', 'slug', $title);

        $statement = $this->db->prepare(
            'INSERT INTO forum_topics (title, slug, content, author_id, category)
             VALUES (:title, :slug, :content, :author_id, :category)'
        );
        $statement->execute([
            'title' => $title,
            'slug' => $slug,
            'content' => trim((string) $data['content']),
            'author_id' => $authorId,
            'category' => $data['category'] ?? 'general',
        ]);

        return $this->findTopic((int) $this->db->lastInsertId()) ?? [];
    }

    public function replies(int $topicId): array
    {
        $statement = $this->db->prepare(
            'SELECT fr.*, u.username, u.full_name, u.avatar
             FROM forum_replies fr
             INNER JOIN users u ON u.id = fr.user_id
             WHERE fr.topic_id = :topic_id
             ORDER BY fr.is_solution DESC, fr.created_at ASC'
        );
        $statement->execute(['topic_id' => $topicId]);

        return array_map([$this, 'formatReply'], $statement->fetchAll() ?: []);
    }

    public function createReply(int $topicId, int $userId, string $content): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO forum_replies (topic_id, user_id, content)
             VALUES (:topic_id, :user_id, :content)'
        );
        $statement->execute([
            'topic_id' => $topicId,
            'user_id' => $userId,
            'content' => $content,
        ]);

        $this->db->prepare('UPDATE forum_topics SET updated_at = NOW() WHERE id = :id')
            ->execute(['id' => $topicId]);

        return $this->findReply((int) $this->db->lastInsertId()) ?? [];
    }

    public function findReply(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT fr.*, u.username, u.full_name, u.avatar
             FROM forum_replies fr
             INNER JOIN users u ON u.id = fr.user_id
             WHERE fr.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        return $row !== false ? $this->formatReply($row) : null;
    }

    public function updateReply(int $id, string $content, bool $isSolution = false): ?array
    {
        $statement = $this->db->prepare(
            'UPDATE forum_replies SET content = :content, is_solution = :is_solution, updated_at = NOW()
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'content' => $content,
            'is_solution' => $isSolution ? 1 : 0,
        ]);

        return $this->findReply($id);
    }

    private function incrementTopicViews(int $id): void
    {
        $statement = $this->db->prepare('UPDATE forum_topics SET views = views + 1 WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    private function formatTopic(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'slug' => (string) $row['slug'],
            'content' => (string) $row['content'],
            'category' => (string) $row['category'],
            'views' => (int) ($row['views'] ?? 0),
            'is_pinned' => (bool) ($row['is_pinned'] ?? false),
            'is_locked' => (bool) ($row['is_locked'] ?? false),
            'reply_count' => (int) ($row['reply_count'] ?? 0),
            'author' => [
                'id' => (int) $row['author_id'],
                'username' => (string) $row['username'],
                'full_name' => (string) ($row['full_name'] ?: $row['username']),
                'avatar' => (string) ($row['avatar'] ?? 'default-avatar.png'),
            ],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    private function formatReply(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'topic_id' => (int) $row['topic_id'],
            'content' => (string) $row['content'],
            'likes' => (int) ($row['likes'] ?? 0),
            'is_solution' => (bool) ($row['is_solution'] ?? false),
            'author' => [
                'id' => (int) $row['user_id'],
                'username' => (string) $row['username'],
                'full_name' => (string) ($row['full_name'] ?: $row['username']),
                'avatar' => (string) ($row['avatar'] ?? 'default-avatar.png'),
            ],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
