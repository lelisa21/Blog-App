<?php

declare(strict_types=1);

namespace App\Helpers;

class Response
{
    public static function json(array $data, int $status = 200): string
    {
        http_response_code($status);

        return json_encode($data, JSON_THROW_ON_ERROR);
    }
}
