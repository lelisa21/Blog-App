<?php

declare(strict_types=1);

namespace App\Middleware;

class CorsMiddleware
{
    public function handle(): bool
    {
        return true;
    }
}
