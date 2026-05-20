<?php

declare(strict_types=1);

namespace App\Helpers;

class Str
{
    public static function slug(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9]+/i', '-', $value) ?? '';
        $value = trim($value, '-');

        return $value !== '' ? $value : 'item';
    }

    public static function uniqueSlug(\PDO $db, string $table, string $column, string $title, ?int $ignoreId = null): string
    {
        $base = self::slug($title);
        $slug = $base;
        $suffix = 2;

        while (self::slugExists($db, $table, $column, $slug, $ignoreId)) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    private static function slugExists(\PDO $db, string $table, string $column, string $slug, ?int $ignoreId): bool
    {
        $allowedTables = ['articles', 'forum_topics', 'events'];
        if (!in_array($table, $allowedTables, true)) {
            return false;
        }

        $sql = "SELECT id FROM {$table} WHERE {$column} = :slug";
        $params = ['slug' => $slug];

        if ($ignoreId !== null) {
            $sql .= ' AND id != :ignore_id';
            $params['ignore_id'] = $ignoreId;
        }

        $sql .= ' LIMIT 1';

        $statement = $db->prepare($sql);
        $statement->execute($params);

        return $statement->fetch() !== false;
    }
}
