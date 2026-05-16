<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;

class EventController
{
    public function index(array $params = [], array $query = []): array
    {
        return $this->placeholder('list events', $params, $query);
    }

    public function show(array $params = [], array $query = []): array
    {
        return $this->placeholder('show event', $params, $query);
    }

    public function calendar(array $params = [], array $query = []): array
    {
        return $this->placeholder('events calendar', $params, $query);
    }

    public function store(array $params = [], array $query = []): array
    {
        return $this->placeholder('create event', $params, $query);
    }

    public function update(array $params = [], array $query = []): array
    {
        return $this->placeholder('update event', $params, $query);
    }

    public function destroy(array $params = [], array $query = []): array
    {
        return $this->placeholder('delete event', $params, $query);
    }

    public function rsvp(array $params = [], array $query = []): array
    {
        return $this->placeholder('event RSVP', $params, $query);
    }

    public function cancelRsvp(array $params = [], array $query = []): array
    {
        return $this->placeholder('cancel RSVP', $params, $query);
    }

    public function attendees(array $params = [], array $query = []): array
    {
        return $this->placeholder('list attendees', $params, $query);
    }

    public function setReminder(array $params = [], array $query = []): array
    {
        return $this->placeholder('set event reminder', $params, $query);
    }

    private function placeholder(string $action, array $params, array $query): array
    {
        return Response::success([
            'module' => 'events',
            'owner' => 'Person 5',
            'action' => $action,
            'params' => $params,
            'query' => $query,
            'file_to_edit' => 'src/Controllers/EventController.php',
        ], 'Starter endpoint is ready.');
    }
}
