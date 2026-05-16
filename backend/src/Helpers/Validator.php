<?php

declare(strict_types=1);

namespace App\Helpers;

class Validator
{
    public static function required(array $data, array $fields): bool
    {
        foreach ($fields as $field) {
            if (!array_key_exists($field, $data) || $data[$field] === '') {
                return false;
            }
        }

        return true;
    }
}
