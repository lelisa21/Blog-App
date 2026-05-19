<?php

declare(strict_types=1);

namespace App\Controllers\Concerns;

use App\Models\User;
use App\Services\TokenService;
use App\Support\Request;
use RuntimeException;

trait AuthenticatesRequests
{
    private ?TokenService $authTokens = null;

    protected function tokens(): TokenService
    {
        if (!$this->authTokens instanceof TokenService) {
            $this->authTokens = new TokenService();
        }

        return $this->authTokens;
    }

    protected function requireUser(): array
    {
        $accessToken = Request::bearerToken();
        if ($accessToken === null) {
            throw new RuntimeException('Authorization token is required.');
        }

        $payload = $this->tokens()->decode($accessToken);
        if ($payload === null || !isset($payload['sub'])) {
            throw new RuntimeException('Authorization token is invalid or expired.');
        }

        $user = (new User())->findById((int) $payload['sub']);
        if ($user === null) {
            throw new RuntimeException('Authenticated user was not found.');
        }

        return $user;
    }

    protected function optionalUser(): ?array
    {
        try {
            return $this->requireUser();
        } catch (RuntimeException) {
            return null;
        }
    }

    protected function requireAdmin(): array
    {
        $user = $this->requireUser();
        if (!$this->isAdmin($user)) {
            throw new RuntimeException('Admin access required.');
        }

        return $user;
    }

    protected function isAdmin(array $user): bool
    {
        $adminEmail = strtolower((string) (getenv('ADMIN_EMAIL') ?: 'admin@etc.com'));
        return strtolower((string) $user['email']) === $adminEmail;
    }

    protected function publicUser(array $user): array
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
            'created_at' => $user['created_at'] ?? null,
        ];
    }
}
