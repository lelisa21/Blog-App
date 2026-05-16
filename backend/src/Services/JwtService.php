<?php

declare(strict_types=1);

namespace App\Services;

use RuntimeException;

class JwtService
{
    public function __construct(private readonly array $config)
    {
    }

    public function encode(array $claims): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $now = time();

        $payload = array_merge([
            'iss' => $this->config['issuer'] ?? 'techblog-api',
            'aud' => $this->config['audience'] ?? 'techblog-client',
            'iat' => $now,
            'exp' => $now + (int) ($this->config['ttl'] ?? 3600),
        ], $claims);

        $segments = [
            $this->base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR)),
            $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), (string) ($this->config['secret'] ?? ''), true);
        $segments[] = $this->base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public function decode(string $token): array
    {
        $segments = explode('.', $token);
        if (count($segments) !== 3) {
            throw new RuntimeException('Invalid token structure.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $segments;
        $signature = $this->base64UrlDecode($encodedSignature);
        $expected = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, (string) ($this->config['secret'] ?? ''), true);

        if (!hash_equals($expected, $signature)) {
            throw new RuntimeException('Invalid token signature.');
        }

        $payload = json_decode($this->base64UrlDecode($encodedPayload), true);
        if (!is_array($payload)) {
            throw new RuntimeException('Invalid token payload.');
        }

        if (($payload['exp'] ?? 0) < time()) {
            throw new RuntimeException('Token has expired.');
        }

        return $payload;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        return (string) base64_decode(strtr($value, '-_', '+/'));
    }
}
