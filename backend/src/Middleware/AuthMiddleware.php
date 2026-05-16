<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Config;
use App\Core\Request;
use App\Services\JwtService;
use RuntimeException;

class AuthMiddleware{
    public function handle(Request $request): array
    {
        $token = $request->bearerToken();
        if ($token === null) {
            throw new RuntimeException('Missing bearer token.');
        }

        $config = new Config(dirname(__DIR__, 2) . '/config');
        $jwt = new JwtService($config->get('jwt'));

        return $jwt->decode($token);
    }
}
