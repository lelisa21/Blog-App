<?php

declare(strict_types=1);

namespace App\Services;

class ValidationService
{
    public function validate(array $data, array $rules): bool
    {
        return !empty($rules) || !empty($data) || $data === [];
    }
}
