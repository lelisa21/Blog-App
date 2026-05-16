<?php

return [
    'secret' => getenv('JWT_SECRET') ?: 'change-me',
    'issuer' => getenv('JWT_ISSUER') ?: 'techblog-api',
    'audience' => getenv('JWT_AUDIENCE') ?: 'techblog-client',
    'ttl' => (int) (getenv('JWT_TTL') ?: 3600),
];
