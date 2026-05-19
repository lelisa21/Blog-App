<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Controllers\Concerns\AuthenticatesRequests;
use App\Helpers\Response;
use App\Models\Forum;
use App\Models\User;
use App\Support\Request;
use RuntimeException;

class CommunityController
{
    use AuthenticatesRequests;

    private ?User $userRepository = null;
    private ?Forum $forumRepository = null;

    public function listUsers(array $params = [], array $query = []): array
    {
        $result = $this->resolveUserRepository()->listPublic([
            'page' => $query['page'] ?? 1,
            'per_page' => $query['per_page'] ?? 20,
            'skill_level' => $query['skill_level'] ?? null,
            'location' => $query['location'] ?? null,
        ]);

        return Response::success($result, 'Community members loaded.');
    }

    public function showUser(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return Response::error('User id is required.', 422);
        }

        $profile = $this->resolveUserRepository()->publicProfile($id);
        if ($profile === null) {
            return Response::error('User not found.', 404);
        }

        return Response::success(['user' => $profile], 'User profile loaded.');
    }

    public function searchUsers(array $params = [], array $query = []): array
    {
        $term = trim((string) ($query['q'] ?? $query['query'] ?? ''));
        if ($term === '') {
            return Response::error('Search query is required.', 422);
        }

        $limit = isset($query['limit']) ? max(1, min(50, (int) $query['limit'])) : 20;

        return Response::success([
            'users' => $this->resolveUserRepository()->searchPublic($term, $limit),
            'query' => $term,
        ], 'User search results loaded.');
    }

    public function requestMentorship(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();
        $mentorId = (int) ($payload['mentor_id'] ?? 0);
        if ($mentorId <= 0) {
            return Response::error('mentor_id is required.', 422);
        }

        if ($mentorId === (int) $user['id']) {
            return Response::error('You cannot request mentorship from yourself.', 422);
        }

        if ($this->resolveUserRepository()->findById($mentorId) === null) {
            return Response::error('Mentor not found.', 404);
        }

        $request = $this->resolveUserRepository()->createMentorshipRequest(
            (int) $user['id'],
            $mentorId,
            isset($payload['skill_area']) ? trim((string) $payload['skill_area']) : null,
            isset($payload['message']) ? trim((string) $payload['message']) : null
        );

        return Response::success(['request' => $request], 'Mentorship request sent.', 201);
    }

    public function mentorshipMatches(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        return Response::success([
            'matches' => $this->resolveUserRepository()->mentorshipMatches((int) $user['id']),
        ], 'Mentorship matches loaded.');
    }

    public function forumTopics(array $params = [], array $query = []): array
    {
        return Response::success([
            'topics' => $this->resolveForumRepository()->topics([
                'category' => $query['category'] ?? null,
                'q' => $query['q'] ?? null,
                'limit' => $query['limit'] ?? 50,
            ]),
        ], 'Forum topics loaded.');
    }

    public function storeForumTopic(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();
        $errors = [];
        if (trim((string) ($payload['title'] ?? '')) === '') {
            $errors['title'][] = 'Title is required.';
        }
        if (trim((string) ($payload['content'] ?? '')) === '') {
            $errors['content'][] = 'Content is required.';
        }
        if ($errors !== []) {
            return Response::error('Forum topic validation failed.', 422, $errors);
        }

        $allowed = ['general', 'help', 'jobs', 'projects', 'announcements'];
        if (!empty($payload['category']) && !in_array($payload['category'], $allowed, true)) {
            return Response::error('Invalid forum category.', 422);
        }

        $topic = $this->resolveForumRepository()->createTopic((int) $user['id'], $payload);

        return Response::success(['topic' => $topic], 'Forum topic created.', 201);
    }

    public function forumReplies(array $params = [], array $query = []): array
    {
        $topicId = (int) ($params['id'] ?? 0);
        $topic = $this->resolveForumRepository()->findTopic($topicId);
        if ($topic === null) {
            return Response::error('Forum topic not found.', 404);
        }

        return Response::success([
            'topic' => $topic,
            'replies' => $this->resolveForumRepository()->replies($topicId),
        ], 'Forum replies loaded.');
    }

    public function storeForumReply(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $topicId = (int) ($params['id'] ?? 0);
        $topic = $this->resolveForumRepository()->findTopic($topicId);
        if ($topic === null) {
            return Response::error('Forum topic not found.', 404);
        }

        if ($topic['is_locked']) {
            return Response::error('This topic is locked.', 403);
        }

        $content = trim((string) (Request::body()['content'] ?? ''));
        if ($content === '') {
            return Response::error('Reply content is required.', 422);
        }

        $reply = $this->resolveForumRepository()->createReply($topicId, (int) $user['id'], $content);

        return Response::success(['reply' => $reply], 'Reply posted.', 201);
    }

    public function updateForumReply(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $id = (int) ($params['id'] ?? 0);
        $reply = $this->resolveForumRepository()->findReply($id);
        if ($reply === null) {
            return Response::error('Reply not found.', 404);
        }

        if ((int) $reply['author']['id'] !== (int) $user['id'] && !$this->isAdmin($user)) {
            return Response::error('You cannot edit this reply.', 403);
        }

        $payload = Request::body();
        $content = trim((string) ($payload['content'] ?? $reply['content']));
        $isSolution = !empty($payload['is_solution']);

        $updated = $this->resolveForumRepository()->updateReply($id, $content, $isSolution);

        return Response::success(['reply' => $updated], 'Reply updated.');
    }

    private function resolveUserRepository(): User
    {
        if (!$this->userRepository instanceof User) {
            $this->userRepository = new User();
        }

        return $this->userRepository;
    }

    private function resolveForumRepository(): Forum
    {
        if (!$this->forumRepository instanceof Forum) {
            $this->forumRepository = new Forum();
        }

        return $this->forumRepository;
    }
}
