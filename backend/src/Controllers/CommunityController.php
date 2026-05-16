<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Response;

class CommunityController
{
    public function users(array $params = [], array $query = []): array
    {
        return $this->placeholder('list users', $params, $query);
    }

    public function showUser(array $params = [], array $query = []): array
    {
        return $this->placeholder('show user', $params, $query);
    }

    public function searchUsers(array $params = [], array $query = []): array
    {
        return $this->placeholder('search users', $params, $query);
    }

    public function requestMentorship(array $params = [], array $query = []): array
    {
        return $this->placeholder('request mentorship', $params, $query);
    }

    public function mentorshipMatches(array $params = [], array $query = []): array
    {
        return $this->placeholder('mentorship matches', $params, $query);
    }

    public function forumTopics(array $params = [], array $query = []): array
    {
        return $this->placeholder('list forum topics', $params, $query);
    }

    public function storeForumTopic(array $params = [], array $query = []): array
    {
        return $this->placeholder('create forum topic', $params, $query);
    }

    public function forumReplies(array $params = [], array $query = []): array
    {
        return $this->placeholder('list forum replies', $params, $query);
    }

    public function storeForumReply(array $params = [], array $query = []): array
    {
        return $this->placeholder('create forum reply', $params, $query);
    }

    public function updateForumReply(array $params = [], array $query = []): array
    {
        return $this->placeholder('update forum reply', $params, $query);
    }

    private function placeholder(string $action, array $params, array $query): array
    {
        return Response::success([
            'module' => 'community',
            'owner' => 'Person 4',
            'action' => $action,
            'params' => $params,
            'query' => $query,
            'file_to_edit' => 'src/Controllers/CommunityController.php',
        ], 'Starter endpoint is ready.');
    }
}
