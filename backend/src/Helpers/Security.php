<?php

declare(strict_types=1);

namespace App\Helpers;

class Security
{
    public static function hash(string $value): string
    {
        return password_hash($value, PASSWORD_BCRYPT);
    }
}
