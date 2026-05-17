<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Database;
use PDO;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function create(array $data): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO users (username, email, password_hash, full_name, bio, location, skill_level, last_login)
             VALUES (:username, :email, :password_hash, :full_name, :bio, :location, :skill_level, NOW())'
        );

        $statement->execute([
            'username' => $data['username'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'full_name' => $data['full_name'] ?? null,
            'bio' => $data['bio'] ?? null,
            'location' => $data['location'] ?? null,
            'skill_level' => $data['skill_level'] ?? 'beginner',
        ]);

        return $this->findById((int) $this->db->lastInsertId()) ?? [];
    }

    public function findByEmail(string $email): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $statement->execute(['email' => $email]);

        $user = $statement->fetch();

        return $user !== false ? $user : null;
    }

    public function findById(int $id): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $id]);

        $user = $statement->fetch();

        return $user !== false ? $user : null;
    }

    public function existsByUsername(string $username): bool
    {
        $statement = $this->db->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
        $statement->execute(['username' => $username]);

        return $statement->fetch() !== false;
    }

    public function existsByEmail(string $email): bool
    {
        $statement = $this->db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $statement->execute(['email' => $email]);

        return $statement->fetch() !== false;
    }

    public function touchLastLogin(int $userId): void
    {
        $statement = $this->db->prepare('UPDATE users SET last_login = NOW() WHERE id = :id');
        $statement->execute(['id' => $userId]);
    }

    public function updateProfile(int $userId, array $data): ?array
    {
        $current = $this->findById($userId);
        if ($current === null) {
            return null;
        }

        $email = strtolower(trim((string) ($data['email'] ?? $current['email'])));
        $emailOwner = $this->findByEmail($email);
        if ($emailOwner !== null && (int) $emailOwner['id'] !== $userId) {
            return null;
        }

        $statement = $this->db->prepare(
            'UPDATE users
             SET username = :username,
                 email = :email,
                 full_name = :full_name,
                 bio = :bio,
                 location = :location,
                 skill_level = :skill_level,
                 updated_at = NOW()
             WHERE id = :id'
        );

        $statement->execute([
            'id' => $userId,
            'username' => trim((string) ($data['username'] ?? $current['username'])),
            'email' => $email,
            'full_name' => trim((string) ($data['full_name'] ?? $current['full_name'])),
            'bio' => trim((string) ($data['bio'] ?? $current['bio'])),
            'location' => trim((string) ($data['location'] ?? $current['location'])),
            'skill_level' => $data['skill_level'] ?? $current['skill_level'],
        ]);

        return $this->findById($userId);
    }

    public function settings(int $userId): array
    {
        $statement = $this->db->prepare('SELECT * FROM user_settings WHERE user_id = :user_id LIMIT 1');
        $statement->execute(['user_id' => $userId]);
        $settings = $statement->fetch();

        if ($settings === false) {
            return $this->defaultSettings($userId);
        }

        return $this->normalizeSettings($settings);
    }

    public function updateSettings(int $userId, array $settings): array
    {
        $defaults = $this->defaultSettings($userId);
        $merged = array_merge($defaults, array_intersect_key($settings, $defaults));

        $statement = $this->db->prepare(
            'INSERT INTO user_settings (
                user_id,
                email_notifications,
                push_notifications,
                two_factor_auth,
                theme,
                font_size,
                language,
                profile_visibility,
                activity_visibility
            ) VALUES (
                :user_id,
                :email_notifications,
                :push_notifications,
                :two_factor_auth,
                :theme,
                :font_size,
                :language,
                :profile_visibility,
                :activity_visibility
            )
            ON DUPLICATE KEY UPDATE
                email_notifications = VALUES(email_notifications),
                push_notifications = VALUES(push_notifications),
                two_factor_auth = VALUES(two_factor_auth),
                theme = VALUES(theme),
                font_size = VALUES(font_size),
                language = VALUES(language),
                profile_visibility = VALUES(profile_visibility),
                activity_visibility = VALUES(activity_visibility)'
        );

        $statement->execute([
            'user_id' => $userId,
            'email_notifications' => $merged['email_notifications'] ? 1 : 0,
            'push_notifications' => $merged['push_notifications'] ? 1 : 0,
            'two_factor_auth' => $merged['two_factor_auth'] ? 1 : 0,
            'theme' => $merged['theme'],
            'font_size' => $merged['font_size'],
            'language' => $merged['language'],
            'profile_visibility' => $merged['profile_visibility'],
            'activity_visibility' => $merged['activity_visibility'] ? 1 : 0,
        ]);

        return $this->settings($userId);
    }

    public function createSession(int $userId, string $sessionToken, string $expiresAt, ?string $ipAddress, ?string $userAgent): void
    {
        $statement = $this->db->prepare(
            'INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
             VALUES (:user_id, :session_token, :ip_address, :user_agent, :expires_at)'
        );

        $statement->execute([
            'user_id' => $userId,
            'session_token' => hash('sha256', $sessionToken),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'expires_at' => $expiresAt,
        ]);
    }

    public function findSession(string $sessionToken): ?array
    {
        $statement = $this->db->prepare(
            'SELECT us.*, u.id AS user_id_value, u.username, u.email, u.full_name, u.avatar, u.bio, u.location, u.skill_level, u.created_at AS user_created_at, u.updated_at AS user_updated_at, u.last_login
             FROM user_sessions us
             INNER JOIN users u ON u.id = us.user_id
             WHERE us.session_token = :session_token AND us.expires_at > NOW()
             LIMIT 1'
        );
        $statement->execute([
            'session_token' => hash('sha256', $sessionToken),
        ]);

        $session = $statement->fetch();

        return $session !== false ? $session : null;
    }

    public function deleteSession(string $sessionToken): void
    {
        $statement = $this->db->prepare('DELETE FROM user_sessions WHERE session_token = :session_token');
        $statement->execute([
            'session_token' => hash('sha256', $sessionToken),
        ]);
    }

    public function deleteSessionsForUser(int $userId): void
    {
        $statement = $this->db->prepare('DELETE FROM user_sessions WHERE user_id = :user_id');
        $statement->execute(['user_id' => $userId]);
    }

    public function cleanupExpiredSessions(): void
    {
        $this->db->exec('DELETE FROM user_sessions WHERE expires_at <= NOW()');
    }

    public function subscribeToNewsletter(string $email): bool
    {
        $statement = $this->db->prepare(
            'INSERT INTO newsletter_subscribers (email, is_active)
             VALUES (:email, TRUE)
             ON DUPLICATE KEY UPDATE is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP'
        );

        return $statement->execute(['email' => $email]);
    }

    public function stats(): array
    {
        return [
            'students' => $this->countUsersBySkillLevel('beginner'),
            'developers' => $this->countActiveUsers(),
            'projects' => $this->countTable('articles'),
            'newsletter_subscribers' => $this->countTable('newsletter_subscribers', 'WHERE is_active = TRUE'),
            'mentors' => $this->countUsersBySkillLevel('advanced'),
            'universities' => 45,
            'github_repos' => 850,
        ];
    }

    private function countTable(string $table, string $where = ''): int
    {
        $statement = $this->db->query(sprintf('SELECT COUNT(*) AS aggregate_count FROM %s %s', $table, $where));
        $count = $statement->fetch();

        return (int) ($count['aggregate_count'] ?? 0);
    }

    private function countUsersBySkillLevel(string $skillLevel): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) AS aggregate_count FROM users WHERE skill_level = :skill_level');
        $statement->execute(['skill_level' => $skillLevel]);
        $count = $statement->fetch();

        return (int) ($count['aggregate_count'] ?? 0);
    }

    private function countActiveUsers(): int
    {
        $statement = $this->db->query('SELECT COUNT(*) AS aggregate_count FROM users WHERE is_active = TRUE');
        $count = $statement->fetch();

        return (int) ($count['aggregate_count'] ?? 0);
    }

    private function defaultSettings(int $userId): array
    {
        return [
            'user_id' => $userId,
            'email_notifications' => true,
            'push_notifications' => true,
            'two_factor_auth' => false,
            'theme' => 'dark',
            'font_size' => 'medium',
            'language' => 'en',
            'profile_visibility' => 'community',
            'activity_visibility' => true,
        ];
    }

    private function normalizeSettings(array $settings): array
    {
        return [
            'user_id' => (int) $settings['user_id'],
            'email_notifications' => (bool) $settings['email_notifications'],
            'push_notifications' => (bool) $settings['push_notifications'],
            'two_factor_auth' => (bool) $settings['two_factor_auth'],
            'theme' => (string) $settings['theme'],
            'font_size' => (string) $settings['font_size'],
            'language' => (string) $settings['language'],
            'profile_visibility' => (string) $settings['profile_visibility'],
            'activity_visibility' => (bool) $settings['activity_visibility'],
        ];
    }
}
