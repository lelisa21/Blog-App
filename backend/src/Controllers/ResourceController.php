<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Controllers\Concerns\AuthenticatesRequests;
use App\Helpers\Response;
use App\Models\Resource;
use App\Services\MailService;
use App\Support\Request;
use RuntimeException;

class ResourceController
{
    use AuthenticatesRequests;

    private ?Resource $resources = null;
    private MailService $mail;

    public function __construct()
    {
        $this->mail = new MailService();
    }

    public function index(array $params = [], array $query = []): array
    {
        $filters = [];

        if (!empty($query['type'])) {
            $filters['type'] = (string) $query['type'];
        }

        if (!empty($query['category'])) {
            $filters['category'] = (string) $query['category'];
        }

        if (isset($query['featured'])) {
            $filters['featured'] = filter_var($query['featured'], FILTER_VALIDATE_BOOLEAN);
        }

        if (($query['scope'] ?? '') === 'downloads') {
            $filters['category'] = 'downloads';
        }

        if (($query['scope'] ?? '') === 'library') {
            $filters['exclude_category_prefix'] = 'learning-path';
        }

        return Response::success([
            'resources' => $this->model()->all($filters),
        ], 'Resources loaded.');
    }

    public function download(array $params = [], array $query = []): array
    {
        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            return Response::error('Resource id is required.', 422);
        }

        $resource = $this->model()->findById($id);
        if ($resource === null) {
            return Response::error('Resource not found.', 404);
        }

        $updated = $this->model()->incrementDownloadCount($id);
        $download = $this->resolveDownload($updated ?? $resource);

        return Response::success([
            'resource' => $updated ?? $resource,
            'download' => $download,
        ], 'Download ready.');
    }

    public function rate(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $resourceId = (int) ($params['id'] ?? 0);
        if ($resourceId <= 0) {
            return Response::error('Resource id is required.', 422);
        }

        if ($this->model()->findById($resourceId) === null) {
            return Response::error('Resource not found.', 404);
        }

        $payload = Request::body();
        $rating = (int) ($payload['rating'] ?? 0);
        if ($rating < 1 || $rating > 5) {
            return Response::error('Rating must be between 1 and 5.', 422);
        }

        $result = $this->model()->rate(
            $resourceId,
            (int) $user['id'],
            $rating,
            isset($payload['review']) ? trim((string) $payload['review']) : null
        );

        return Response::success([
            'rating' => $result,
        ], 'Rating saved.');
    }

    public function learningPaths(array $params = [], array $query = []): array
    {
        $definitions = require __DIR__ . '/../../config/learning_paths.php';
        $user = $this->optionalUser();
        $paths = [];

        foreach ($definitions as $slug => $definition) {
            $resource = $this->model()->findByCategory((string) $definition['category']);
            $progressPercent = (int) ($definition['default_progress'] ?? 0);

            if ($user !== null && $resource !== null) {
                $progress = $this->model()->progressForUser((int) $user['id'], (int) $resource['id']);
                $progressPercent = (int) $progress['progress_percent'];
            }

            $paths[] = [
                'slug' => $slug,
                'resource_id' => $resource['id'] ?? null,
                'title' => $definition['title'],
                'estimate' => $definition['estimate'],
                'steps' => $definition['steps'],
                'progress_percent' => $progressPercent,
            ];
        }

        return Response::success([
            'paths' => $paths,
        ], 'Learning paths loaded.');
    }

    public function saveProgress(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();
        $resourceId = (int) ($payload['resource_id'] ?? 0);
        $pathSlug = trim((string) ($payload['path_slug'] ?? ''));

        if ($resourceId <= 0 && $pathSlug !== '') {
            $definitions = require __DIR__ . '/../../config/learning_paths.php';
            if (!isset($definitions[$pathSlug])) {
                return Response::error('Unknown learning path.', 422);
            }

            $resource = $this->model()->findByCategory((string) $definitions[$pathSlug]['category']);
            if ($resource === null) {
                return Response::error('Learning path resource not found.', 404);
            }

            $resourceId = (int) $resource['id'];
        }

        if ($resourceId <= 0) {
            return Response::error('resource_id or path_slug is required.', 422);
        }

        if ($this->model()->findById($resourceId) === null) {
            return Response::error('Resource not found.', 404);
        }

        $increment = isset($payload['increment']) ? (int) $payload['increment'] : null;
        $progressPercent = isset($payload['progress_percent']) ? (int) $payload['progress_percent'] : null;

        if ($increment !== null) {
            $current = $this->model()->progressForUser((int) $user['id'], $resourceId);
            $progressPercent = min(100, (int) $current['progress_percent'] + $increment);
        }

        if ($progressPercent === null) {
            return Response::error('progress_percent or increment is required.', 422);
        }

        $saved = $this->model()->saveProgress((int) $user['id'], $resourceId, $progressPercent);

        return Response::success([
            'progress' => $saved,
        ], 'Learning progress saved.');
    }

    public function contact(array $params = [], array $query = []): array
    {
        $payload = Request::body();
        $name = trim((string) ($payload['name'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $subject = trim((string) ($payload['subject'] ?? ''));
        $message = trim((string) ($payload['message'] ?? ''));

        $errors = [];
        if ($name === '') {
            $errors['name'][] = 'Name is required.';
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'][] = 'A valid email is required.';
        }
        if ($subject === '') {
            $errors['subject'][] = 'Subject is required.';
        }
        if ($message === '') {
            $errors['message'][] = 'Message is required.';
        }

        if ($errors !== []) {
            return Response::error('Contact form validation failed.', 422, $errors);
        }

        $record = $this->model()->createContactMessage([
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'message' => $message,
            'user_agent' => Request::userAgent(),
            'ip_address' => Request::ipAddress(),
        ]);

        $adminEmail = getenv('CONTACT_NOTIFY_EMAIL') ?: 'admin@etc.com';
        $body = "New contact message from {$name} <{$email}>\n\nSubject: {$subject}\n\n{$message}";
        $this->mail->send($adminEmail, "[ETC Contact] {$subject}", $body);
        $this->mail->send($email, 'We received your message — ETC', "Hi {$name},\n\nThanks for contacting Ethiopian Tech Community. We received your message and will reply soon.\n\n— ETC Team");

        return Response::success([
            'message' => $record,
        ], 'Message sent successfully.', 201);
    }

    public function contactMessages(array $params = [], array $query = []): array
    {
        try {
            $user = $this->requireAdmin();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 403);
        }

        $limit = isset($query['limit']) ? max(1, min(100, (int) $query['limit'])) : 50;

        return Response::success([
            'messages' => $this->model()->contactMessages($limit),
        ], 'Contact messages loaded.');
    }

    public function about(array $params = [], array $query = []): array
    {
        $page = $this->model()->sitePage('about');
        if ($page === null) {
            return Response::error('About page content not found.', 404);
        }

        return Response::success([
            'page' => $page,
        ], 'About page loaded.');
    }

    private function resolveDownload(array $resource): array
    {
        $baseUrl = rtrim((string) (getenv('APP_URL') ?: 'http://localhost:8000'), '/');

        if (!empty($resource['download_url'])) {
            return [
                'url' => (string) $resource['download_url'],
                'filename' => basename(parse_url((string) $resource['download_url'], PHP_URL_PATH) ?: 'download'),
                'type' => 'external',
            ];
        }

        $filePath = (string) ($resource['file_path'] ?? '');
        if ($filePath === '') {
            return [
                'url' => null,
                'filename' => null,
                'type' => 'unavailable',
            ];
        }

        $absolutePath = __DIR__ . '/../../' . ltrim($filePath, '/');
        if (!is_file($absolutePath)) {
            return [
                'url' => null,
                'filename' => basename($filePath),
                'type' => 'missing',
            ];
        }

        return [
            'url' => $baseUrl . '/' . ltrim(str_replace('\\', '/', $filePath), '/'),
            'filename' => basename($filePath),
            'type' => 'file',
            'file_size' => filesize($absolutePath) ?: null,
        ];
    }

    private function model(): Resource
    {
        if (!$this->resources instanceof Resource) {
            $this->resources = new Resource();
        }

        return $this->resources;
    }
}
