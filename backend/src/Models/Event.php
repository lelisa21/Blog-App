<?php

declare(strict_types=1);

namespace App\Models;

use App\Helpers\Str;
use App\Support\Database;
use PDO;

class Event
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function paginate(array $filters = [], ?int $viewerId = null): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = max(1, min(50, (int) ($filters['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        $where = ['1=1'];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'e.status = :status';
            $params['status'] = (string) $filters['status'];
        }

        if (!empty($filters['city'])) {
            $where[] = 'e.city = :city';
            $params['city'] = (string) $filters['city'];
        }

        if (!empty($filters['event_type'])) {
            $where[] = 'e.event_type = :event_type';
            $params['event_type'] = (string) $filters['event_type'];
        }

        if (!empty($filters['from'])) {
            $where[] = 'e.start_date >= :from_date';
            $params['from_date'] = (string) $filters['from'];
        }

        if (!empty($filters['to'])) {
            $where[] = 'e.end_date <= :to_date';
            $params['to_date'] = (string) $filters['to'];
        }

        $whereSql = implode(' AND ', $where);
        $orderBy = 'e.start_date ASC';

        $countStatement = $this->db->prepare("SELECT COUNT(*) AS total FROM events e WHERE {$whereSql}");
        $countStatement->execute($params);
        $total = (int) ($countStatement->fetch()['total'] ?? 0);

        $sql = "SELECT e.*, u.username AS organizer_username, u.full_name AS organizer_full_name,
                       (SELECT COUNT(*) FROM event_attendees ea
                        WHERE ea.event_id = e.id AND ea.status IN ('going', 'interested')) AS attendee_count
                FROM events e
                INNER JOIN users u ON u.id = e.organizer_id
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

        $events = [];
        foreach ($statement->fetchAll() ?: [] as $row) {
            $events[] = $this->formatEvent($row, $viewerId);
        }

        return [
            'events' => $events,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $perPage > 0 ? (int) ceil($total / $perPage) : 0,
            ],
        ];
    }

    public function calendar(string $from, string $to): array
    {
        $statement = $this->db->prepare(
            'SELECT e.id, e.title, e.slug, e.event_type, e.start_date, e.end_date, e.city, e.is_virtual, e.status
             FROM events e
             WHERE e.start_date >= :from_date AND e.start_date <= :to_date
             ORDER BY e.start_date ASC'
        );
        $statement->execute(['from_date' => $from, 'to_date' => $to]);

        return array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'title' => (string) $row['title'],
                'slug' => (string) $row['slug'],
                'event_type' => (string) $row['event_type'],
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'city' => $row['city'],
                'is_virtual' => (bool) $row['is_virtual'],
                'status' => (string) $row['status'],
            ];
        }, $statement->fetchAll() ?: []);
    }

    public function findById(int $id, ?int $viewerId = null): ?array
    {
        $statement = $this->db->prepare(
            'SELECT e.*, u.username AS organizer_username, u.full_name AS organizer_full_name,
                    (SELECT COUNT(*) FROM event_attendees ea
                     WHERE ea.event_id = e.id AND ea.status IN (\'going\', \'interested\')) AS attendee_count
             FROM events e
             INNER JOIN users u ON u.id = e.organizer_id
             WHERE e.id = :id
             LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();

        return $row !== false ? $this->formatEvent($row, $viewerId) : null;
    }

    public function create(array $data): array
    {
        $title = trim((string) $data['title']);
        $slug = Str::uniqueSlug($this->db, 'events', 'slug', $title);

        $statement = $this->db->prepare(
            'INSERT INTO events (
                title, slug, description, event_type, venue_name, city, address,
                latitude, longitude, is_virtual, meeting_link, start_date, end_date,
                capacity, registration_fee, organizer_id, status
            ) VALUES (
                :title, :slug, :description, :event_type, :venue_name, :city, :address,
                :latitude, :longitude, :is_virtual, :meeting_link, :start_date, :end_date,
                :capacity, :registration_fee, :organizer_id, :status
            )'
        );

        $statement->execute([
            'title' => $title,
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'event_type' => (string) $data['event_type'],
            'venue_name' => $data['venue_name'] ?? null,
            'city' => $data['city'] ?? null,
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'is_virtual' => !empty($data['is_virtual']) ? 1 : 0,
            'meeting_link' => $data['meeting_link'] ?? null,
            'start_date' => (string) $data['start_date'],
            'end_date' => (string) $data['end_date'],
            'capacity' => (int) ($data['capacity'] ?? 50),
            'registration_fee' => (float) ($data['registration_fee'] ?? 0),
            'organizer_id' => (int) $data['organizer_id'],
            'status' => $data['status'] ?? 'upcoming',
        ]);

        return $this->findById((int) $this->db->lastInsertId()) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $current = $this->findById($id);
        if ($current === null) {
            return null;
        }

        $title = trim((string) ($data['title'] ?? $current['title']));
        $slug = isset($data['title'])
            ? Str::uniqueSlug($this->db, 'events', 'slug', $title, $id)
            : $current['slug'];

        $statement = $this->db->prepare(
            'UPDATE events SET
                title = :title, slug = :slug, description = :description, event_type = :event_type,
                venue_name = :venue_name, city = :city, address = :address,
                latitude = :latitude, longitude = :longitude, is_virtual = :is_virtual,
                meeting_link = :meeting_link, start_date = :start_date, end_date = :end_date,
                capacity = :capacity, registration_fee = :registration_fee, status = :status,
                updated_at = NOW()
             WHERE id = :id'
        );

        $statement->execute([
            'id' => $id,
            'title' => $title,
            'slug' => $slug,
            'description' => $data['description'] ?? $current['description'],
            'event_type' => $data['event_type'] ?? $current['event_type'],
            'venue_name' => $data['venue_name'] ?? $current['venue_name'],
            'city' => $data['city'] ?? $current['city'],
            'address' => $data['address'] ?? $current['address'],
            'latitude' => $data['latitude'] ?? $current['latitude'],
            'longitude' => $data['longitude'] ?? $current['longitude'],
            'is_virtual' => array_key_exists('is_virtual', $data) ? ($data['is_virtual'] ? 1 : 0) : ($current['is_virtual'] ? 1 : 0),
            'meeting_link' => $data['meeting_link'] ?? $current['meeting_link'],
            'start_date' => $data['start_date'] ?? $current['start_date'],
            'end_date' => $data['end_date'] ?? $current['end_date'],
            'capacity' => (int) ($data['capacity'] ?? $current['capacity']),
            'registration_fee' => (float) ($data['registration_fee'] ?? $current['registration_fee']),
            'status' => $data['status'] ?? $current['status'],
        ]);

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM events WHERE id = :id');

        return $statement->execute(['id' => $id]);
    }

    public function rsvp(int $eventId, int $userId, string $status = 'going'): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO event_attendees (event_id, user_id, status)
             VALUES (:event_id, :user_id, :status)
             ON DUPLICATE KEY UPDATE status = VALUES(status), registered_at = CURRENT_TIMESTAMP'
        );
        $statement->execute([
            'event_id' => $eventId,
            'user_id' => $userId,
            'status' => $status,
        ]);

        return $this->attendeeRecord($eventId, $userId);
    }

    public function cancelRsvp(int $eventId, int $userId): bool
    {
        $statement = $this->db->prepare(
            'UPDATE event_attendees SET status = \'cancelled\' WHERE event_id = :event_id AND user_id = :user_id'
        );

        return $statement->execute(['event_id' => $eventId, 'user_id' => $userId]);
    }

    public function attendees(int $eventId): array
    {
        $statement = $this->db->prepare(
            'SELECT ea.*, u.username, u.full_name, u.avatar
             FROM event_attendees ea
             INNER JOIN users u ON u.id = ea.user_id
             WHERE ea.event_id = :event_id AND ea.status != \'cancelled\'
             ORDER BY ea.registered_at ASC'
        );
        $statement->execute(['event_id' => $eventId]);

        return array_map(static function (array $row): array {
            return [
                'user' => [
                    'id' => (int) $row['user_id'],
                    'username' => (string) $row['username'],
                    'full_name' => (string) ($row['full_name'] ?: $row['username']),
                    'avatar' => (string) ($row['avatar'] ?? 'default-avatar.png'),
                ],
                'status' => (string) $row['status'],
                'registered_at' => $row['registered_at'],
                'checked_in' => (bool) ($row['checked_in'] ?? false),
            ];
        }, $statement->fetchAll() ?: []);
    }

    public function setReminder(int $eventId, int $userId, string $reminderTime): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO event_reminders (event_id, user_id, reminder_time)
             VALUES (:event_id, :user_id, :reminder_time)'
        );
        $statement->execute([
            'event_id' => $eventId,
            'user_id' => $userId,
            'reminder_time' => $reminderTime,
        ]);

        return [
            'id' => (int) $this->db->lastInsertId(),
            'event_id' => $eventId,
            'user_id' => $userId,
            'reminder_time' => $reminderTime,
        ];
    }

    private function attendeeRecord(int $eventId, int $userId): array
    {
        $statement = $this->db->prepare(
            'SELECT status, registered_at FROM event_attendees
             WHERE event_id = :event_id AND user_id = :user_id LIMIT 1'
        );
        $statement->execute(['event_id' => $eventId, 'user_id' => $userId]);
        $row = $statement->fetch();

        return [
            'event_id' => $eventId,
            'user_id' => $userId,
            'status' => (string) ($row['status'] ?? 'going'),
            'registered_at' => $row['registered_at'] ?? null,
        ];
    }

    private function viewerRsvp(int $eventId, ?int $viewerId): ?array
    {
        if ($viewerId === null) {
            return null;
        }

        $statement = $this->db->prepare(
            'SELECT status, registered_at FROM event_attendees
             WHERE event_id = :event_id AND user_id = :user_id LIMIT 1'
        );
        $statement->execute(['event_id' => $eventId, 'user_id' => $viewerId]);
        $row = $statement->fetch();

        if ($row === false || $row['status'] === 'cancelled') {
            return null;
        }

        return [
            'status' => (string) $row['status'],
            'registered_at' => $row['registered_at'],
        ];
    }

    private function formatEvent(array $row, ?int $viewerId): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'slug' => (string) $row['slug'],
            'description' => (string) ($row['description'] ?? ''),
            'event_type' => (string) $row['event_type'],
            'venue_name' => $row['venue_name'],
            'city' => $row['city'],
            'address' => $row['address'],
            'latitude' => $row['latitude'] !== null ? (float) $row['latitude'] : null,
            'longitude' => $row['longitude'] !== null ? (float) $row['longitude'] : null,
            'is_virtual' => (bool) ($row['is_virtual'] ?? false),
            'meeting_link' => $row['meeting_link'],
            'start_date' => $row['start_date'],
            'end_date' => $row['end_date'],
            'capacity' => (int) ($row['capacity'] ?? 50),
            'registration_fee' => (float) ($row['registration_fee'] ?? 0),
            'status' => (string) $row['status'],
            'attendee_count' => (int) ($row['attendee_count'] ?? 0),
            'organizer' => [
                'id' => (int) $row['organizer_id'],
                'username' => (string) $row['organizer_username'],
                'full_name' => (string) ($row['organizer_full_name'] ?? $row['organizer_username']),
            ],
            'rsvp' => $this->viewerRsvp((int) $row['id'], $viewerId),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
}
