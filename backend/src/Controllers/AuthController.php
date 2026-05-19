<?php

declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../Helpers/Response.php';

use App\Helpers\Security;
use App\Helpers\Response;
use App\Models\User;
use App\Services\MailService;
use App\Services\TokenService;
use App\Support\Request;
use RuntimeException;

class AuthController
{
    private ?User $users = null;
    private TokenService $tokens;
    private MailService $mail;
    private bool $sessionsCleaned = false;

    public function __construct()
    {
        $this->tokens = new TokenService();
        $this->mail = new MailService();
    }

    public function health(array $params = [], array $query = []): array
    {
        return Response::success([
            'service' => 'backend',
            'module' => 'auth',
            'timestamp' => gmdate(DATE_ATOM),
        ], 'API is running');
    }

    public function register(array $params = [], array $query = []): array
    {
        $payload = Request::body();

        $errors = [];
        $username = trim((string) ($payload['username'] ?? ''));
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $fullName = trim((string) ($payload['full_name'] ?? ''));

        if ($username === '') {
            $errors['username'][] = 'Username is required.';
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'][] = 'A valid email address is required.';
        }

        if (strlen($password) < 8) {
            $errors['password'][] = 'Password must be at least 8 characters.';
        }

        if ($this->users()->existsByUsername($username)) {
            $errors['username'][] = 'Username is already taken.';
        }

        if ($this->users()->existsByEmail($email)) {
            $errors['email'][] = 'Email is already registered.';
        }

        if ($errors !== []) {
            return Response::error('Registration failed.', 422, $errors);
        }

        $user = $this->users()->create([
            'username' => $username,
            'email' => $email,
            'password_hash' => Security::hash($password),
            'full_name' => $fullName !== '' ? $fullName : $username,
            'bio' => $payload['bio'] ?? null,
            'location' => $payload['location'] ?? null,
            'skill_level' => $payload['skill_level'] ?? 'beginner',
        ]);

        $tokens = $this->issueTokens($user);
        $this->mail->send($email, 'Welcome to ETC', 'Your account is ready.');

        return Response::success([
            'user' => $this->publicUser($user),
            'tokens' => $tokens,
        ], 'Account created successfully.', 201);
    }

    public function login(array $params = [], array $query = []): array
    {
        $payload = Request::body();
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            return Response::error('Email and password are required.', 422);
        }

        $user = $this->users()->findByEmail($email);
        if ($user === null || !password_verify($password, (string) $user['password_hash'])) {
            return Response::error('Invalid credentials.', 401);
        }

        if (!(bool) $user['is_active']) {
            return Response::error('Account is inactive.', 403);
        }

        $this->users()->touchLastLogin((int) $user['id']);
        $freshUser = $this->users()->findById((int) $user['id']) ?? $user;

        return Response::success([
            'user' => $this->publicUser($freshUser),
            'tokens' => $this->issueTokens($freshUser),
        ], 'Login successful.');
    }

    public function logout(array $params = [], array $query = []): array
    {
        $payload = Request::body();
        $sessionToken = (string) ($payload['session_token'] ?? '');

        if ($sessionToken === '') {
            return Response::error('Session token is required.', 422);
        }

        $this->users()->deleteSession($sessionToken);

        return Response::success([], 'Logged out successfully.');
    }

    public function refresh(array $params = [], array $query = []): array
    {
        $payload = Request::body();
        $sessionToken = (string) ($payload['session_token'] ?? '');

        if ($sessionToken === '') {
            return Response::error('Session token is required.', 422);
        }

        $session = $this->users()->findSession($sessionToken);
        if ($session === null) {
            return Response::error('Session has expired or is invalid.', 401);
        }

        $user = $this->users()->findById((int) $session['user_id']) ?? null;
        if ($user === null) {
            return Response::error('User not found.', 404);
        }

        return Response::success([
            'user' => $this->publicUser($user),
            'tokens' => [
                'access_token' => $this->tokens->createAccessToken($user),
                'session_token' => $sessionToken,
                'token_type' => 'Bearer',
                'expires_in' => $this->tokens->ttl(),
            ],
        ], 'Session refreshed.');
    }

    public function me(array $params = [], array $query = []): array
    {
        try {
            $user = $this->authenticatedUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        return Response::success([
            'user' => $this->publicUser($user),
        ], 'Current user fetched.');
    }

    public function updateProfile(array $params = [], array $query = []): array
    {
        try {
            $user = $this->authenticatedUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();
        $updated = $this->users()->updateProfile((int) $user['id'], $payload);

        if ($updated === null) {
            return Response::error('Profile could not be updated. Email may already be in use.', 422);
        }

        return Response::success([
            'user' => $this->publicUser($updated),
        ], 'Profile updated successfully.');
    }

    public function uploadAvatar(array $params = [], array $query = []): array
    {
        try {
            $user = $this->authenticatedUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        if (empty($_FILES['avatar'])) {
            return Response::error('No avatar file uploaded.', 422);
        }

        $file = $_FILES['avatar'];
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $mimeType = mime_content_type($file['tmp_name']);

        if (!in_array($mimeType, $allowedMimes, true)) {
            return Response::error('Avatar must be a JPEG, PNG, GIF, or WEBP image.', 422);
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            return Response::error('Avatar must be 5 MB or smaller.', 422);
        }

        $ext = match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        $uploadDir = realpath(__DIR__ . '/../../storage/uploads') . DIRECTORY_SEPARATOR;
        $filename = 'avatar_' . (int) $user['id'] . '_' . time() . '.' . $ext;
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return Response::error('Failed to save avatar.', 500);
        }

        $avatarPath = 'storage/uploads/' . $filename;
        $updated = $this->users()->updateProfile((int) $user['id'], ['avatar' => $avatarPath]);

        return Response::success([
            'user' => $this->publicUser($updated ?? $user),
            'avatar' => $avatarPath,
        ], 'Avatar uploaded successfully.');
    }

    public function settings(array $params = [], array $query = []): array
    {
        try {
            $user = $this->authenticatedUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        return Response::success([
            'settings' => $this->users()->settings((int) $user['id']),
        ], 'Settings loaded successfully.');
    }

    public function updateSettings(array $params = [], array $query = []): array
    {
        try {
            $user = $this->authenticatedUser();
        } catch (RuntimeException $exception) {
            return Response::error($exception->getMessage(), 401);
        }

        $payload = Request::body();

        return Response::success([
            'settings' => $this->users()->updateSettings((int) $user['id'], [
                'email_notifications' => (bool) ($payload['email_notifications'] ?? true),
                'push_notifications' => (bool) ($payload['push_notifications'] ?? true),
                'two_factor_auth' => (bool) ($payload['two_factor_auth'] ?? false),
                'theme' => in_array(($payload['theme'] ?? 'dark'), ['dark', 'light', 'auto'], true) ? $payload['theme'] : 'dark',
                'font_size' => in_array(($payload['font_size'] ?? 'medium'), ['small', 'medium', 'large'], true) ? $payload['font_size'] : 'medium',
                'language' => (string) ($payload['language'] ?? 'en'),
                'profile_visibility' => in_array(($payload['profile_visibility'] ?? 'community'), ['public', 'community', 'private'], true) ? $payload['profile_visibility'] : 'community',
                'activity_visibility' => (bool) ($payload['activity_visibility'] ?? true),
            ]),
        ], 'Settings saved successfully.');
    }

    public function subscribeNewsletter(array $params = [], array $query = []): array
    {
        $payload = Request::body();
        $email = strtolower(trim((string) ($payload['email'] ?? '')));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return Response::error('A valid email address is required.', 422);
        }

        $this->users()->subscribeToNewsletter($email);
        $this->mail->send($email, 'ETC newsletter subscription', 'Thanks for subscribing to ETC updates.');

        return Response::success([
            'email' => $email,
        ], 'Newsletter subscription saved.');
    }

    public function siteStats(array $params = [], array $query = []): array
    {
        return Response::success([
            'stats' => $this->users()->stats(),
        ], 'Site stats loaded.');
    }

    private function authenticatedUser(): array
    {
        $accessToken = Request::bearerToken();
        if ($accessToken === null) {
            throw new RuntimeException('Authorization token is required.');
        }

        $payload = $this->tokens->decode($accessToken);
        if ($payload === null || !isset($payload['sub'])) {
            throw new RuntimeException('Authorization token is invalid or expired.');
        }

        $user = $this->users()->findById((int) $payload['sub']);
        if ($user === null) {
            throw new RuntimeException('Authenticated user was not found.');
        }

        return $user;
    }

    private function issueTokens(array $user): array
    {
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (60 * 60 * 24 * 30));

        $this->users()->createSession(
            (int) $user['id'],
            $sessionToken,
            $expiresAt,
            Request::ipAddress(),
            Request::userAgent()
        );

        return [
            'access_token' => $this->tokens->createAccessToken($user),
            'session_token' => $sessionToken,
            'token_type' => 'Bearer',
            'expires_in' => $this->tokens->ttl(),
            'session_expires_at' => gmdate(DATE_ATOM, strtotime($expiresAt)),
        ];
    }

    private function publicUser(array $user): array
    {
        $fullName = trim((string) ($user['full_name'] ?? ''));

        return [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'email' => (string) $user['email'],
            'full_name' => $fullName !== '' ? $fullName : (string) $user['username'],
            'avatar' => (string) ($user['avatar'] ?? 'default-avatar.png'),
            'bio' => (string) ($user['bio'] ?? ''),
            'location' => (string) ($user['location'] ?? ''),
            'skill_level' => (string) ($user['skill_level'] ?? 'beginner'),
            'last_login' => $user['last_login'] ?? null,
            'created_at' => $user['created_at'] ?? null,
        ];
    }

    private function users(): User
    {
        if (!$this->users instanceof User) {
            $this->users = new User();
        }

        if ($this->sessionsCleaned === false) {
            $this->users->cleanupExpiredSessions();
            $this->sessionsCleaned = true;
        }

        return $this->users;
    }
}
