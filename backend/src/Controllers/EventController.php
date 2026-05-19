<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Controllers\Concerns\AuthenticatesRequests;
use App\Helpers\Response;
use App\Models\Event;
use App\Support\Request;
use RuntimeException;

class EventController
{
    use AuthenticatesRequests;

    private ?Event $events = null;

    public function index(array $params = [], array $query = []): array
    {
        $viewer = $this->optionalUser();
        $result = $this->model()->paginate([
            'page' => $query['page'] ?? 1,
            'per_page' => $query['per_page'] ?? 20,
            'status' => $query['status'] ?? null,
            'city' => $query['city'] ?? null,
            'event_type' => $query['event_type'] ?? $query['type'] ?? null,
            'from' => $query['from'] ?? null,
            'to' => $query['to'] ?? null,
        ], $viewer['id'] ?? null);

        return Response::success($result, 'Events loaded.');
    }

    public function show(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return Response::error('Event id is required.', 422);
        }

        $viewer = $this->optionalUser();
        $event = $this->model()->findById($id, $viewer['id'] ?? null);
        if ($event === null) {
            return Response::error('Event not found.', 404);
        }

        return Response::success(['event' => $event], 'Event loaded.');
    }

    public function calendar(array $params = [], array $query = []): array
    {
        $from = (string) ($query['from'] ?? date('Y-m-01'));
        $to = (string) ($query['to'] ?? date('Y-m-t 23:59:59'));

        return Response::success([
            'events' => $this->model()->calendar($from, $to),
            'from' => $from,
            'to' => $to,
        ], 'Calendar events loaded.');
    }

    public function store(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();
        $errors = $this->validateEventPayload($payload);
        if ($errors !== []) {
            return Response::error('Event validation failed.', 422, $errors);
        }

        $payload['organizer_id'] = (int) $user['id'];
        $event = $this->model()->create($payload);

        return Response::success(['event' => $event], 'Event created.', 201);
    }

    public function update(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        $existing = $this->model()->findById($id);
        if ($existing === null) {
            return Response::error('Event not found.', 404);
        }

        if ((int) $existing['organizer']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot edit this event.', 403);
        }

        $event = $this->model()->update($id, Request::body());
        if ($event === null) {
            return Response::error('Event could not be updated.', 500);
        }

        return Response::success(['event' => $event], 'Event updated.');
    }

    public function destroy(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        $existing = $this->model()->findById($id);
        if ($existing === null) {
            return Response::error('Event not found.', 404);
        }

        if ((int) $existing['organizer']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot delete this event.', 403);
        }

        $this->model()->delete($id);

        return Response::success([], 'Event deleted.');
    }

    public function rsvp(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $eventId = (int) ($params['id'] ?? 0);
        if ($this->model()->findById($eventId) === null) {
            return Response::error('Event not found.', 404);
        }

        $status = (string) (Request::body()['status'] ?? 'going');
        if (!in_array($status, ['interested', 'going', 'waitlist'], true)) {
            return Response::error('Invalid RSVP status.', 422);
        }

        $rsvp = $this->model()->rsvp($eventId, (int) $user['id'], $status);

        return Response::success(['rsvp' => $rsvp], 'RSVP saved.');
    }

    public function cancelRsvp(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $eventId = (int) ($params['id'] ?? 0);
        if ($this->model()->findById($eventId) === null) {
            return Response::error('Event not found.', 404);
        }

        $this->model()->cancelRsvp($eventId, (int) $user['id']);

        return Response::success([], 'RSVP cancelled.');
    }

    public function attendees(array $params = [], array $query = []): array
    {
        $eventId = (int) ($params['id'] ?? 0);
        if ($this->model()->findById($eventId) === null) {
            return Response::error('Event not found.', 404);
        }

        return Response::success([
            'attendees' => $this->model()->attendees($eventId),
        ], 'Attendees loaded.');
    }

    public function setReminder(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $eventId = (int) ($params['id'] ?? 0);
        if ($this->model()->findById($eventId) === null) {
            return Response::error('Event not found.', 404);
        }

        $reminderTime = trim((string) (Request::body()['reminder_time'] ?? ''));
        if ($reminderTime === '') {
            return Response::error('reminder_time is required.', 422);
        }

        $reminder = $this->model()->setReminder($eventId, (int) $user['id'], $reminderTime);

        return Response::success(['reminder' => $reminder], 'Reminder scheduled.', 201);
    }

    private function validateEventPayload(array $payload): array
    {
        $errors = [];

        if (trim((string) ($payload['title'] ?? '')) === '') {
            $errors['title'][] = 'Title is required.';
        }

        $types = ['meetup', 'workshop', 'hackathon', 'conference', 'virtual'];
        if (empty($payload['event_type']) || !in_array($payload['event_type'], $types, true)) {
            $errors['event_type'][] = 'Valid event_type is required.';
        }

        if (empty($payload['start_date']) || empty($payload['end_date'])) {
            $errors['dates'][] = 'start_date and end_date are required.';
        }

        return $errors;
    }

    private function model(): Event
    {
        if (!$this->events instanceof Event) {
            $this->events = new Event();
        }

        return $this->events;
    }
}
