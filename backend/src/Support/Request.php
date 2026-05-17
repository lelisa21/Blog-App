<?php

declare(strict_types=1);

namespace App\Support;

class Request{
    public static function body(): array{
        $input = file_get_contents('php://input');

        if ($input === false || trim($input) === '') {
            return $_POST;
        }

        $decoded = json_decode($input, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        parse_str($input, $parsed);

        return is_array($parsed) ? $parsed : [];
    }

    public static function bearerToken(): ?string {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';

        if (preg_match('/Bearer\s+(.+)/i', $header, $matches) !== 1) {
            return null;
        }

        return trim($matches[1]);
    }

    public static function ipAddress(): ?string{
        return $_SERVER['REMOTE_ADDR'] ?? null;
    }

    public static function userAgent(): ?string {
        return $_SERVER['HTTP_USER_AGENT'] ?? null;
    }
}
