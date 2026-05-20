<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Database;
use PDO;

class Event
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function all(array $filters = [], ?int $viewerId = null): array
    {
        $params = [];
        $where = ["e.status <> 'cancelled'"];

        if (!empty($filters['city'])) {
            $where[] = 'e.city = :city';
            $params['city'] = $filters['city'];
        }

        $type = $filters['event_type'] ?? $filters['type'] ?? null;
        if (!empty($type)) {
            $where[] = 'e.event_type = :event_type';
            $params['event_type'] = $type;
        }

        if (!empty($filters['start'])) {
            $where[] = 'e.start_date >= :start_date';
            $params['start_date'] = $filters['start'];
        }

        if (!empty($filters['end'])) {
            $where[] = 'e.start_date <= :end_date';
            $params['end_date'] = $filters['end'];
        }

        $viewerSelect = 'NULL AS user_rsvp';
        if ($viewerId !== null) {
            $viewerSelect = '(SELECT ea.status FROM event_attendees ea WHERE ea.event_id = e.id AND ea.user_id = :viewer_id LIMIT 1) AS user_rsvp';
            $params['viewer_id'] = $viewerId;
        }

        $sql = "
            SELECT
                e.*,
                u.full_name AS organizer_name,
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'going') AS going_count,
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'interested') AS interested_count,
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'waitlist') AS waitlist_count,
                {$viewerSelect}
            FROM events e
            LEFT JOIN users u ON u.id = e.organizer_id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY e.start_date ASC
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return array_map([$this, 'normalize'], $statement->fetchAll());
    }

    public function find(int $id, ?int $viewerId = null): ?array
    {
        $params = ['id' => $id];
        $viewerSelect = 'NULL AS user_rsvp';

        if ($viewerId !== null) {
            $viewerSelect = '(SELECT ea.status FROM event_attendees ea WHERE ea.event_id = e.id AND ea.user_id = :viewer_id LIMIT 1) AS user_rsvp';
            $params['viewer_id'] = $viewerId;
        }

        $sql = "
            SELECT
                e.*,
                u.full_name AS organizer_name,
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'going') AS going_count,
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'interested') AS interested_count,
                (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'waitlist') AS waitlist_count,
                {$viewerSelect}
            FROM events e
            LEFT JOIN users u ON u.id = e.organizer_id
            WHERE e.id = :id
            LIMIT 1
        ";

        $statement = $this->db->prepare($sql);
        $statement->execute($params);
        $event = $statement->fetch();

        return $event !== false ? $this->normalize($event) : null;
    }

    public function create(array $data): array
    {
        $data['slug'] = $this->uniqueSlug((string) $data['title']);

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
            'title' => $data['title'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'event_type' => $data['event_type'],
            'venue_name' => $data['venue_name'] ?? null,
            'city' => $data['city'] ?? null,
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'is_virtual' => !empty($data['is_virtual']) ? 1 : 0,
            'meeting_link' => $data['meeting_link'] ?? null,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'capacity' => $data['capacity'] ?? 50,
            'registration_fee' => $data['registration_fee'] ?? 0,
            'organizer_id' => $data['organizer_id'],
            'status' => $data['status'] ?? 'upcoming',
        ]);

        return $this->find((int) $this->db->lastInsertId()) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        if ($data === []) {
            return $this->find($id);
        }

        if (isset($data['title'])) {
            $data['slug'] = $this->uniqueSlug((string) $data['title'], $id);
        }

        $allowed = [
            'title',
            'slug',
            'description',
            'event_type',
            'venue_name',
            'city',
            'address',
            'latitude',
            'longitude',
            'is_virtual',
            'meeting_link',
            'start_date',
            'end_date',
            'capacity',
            'registration_fee',
            'status',
        ];

        $sets = [];
        $params = ['id' => $id];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = :{$field}";
                $params[$field] = $field === 'is_virtual'
                    ? (!empty($data[$field]) ? 1 : 0)
                    : $data[$field];
            }
        }

        if ($sets === []) {
            return $this->find($id);
        }

        $sql = 'UPDATE events SET ' . implode(', ', $sets) . ', updated_at = NOW() WHERE id = :id';
        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM events WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    public function rsvp(int $eventId, int $userId, string $status): array
    {
        $statement = $this->db->prepare(
            'INSERT INTO event_attendees (event_id, user_id, status, registered_at)
             VALUES (:event_id, :user_id, :status, NOW())
             ON DUPLICATE KEY UPDATE status = VALUES(status), registered_at = NOW()'
        );

        $statement->execute([
            'event_id' => $eventId,
            'user_id' => $userId,
            'status' => $status,
        ]);

        return $this->find($eventId, $userId) ?? [];
    }

    public function cancelRsvp(int $eventId, int $userId): bool
    {
        $statement = $this->db->prepare(
            "UPDATE event_attendees SET status = 'cancelled' WHERE event_id = :event_id AND user_id = :user_id"
        );

        $statement->execute([
            'event_id' => $eventId,
            'user_id' => $userId,
        ]);

        return $statement->rowCount() > 0;
    }

    public function attendees(int $eventId): array
    {
        $statement = $this->db->prepare(
            'SELECT u.id, u.username, u.full_name, u.avatar, ea.status, ea.registered_at, ea.checked_in
             FROM event_attendees ea
             INNER JOIN users u ON u.id = ea.user_id
             WHERE ea.event_id = :event_id AND ea.status <> "cancelled"
             ORDER BY ea.registered_at ASC'
        );

        $statement->execute(['event_id' => $eventId]);

        return $statement->fetchAll();
    }

    public function setReminder(int $eventId, int $userId, string $reminderTime): array
    {
        $this->db->prepare('DELETE FROM event_reminders WHERE event_id = :event_id AND user_id = :user_id')
            ->execute([
                'event_id' => $eventId,
                'user_id' => $userId,
            ]);

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

    public function firstUserId(): int
    {
        $statement = $this->db->query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
        $user = $statement->fetch();

        return $user !== false ? (int) $user['id'] : 1;
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $title), '-'));
        $base = $base !== '' ? $base : 'event';
        $slug = $base;
        $counter = 2;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $sql = 'SELECT id FROM events WHERE slug = :slug';
        $params = ['slug' => $slug];

        if ($ignoreId !== null) {
            $sql .= ' AND id <> :id';
            $params['id'] = $ignoreId;
        }

        $sql .= ' LIMIT 1';
        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $statement->fetch() !== false;
    }

    private function normalize(array $event): array
    {
        return [
            'id' => (int) $event['id'],
            'title' => (string) $event['title'],
            'slug' => (string) $event['slug'],
            'description' => (string) ($event['description'] ?? ''),
            'event_type' => (string) $event['event_type'],
            'venue_name' => (string) ($event['venue_name'] ?? ''),
            'city' => (string) ($event['city'] ?? ''),
            'address' => (string) ($event['address'] ?? ''),
            'latitude' => $event['latitude'] !== null ? (float) $event['latitude'] : null,
            'longitude' => $event['longitude'] !== null ? (float) $event['longitude'] : null,
            'is_virtual' => (bool) $event['is_virtual'],
            'meeting_link' => (string) ($event['meeting_link'] ?? ''),
            'start_date' => (string) $event['start_date'],
            'end_date' => (string) $event['end_date'],
            'capacity' => (int) $event['capacity'],
            'registration_fee' => (float) $event['registration_fee'],
            'organizer_id' => (int) $event['organizer_id'],
            'organizer_name' => (string) ($event['organizer_name'] ?? ''),
            'status' => (string) $event['status'],
            'going_count' => (int) ($event['going_count'] ?? 0),
            'interested_count' => (int) ($event['interested_count'] ?? 0),
            'waitlist_count' => (int) ($event['waitlist_count'] ?? 0),
            'user_rsvp' => $event['user_rsvp'] ?? null,
            'created_at' => $event['created_at'] ?? null,
            'updated_at' => $event['updated_at'] ?? null,
        ];
    }
}