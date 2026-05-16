<?php

declare(strict_types=1);

namespace App\Helpers;

class Response
{
    public static function json(array $data, int $status = 200): void
    {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data, JSON_THROW_ON_ERROR);
    }

    public static function success(array $data = [], string $message = 'OK', int $status = 200): array
    {
        return [
            'status' => $status,
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];
    }

    public static function error(string $message, int $status = 400, array $errors = []): array
    {
        return [
            'status' => $status,
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ];
    }
}
