<?php

declare(strict_types=1);

namespace App\Middleware;

class RateLimiter
{
    public function handle(): bool
    {
        return true;
    }
}
