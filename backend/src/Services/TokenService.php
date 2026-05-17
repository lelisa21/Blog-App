<?php

declare(strict_types=1);

namespace App\Services;

class TokenService{
    private string $secret;
    private string $issuer;
    private string $audience;
    private int $ttl;

    public function __construct(){
        $config = require __DIR__ . '/../../config/jwt.php';
        $this->secret = (string) $config['secret'];
        $this->issuer = (string) $config['issuer'];
        $this->audience = (string) $config['audience'];
        $this->ttl = (int) $config['ttl'];
    }

    public function createAccessToken(array $user): string
    {
        $now = time();

        $payload = [
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'sub' => (int) $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'iat' => $now,
            'exp' => $now + $this->ttl,
        ];

        $header = $this->base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $body = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = $this->base64UrlEncode(hash_hmac('sha256', $header . '.' . $body, $this->secret, true));

        return $header . '.' . $body . '.' . $signature;
    }

    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $body, $signature] = $parts;
        $expected = $this->base64UrlEncode(hash_hmac('sha256', $header . '.' . $body, $this->secret, true));

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($body), true);
        if (!is_array($payload)) {
            return null;
        }

        if (($payload['iss'] ?? null) !== $this->issuer || ($payload['aud'] ?? null) !== $this->audience) {
            return null;
        }

        if (!isset($payload['exp']) || (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    public function ttl(): int
    {
        return $this->ttl;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
