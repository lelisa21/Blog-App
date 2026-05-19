<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Database;
use PDO;

class Resource
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function all(array $filters = []): array
    {
        $sql = 'SELECT r.id, r.title, r.description, r.type, r.file_path, r.download_url,
                       r.file_size, r.download_count, r.average_rating, r.category,
                       r.is_featured, r.created_at, r.updated_at,
                       u.username AS uploaded_by_username
                FROM resources r
                INNER JOIN users u ON u.id = r.uploaded_by
                WHERE 1=1';
        $params = [];

        if (!empty($filters['type'])) {
            $sql .= ' AND r.type = :type';
            $params['type'] = $filters['type'];
        }

        if (!empty($filters['category'])) {
            $sql .= ' AND r.category = :category';
            $params['category'] = $filters['category'];
        }

        if (isset($filters['featured'])) {
            $sql .= ' AND r.is_featured = :featured';
            $params['featured'] = $filters['featured'] ? 1 : 0;
        }

        if (!empty($filters['exclude_category_prefix'])) {
            $sql .= ' AND r.category NOT LIKE :exclude_prefix';
            $params['exclude_prefix'] = $filters['exclude_category_prefix'] . '%';
        }

        $sql .= ' ORDER BY r.is_featured DESC, r.download_count DESC, r.title ASC';

        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return array_map([$this, 'formatResource'], $statement->fetchAll() ?: []);
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT r.*, u.username AS uploaded_by_username
             FROM resources r
             INNER JOIN users u ON u.id = r.uploaded_by
             WHERE r.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        return $row !== false ? $this->formatResource($row) : null;
    }

    public function findByCategory(string $category): ?array
    {
        $statement = $this->db->prepare(
            'SELECT r.*, u.username AS uploaded_by_username
             FROM resources r
             INNER JOIN users u ON u.id = r.uploaded_by
             WHERE r.category = :category
             LIMIT 1'
        );
        $statement->execute(['category' => $category]);
        $row = $statement->fetch();

        return $row !== false ? $this->formatResource($row) : null;
    }

    public function incrementDownloadCount(int $id): ?array
    {
        $statement = $this->db->prepare(
            'UPDATE resources SET download_count = download_count + 1 WHERE id = :id'
        );
        $statement->execute(['id' => $id]);

        return $this->findById($id);
    }

    public function rate(int $resourceId, int $userId, int $rating, ?string $review = null): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO resource_ratings (resource_id, user_id, rating, review)
             VALUES (:resource_id, :user_id, :rating, :review)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)'
        );
        $statement->execute([
            'resource_id' => $resourceId,
            'user_id' => $userId,
            'rating' => $rating,
            'review' => $review,
        ]);

        $this->refreshAverageRating($resourceId);

        return $this->userRating($resourceId, $userId);
    }

    public function userRating(int $resourceId, int $userId): array
    {
        $statement = $this->db->prepare(
            'SELECT rating, review, created_at FROM resource_ratings
             WHERE resource_id = :resource_id AND user_id = :user_id
             LIMIT 1'
        );
        $statement->execute([
            'resource_id' => $resourceId,
            'user_id' => $userId,
        ]);
        $row = $statement->fetch();

        $resource = $this->findById($resourceId);

        return [
            'resource_id' => $resourceId,
            'user_rating' => $row !== false ? (int) $row['rating'] : null,
            'review' => $row['review'] ?? null,
            'average_rating' => $resource['average_rating'] ?? 0,
        ];
    }

    public function saveProgress(int $userId, int $resourceId, int $progressPercent): array
    {
        $progressPercent = max(0, min(100, $progressPercent));
        $completedAt = $progressPercent >= 100 ? date('Y-m-d H:i:s') : null;

        $statement = $this->db->prepare(
            'INSERT INTO user_learning_progress (user_id, resource_id, progress_percent, completed_at, last_accessed)
             VALUES (:user_id, :resource_id, :progress_percent, :completed_at, NOW())
             ON DUPLICATE KEY UPDATE
                progress_percent = VALUES(progress_percent),
                completed_at = VALUES(completed_at),
                last_accessed = NOW()'
        );
        $statement->execute([
            'user_id' => $userId,
            'resource_id' => $resourceId,
            'progress_percent' => $progressPercent,
            'completed_at' => $completedAt,
        ]);

        return $this->progressForUser($userId, $resourceId);
    }

    public function progressForUser(int $userId, int $resourceId): array
    {
        $statement = $this->db->prepare(
            'SELECT progress_percent, completed_at, last_accessed
             FROM user_learning_progress
             WHERE user_id = :user_id AND resource_id = :resource_id
             LIMIT 1'
        );
        $statement->execute([
            'user_id' => $userId,
            'resource_id' => $resourceId,
        ]);
        $row = $statement->fetch();

        return [
            'user_id' => $userId,
            'resource_id' => $resourceId,
            'progress_percent' => $row !== false ? (int) $row['progress_percent'] : 0,
            'completed_at' => $row['completed_at'] ?? null,
            'last_accessed' => $row['last_accessed'] ?? null,
        ];
    }

    public function createContactMessage(array $data): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO contact_messages (name, email, subject, message, user_agent, ip_address)
             VALUES (:name, :email, :subject, :message, :user_agent, :ip_address)'
        );
        $statement->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'],
            'message' => $data['message'],
            'user_agent' => $data['user_agent'] ?? null,
            'ip_address' => $data['ip_address'] ?? null,
        ]);

        $id = (int) $this->db->lastInsertId();

        return $this->findContactMessage($id) ?? [];
    }

    public function contactMessages(int $limit = 50): array
    {
        $statement = $this->db->prepare(
            'SELECT id, name, email, subject, message, is_read, replied_at, created_at
             FROM contact_messages
             ORDER BY created_at DESC
             LIMIT :limit'
        );
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'name' => (string) $row['name'],
                'email' => (string) $row['email'],
                'subject' => (string) $row['subject'],
                'message' => (string) $row['message'],
                'is_read' => (bool) $row['is_read'],
                'replied_at' => $row['replied_at'],
                'created_at' => $row['created_at'],
            ];
        }, $statement->fetchAll() ?: []);
    }

    public function findContactMessage(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT id, name, email, subject, message, is_read, replied_at, created_at
             FROM contact_messages WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        if ($row === false) {
            return null;
        }

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'subject' => (string) $row['subject'],
            'message' => (string) $row['message'],
            'is_read' => (bool) $row['is_read'],
            'replied_at' => $row['replied_at'],
            'created_at' => $row['created_at'],
        ];
    }

    public function sitePage(string $slug): ?array
    {
        $statement = $this->db->prepare(
            'SELECT slug, title, meta_description, content, updated_at
             FROM site_pages WHERE slug = :slug LIMIT 1'
        );
        $statement->execute(['slug' => $slug]);
        $row = $statement->fetch();

        if ($row === false) {
            return null;
        }

        $content = json_decode((string) $row['content'], true);

        return [
            'slug' => (string) $row['slug'],
            'title' => (string) $row['title'],
            'meta_description' => (string) ($row['meta_description'] ?? ''),
            'content' => is_array($content) ? $content : [],
            'updated_at' => $row['updated_at'],
        ];
    }

    private function refreshAverageRating(int $resourceId): void
    {
        $statement = $this->db->prepare(
            'UPDATE resources
             SET average_rating = (
                 SELECT COALESCE(ROUND(AVG(rating), 2), 0)
                 FROM resource_ratings
                 WHERE resource_id = :resource_id
             )
             WHERE id = :resource_id'
        );
        $statement->execute(['resource_id' => $resourceId]);
    }

    private function formatResource(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'description' => (string) ($row['description'] ?? ''),
            'type' => (string) $row['type'],
            'file_path' => $row['file_path'] ?? null,
            'download_url' => $row['download_url'] ?? null,
            'file_size' => isset($row['file_size']) ? (int) $row['file_size'] : null,
            'download_count' => (int) ($row['download_count'] ?? 0),
            'average_rating' => (float) ($row['average_rating'] ?? 0),
            'category' => (string) ($row['category'] ?? ''),
            'is_featured' => (bool) ($row['is_featured'] ?? false),
            'uploaded_by_username' => $row['uploaded_by_username'] ?? null,
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null,
        ];
    }
}
