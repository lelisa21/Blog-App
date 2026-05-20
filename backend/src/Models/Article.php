<?php

declare(strict_types=1);

namespace App\Models;

use App\Helpers\Str;
use App\Support\Database;
use PDO;

class Article
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function paginate(array $filters = [], ?int $viewerId = null): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = max(1, min(50, (int) ($filters['per_page'] ?? 12)));
        $offset = ($page - 1) * $perPage;

        $where = ['1=1'];
        $params = [];

        $status = $filters['status'] ?? 'published';
        if ($status !== 'all' && $status !== '') {
            $where[] = 'a.status = :status';
            $params['status'] = (string) $status;
        }

        if (!empty($filters['category_id'])) {
            $where[] = 'a.category_id = :category_id';
            $params['category_id'] = (int) $filters['category_id'];
        }

        if (!empty($filters['category_slug'])) {
            $where[] = 'c.slug = :category_slug';
            $params['category_slug'] = (string) $filters['category_slug'];
        }

        if (!empty($filters['author_id'])) {
            $where[] = 'a.author_id = :author_id';
            $params['author_id'] = (int) $filters['author_id'];
        }

        if (!empty($filters['tag_slug'])) {
            $where[] = 'EXISTS (
                SELECT 1 FROM article_tags at
                INNER JOIN tags t ON t.id = at.tag_id
                WHERE at.article_id = a.id AND t.slug = :tag_slug
            )';
            $params['tag_slug'] = (string) $filters['tag_slug'];
        }

        if (!empty($filters['q'])) {
            $where[] = 'MATCH(a.title, a.content, a.excerpt) AGAINST(:search IN NATURAL LANGUAGE MODE)';
            $params['search'] = (string) $filters['q'];
        }

        if (!empty($filters['max_reading_time'])) {
            $where[] = 'a.reading_time <= :max_reading_time';
            $params['max_reading_time'] = (int) $filters['max_reading_time'];
        }

        $whereSql = implode(' AND ', $where);
        $orderBy = $this->resolveSort((string) ($filters['sort'] ?? 'newest'));

        $countSql = "SELECT COUNT(DISTINCT a.id) AS total
                     FROM articles a
                     LEFT JOIN categories c ON c.id = a.category_id
                     WHERE {$whereSql}";
        $countStatement = $this->db->prepare($countSql);
        $countStatement->execute($params);
        $total = (int) ($countStatement->fetch()['total'] ?? 0);

        $sql = "SELECT a.*,
                       u.username AS author_username,
                       u.full_name AS author_full_name,
                       u.avatar AS author_avatar,
                       c.name AS category_name,
                       c.slug AS category_slug,
                       (SELECT COUNT(*) FROM article_likes al WHERE al.article_id = a.id) AS like_count,
                       (SELECT COUNT(*) FROM comments cm WHERE cm.article_id = a.id AND cm.is_approved = TRUE) AS comment_count
                FROM articles a
                INNER JOIN users u ON u.id = a.author_id
                LEFT JOIN categories c ON c.id = a.category_id
                WHERE {$whereSql}
                ORDER BY {$orderBy}
                LIMIT :limit OFFSET :offset";

        $statement = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $statement->bindValue($key, $value);
        }
        $statement->bindValue('limit', $perPage, PDO::PARAM_INT);
        $statement->bindValue('offset', $offset, PDO::PARAM_INT);
        $statement->execute();

        $rows = $statement->fetchAll() ?: [];
        $articles = [];

        foreach ($rows as $row) {
            $articles[] = $this->formatListItem($row, $viewerId);
        }

        return [
            'articles' => $articles,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $perPage > 0 ? (int) ceil($total / $perPage) : 0,
            ],
        ];
    }

    public function findById(int $id, ?int $viewerId = null, bool $includeDrafts = false): ?array
    {
        $sql = 'SELECT a.*,
                       u.username AS author_username,
                       u.full_name AS author_full_name,
                       u.avatar AS author_avatar,
                       u.email AS author_email,
                       u.bio AS author_bio,
                       u.location AS author_location,
                       u.skill_level AS author_skill_level,
                       c.id AS category_id_value,
                       c.name AS category_name,
                       c.slug AS category_slug,
                       (SELECT COUNT(*) FROM article_likes al WHERE al.article_id = a.id) AS like_count,
                       (SELECT COUNT(*) FROM comments cm WHERE cm.article_id = a.id AND cm.is_approved = TRUE) AS comment_count
                FROM articles a
                INNER JOIN users u ON u.id = a.author_id
                LEFT JOIN categories c ON c.id = a.category_id
                WHERE a.id = :id';

        if (!$includeDrafts) {
            $sql .= " AND a.status = 'published'";
        }

        $sql .= ' LIMIT 1';

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        if ($row === false) {
            return null;
        }

        return $this->formatDetail($row, $viewerId);
    }

    public function findBySlug(string $slug, ?int $viewerId = null): ?array
    {
        $statement = $this->db->prepare('SELECT id FROM articles WHERE slug = :slug LIMIT 1');
        $statement->execute(['slug' => $slug]);
        $row = $statement->fetch();

        if ($row === false) {
            return null;
        }

        return $this->findById((int) $row['id'], $viewerId);
    }

    public function create(array $data): array
    {
        $title = trim((string) $data['title']);
        $slug = !empty($data['slug'])
            ? Str::slug((string) $data['slug'])
            : Str::uniqueSlug($this->db, 'articles', 'slug', $title);

        $statement = $this->db->prepare(
            'INSERT INTO articles (
                title, slug, excerpt, content, featured_image, author_id, category_id,
                reading_time, status, published_at
            ) VALUES (
                :title, :slug, :excerpt, :content, :featured_image, :author_id, :category_id,
                :reading_time, :status, :published_at
            )'
        );

        $status = (string) ($data['status'] ?? 'draft');
        $publishedAt = $status === 'published' ? ($data['published_at'] ?? date('Y-m-d H:i:s')) : null;

        $statement->execute([
            'title' => $title,
            'slug' => $slug,
            'excerpt' => $data['excerpt'] ?? null,
            'content' => (string) $data['content'],
            'featured_image' => $data['featured_image'] ?? null,
            'author_id' => (int) $data['author_id'],
            'category_id' => !empty($data['category_id']) ? (int) $data['category_id'] : null,
            'reading_time' => (int) ($data['reading_time'] ?? $this->estimateReadingTime((string) $data['content'])),
            'status' => $status,
            'published_at' => $publishedAt,
        ]);

        $id = (int) $this->db->lastInsertId();
        $this->syncTags($id, $data['tag_ids'] ?? [], $data['tags'] ?? []);

        return $this->findById($id, null, true) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $current = $this->findById($id, null, true);
        if ($current === null) {
            return null;
        }

        $title = trim((string) ($data['title'] ?? $current['title']));
        $slug = isset($data['slug'])
            ? Str::slug((string) $data['slug'])
            : (isset($data['title']) ? Str::uniqueSlug($this->db, 'articles', 'slug', $title, $id) : $current['slug']);

        if ($slug !== $current['slug'] && $this->slugTaken($slug, $id)) {
            $slug = Str::uniqueSlug($this->db, 'articles', 'slug', $title, $id);
        }

        $status = (string) ($data['status'] ?? $current['status']);
        $publishedAt = $current['published_at'];
        if ($status === 'published' && empty($publishedAt)) {
            $publishedAt = date('Y-m-d H:i:s');
        }

        $statement = $this->db->prepare(
            'UPDATE articles SET
                title = :title,
                slug = :slug,
                excerpt = :excerpt,
                content = :content,
                featured_image = :featured_image,
                category_id = :category_id,
                reading_time = :reading_time,
                status = :status,
                published_at = :published_at,
                updated_at = NOW()
             WHERE id = :id'
        );

        $content = (string) ($data['content'] ?? $current['content']);

        $statement->execute([
            'id' => $id,
            'title' => $title,
            'slug' => $slug,
            'excerpt' => $data['excerpt'] ?? $current['excerpt'],
            'content' => $content,
            'featured_image' => $data['featured_image'] ?? $current['featured_image'],
            'category_id' => array_key_exists('category_id', $data)
                ? ($data['category_id'] !== null ? (int) $data['category_id'] : null)
                : ($current['category']['id'] ?? null),
            'reading_time' => (int) ($data['reading_time'] ?? $this->estimateReadingTime($content)),
            'status' => $status,
            'published_at' => $publishedAt,
        ]);

        if (array_key_exists('tag_ids', $data) || array_key_exists('tags', $data)) {
            $this->syncTags($id, $data['tag_ids'] ?? [], $data['tags'] ?? []);
        }

        return $this->findById($id, null, true);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM articles WHERE id = :id');

        return $statement->execute(['id' => $id]);
    }

    public function incrementViews(int $id): void
    {
        $statement = $this->db->prepare('UPDATE articles SET views = views + 1 WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    public function categories(): array
    {
        $statement = $this->db->query(
            'SELECT c.*, COUNT(a.id) AS article_count
             FROM categories c
             LEFT JOIN articles a ON a.category_id = c.id AND a.status = \'published\'
             GROUP BY c.id
             ORDER BY c.name ASC'
        );

        return array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'name' => (string) $row['name'],
                'slug' => (string) $row['slug'],
                'description' => (string) ($row['description'] ?? ''),
                'icon_class' => $row['icon_class'] ?? null,
                'article_count' => (int) ($row['article_count'] ?? 0),
            ];
        }, $statement->fetchAll() ?: []);
    }

    public function tags(): array
    {
        $statement = $this->db->query(
            'SELECT t.*, COUNT(at.article_id) AS article_count
             FROM tags t
             LEFT JOIN article_tags at ON at.tag_id = t.id
             GROUP BY t.id
             ORDER BY article_count DESC, t.name ASC'
        );

        return array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'name' => (string) $row['name'],
                'slug' => (string) $row['slug'],
                'article_count' => (int) ($row['article_count'] ?? 0),
            ];
        }, $statement->fetchAll() ?: []);
    }

    public function search(string $query, int $limit = 20): array
    {
        $result = $this->paginate([
            'q' => $query,
            'per_page' => $limit,
            'page' => 1,
            'status' => 'published',
        ]);

        return $result['articles'];
    }

    private function syncTags(int $articleId, array $tagIds, array $tagNames): void
    {
        $ids = array_map('intval', $tagIds);

        foreach ($tagNames as $name) {
            $name = trim((string) $name);
            if ($name === '') {
                continue;
            }

            $slug = Str::slug($name);
            $statement = $this->db->prepare(
                'INSERT INTO tags (name, slug) VALUES (:name, :slug)
                 ON DUPLICATE KEY UPDATE name = VALUES(name)'
            );
            $statement->execute(['name' => $name, 'slug' => $slug]);

            $tagStatement = $this->db->prepare('SELECT id FROM tags WHERE slug = :slug LIMIT 1');
            $tagStatement->execute(['slug' => $slug]);
            $tag = $tagStatement->fetch();
            if ($tag !== false) {
                $ids[] = (int) $tag['id'];
            }
        }

        $ids = array_values(array_unique(array_filter($ids)));

        $delete = $this->db->prepare('DELETE FROM article_tags WHERE article_id = :article_id');
        $delete->execute(['article_id' => $articleId]);

        if ($ids === []) {
            return;
        }

        $insert = $this->db->prepare(
            'INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (:article_id, :tag_id)'
        );

        foreach ($ids as $tagId) {
            $insert->execute(['article_id' => $articleId, 'tag_id' => $tagId]);
        }
    }

    private function tagsForArticle(int $articleId): array
    {
        $statement = $this->db->prepare(
            'SELECT t.id, t.name, t.slug
             FROM tags t
             INNER JOIN article_tags at ON at.tag_id = t.id
             WHERE at.article_id = :article_id
             ORDER BY t.name ASC'
        );
        $statement->execute(['article_id' => $articleId]);

        return array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'name' => (string) $row['name'],
                'slug' => (string) $row['slug'],
            ];
        }, $statement->fetchAll() ?: []);
    }

    private function viewerFlags(int $articleId, ?int $viewerId): array
    {
        if ($viewerId === null) {
            return ['liked' => false, 'bookmarked' => false];
        }

        $like = $this->db->prepare(
            'SELECT 1 FROM article_likes WHERE user_id = :user_id AND article_id = :article_id LIMIT 1'
        );
        $like->execute(['user_id' => $viewerId, 'article_id' => $articleId]);

        $bookmark = $this->db->prepare(
            'SELECT 1 FROM bookmarks WHERE user_id = :user_id AND article_id = :article_id LIMIT 1'
        );
        $bookmark->execute(['user_id' => $viewerId, 'article_id' => $articleId]);

        return [
            'liked' => $like->fetch() !== false,
            'bookmarked' => $bookmark->fetch() !== false,
        ];
    }

    private function formatListItem(array $row, ?int $viewerId): array
    {
        $flags = $this->viewerFlags((int) $row['id'], $viewerId);

        return [
            'id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'slug' => (string) $row['slug'],
            'excerpt' => (string) ($row['excerpt'] ?? ''),
            'featured_image' => $row['featured_image'] ?? null,
            'author' => [
                'id' => (int) $row['author_id'],
                'username' => (string) $row['author_username'],
                'full_name' => (string) ($row['author_full_name'] ?: $row['author_username']),
                'avatar' => (string) ($row['author_avatar'] ?? 'default-avatar.png'),
            ],
            'category' => !empty($row['category_slug'])
                ? [
                    'id' => (int) ($row['category_id'] ?? 0),
                    'name' => (string) $row['category_name'],
                    'slug' => (string) $row['category_slug'],
                ]
                : null,
            'tags' => $this->tagsForArticle((int) $row['id']),
            'reading_time' => (int) ($row['reading_time'] ?? 5),
            'views' => (int) ($row['views'] ?? 0),
            'status' => (string) $row['status'],
            'like_count' => (int) ($row['like_count'] ?? 0),
            'comment_count' => (int) ($row['comment_count'] ?? 0),
            'liked' => $flags['liked'],
            'bookmarked' => $flags['bookmarked'],
            'published_at' => $row['published_at'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    private function formatDetail(array $row, ?int $viewerId): array
    {
        $item = $this->formatListItem($row, $viewerId);
        $item['content'] = (string) $row['content'];
        $item['author']['email'] = (string) $row['author_email'];
        $item['author']['bio'] = (string) ($row['author_bio'] ?? '');
        $item['author']['location'] = (string) ($row['author_location'] ?? '');
        $item['author']['skill_level'] = (string) ($row['author_skill_level'] ?? 'beginner');

        if (!empty($row['category_id_value'])) {
            $item['category'] = [
                'id' => (int) $row['category_id_value'],
                'name' => (string) $row['category_name'],
                'slug' => (string) $row['category_slug'],
            ];
        }

        return $item;
    }

    private function resolveSort(string $sort): string
    {
        return match ($sort) {
            'oldest' => 'a.published_at ASC, a.created_at ASC',
            'popular' => 'like_count DESC, a.views DESC',
            'views' => 'a.views DESC',
            default => 'a.published_at DESC, a.created_at DESC',
        };
    }

    private function estimateReadingTime(string $content): int
    {
        $words = str_word_count(strip_tags($content));

        return max(1, (int) ceil($words / 200));
    }

    private function slugTaken(string $slug, int $ignoreId): bool
    {
        $statement = $this->db->prepare('SELECT id FROM articles WHERE slug = :slug AND id != :id LIMIT 1');
        $statement->execute(['slug' => $slug, 'id' => $ignoreId]);

        return $statement->fetch() !== false;
    }
}
