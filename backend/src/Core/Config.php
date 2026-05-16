<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

class Config
{
    public function __construct(private readonly string $configPath)
    {
    }

    public function get(string $name): array
    {
        $file = $this->configPath . '/' . $name . '.php';

        if (!file_exists($file)) {
            throw new RuntimeException("Config file [{$name}] not found.");
        }

        $config = require $file;

        if (!is_array($config)) {
            throw new RuntimeException("Config file [{$name}] must return an array.");
        }

        return $config;
    }
}
