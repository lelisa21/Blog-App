<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;
use App\Models\Event;
use App\Services\TokenService;
use App\Support\Request;
use DateInterval;
use DateTimeImmutable;
use Throwable;

class EventController
{
    private ?Event $events = null;
    private ?TokenService $tokens = null;

    public function index(array $params = [], array $query = []): array
    {
        $viewerId = $this->optionalUserId();

        return Response::success([
            'events' => $this->events()->all($query, $viewerId),
        ], 'Events loaded successfully.');
    }

    public function show(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        $event = $this->events()->find($id, $this->optionalUserId());

        if ($event === null) {
            return Response::error('Event not found.', 404);
        }

        return Response::success([
            'event' => $event,
        ], 'Event loaded successfully.');
    }

    public function calendar(array $params = [], array $query = []): array
    {
        $filters = [
            'start' => $query['start'] ?? null,
            'end' => $query['end'] ?? null,
            'city' => $query['city'] ?? null,
            'event_type' => $query['event_type'] ?? ($query['type'] ?? null),
        ];

        return Response::success([
            'events' => $this->events()->all(array_filter($filters), $this->optionalUserId()),
        ], 'Calendar events loaded successfully.');
    }

    public function store(array $params = [], array $query = []): array
    {
        $payload = Request::body();
        $data = $this->eventPayload($payload, true);

        if ($data['errors'] !== []) {
            return Response::error('Event could not be created.', 422, $data['errors']);
        }

        $event = $this->events()->create(array_merge($data['values'], [
            'organizer_id' => $this->currentUserId(),
        ]));

        return Response::success([
            'event' => $event,
        ], 'Event created successfully.', 201);
    }

    public function update(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        $existing = $this->events()->find($id, $this->optionalUserId());

        if ($existing === null) {
            return Response::error('Event not found.', 404);
        }

        $payload = Request::body();
        $data = $this->eventPayload($payload, false);

        if ($data['errors'] !== []) {
            return Response::error('Event could not be updated.', 422, $data['errors']);
        }

        $event = $this->events()->update($id, $data['values']);

        return Response::success([
            'event' => $event,
        ], 'Event updated successfully.');
    }

    public function destroy(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);

        if (!$this->events()->delete($id)) {
            return Response::error('Event not found or already deleted.', 404);
        }

        return Response::success([], 'Event deleted successfully.');
    }

    public function rsvp(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        $event = $this->events()->find($id, $this->optionalUserId());

        if ($event === null) {
            return Response::error('Event not found.', 404);
        }

        $payload = Request::body();
        $status = (string) ($payload['status'] ?? 'going');
        $allowed = ['interested', 'going', 'waitlist'];

        if (!in_array($status, $allowed, true)) {
            return Response::error('Invalid RSVP status.', 422, [
                'status' => ['Use interested, going, or waitlist.'],
            ]);
        }

        $event = $this->events()->rsvp($id, $this->currentUserId(), $status);

        return Response::success([
            'event' => $event,
            'rsvp_status' => $status,
        ], 'RSVP saved successfully.');
    }

    public function cancelRsvp(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        $this->events()->cancelRsvp($id, $this->currentUserId());

        return Response::success([], 'RSVP cancelled successfully.');
    }

    public function attendees(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);

        if ($this->events()->find($id) === null) {
            return Response::error('Event not found.', 404);
        }

        return Response::success([
            'attendees' => $this->events()->attendees($id),
        ], 'Event attendees loaded successfully.');
    }

    public function setReminder(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        $event = $this->events()->find($id, $this->optionalUserId());

        if ($event === null) {
            return Response::error('Event not found.', 404);
        }

        $payload = Request::body();
        $reminderTime = $payload['reminder_time'] ?? null;

        if ($reminderTime === null || trim((string) $reminderTime) === '') {
            $start = new DateTimeImmutable((string) $event['start_date']);
            $reminderTime = $start->sub(new DateInterval('PT24H'))->format('Y-m-d H:i:s');
        } else {
            $reminderTime = $this->toMysqlDateTime((string) $reminderTime);
        }

        if ($reminderTime === null) {
            return Response::error('Invalid reminder time.', 422);
        }

        $reminder = $this->events()->setReminder($id, $this->currentUserId(), $reminderTime);

        return Response::success([
            'reminder' => $reminder,
        ], 'Reminder saved successfully.');
    }

    private function eventPayload(array $payload, bool $creating): array
    {
        $errors = [];
        $values = [];

        if ($creating || array_key_exists('title', $payload)) {
            $title = trim((string) ($payload['title'] ?? ''));

            if ($title === '') {
                $errors['title'][] = 'Event title is required.';
            } else {
                $values['title'] = $title;
            }
        }

        if (array_key_exists('description', $payload)) {
            $values['description'] = trim((string) $payload['description']);
        }

        if ($creating || array_key_exists('event_type', $payload) || array_key_exists('type', $payload)) {
            $eventType = (string) ($payload['event_type'] ?? ($payload['type'] ?? ''));
            $allowedTypes = ['meetup', 'workshop', 'hackathon', 'conference', 'virtual'];

            if (!in_array($eventType, $allowedTypes, true)) {
                $errors['event_type'][] = 'Choose meetup, workshop, hackathon, conference, or virtual.';
            } else {
                $values['event_type'] = $eventType;
            }
        }

        foreach (['venue_name', 'city', 'address', 'meeting_link', 'status'] as $field) {
            if (array_key_exists($field, $payload)) {
                $values[$field] = trim((string) $payload[$field]);
            }
        }

        foreach (['latitude', 'longitude'] as $field) {
            if (array_key_exists($field, $payload)) {
                $values[$field] = $payload[$field] === '' || $payload[$field] === null
                    ? null
                    : (float) $payload[$field];
            }
        }

        if (array_key_exists('is_virtual', $payload)) {
            $values['is_virtual'] = (bool) $payload['is_virtual'];
        }

        foreach (['capacity', 'registration_fee'] as $field) {
            if (array_key_exists($field, $payload)) {
                $values[$field] = $field === 'capacity'
                    ? max(1, (int) $payload[$field])
                    : max(0, (float) $payload[$field]);
            }
        }

        if ($creating || array_key_exists('start_date', $payload)) {
            $startDate = $this->toMysqlDateTime((string) ($payload['start_date'] ?? ''));

            if ($startDate === null) {
                $errors['start_date'][] = 'Start date is required.';
            } else {
                $values['start_date'] = $startDate;
            }
        }

        if ($creating || array_key_exists('end_date', $payload)) {
            $endDate = $this->toMysqlDateTime((string) ($payload['end_date'] ?? ''));

            if ($endDate === null) {
                $errors['end_date'][] = 'End date is required.';
            } else {
                $values['end_date'] = $endDate;
            }
        }

        if (isset($values['start_date'], $values['end_date']) && strtotime($values['end_date']) <= strtotime($values['start_date'])) {
            $errors['end_date'][] = 'End date must be after start date.';
        }

        return [
            'values' => $values,
            'errors' => $errors,
        ];
    }

    private function toMysqlDateTime(string $value): ?string
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        try {
            return (new DateTimeImmutable($value))->format('Y-m-d H:i:s');
        } catch (Throwable) {
            return null;
        }
    }

    private function optionalUserId(): ?int
    {
        try {
            $token = Request::bearerToken();

            if ($token === null) {
                return null;
            }

            $payload = $this->tokens()->decode($token);

            return isset($payload['sub']) ? (int) $payload['sub'] : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function currentUserId(): int
    {
        return $this->optionalUserId() ?? $this->events()->firstUserId();
    }

    private function events(): Event
    {
        if (!$this->events instanceof Event) {
            $this->events = new Event();
        }

        return $this->events;
    }

    private function tokens(): TokenService
    {
        if (!$this->tokens instanceof TokenService) {
            $this->tokens = new TokenService();
        }

        return $this->tokens;
    }
}