<?php

declare(strict_types=1);

namespace App\Services;

class ValidationService
{
    public function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $fieldRules) {
            foreach ($fieldRules as $rule) {
                if ($rule === 'required' && (!array_key_exists($field, $data) || $data[$field] === '')) {
                    $errors[$field][] = 'This field is required.';
                }
            }
        }

        return [
            'valid' => $errors === [],
            'errors' => $errors,
        ];
    }
}
