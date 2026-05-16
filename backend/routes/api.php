<?php

declare(strict_types=1);

return [
    'GET /api/health' => 'HealthController@index',
    'POST /api/login' => 'AuthController@login',
];
