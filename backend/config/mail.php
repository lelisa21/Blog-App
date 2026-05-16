<?php

return [
    'host' => getenv('MAIL_HOST') ?: 'smtp.mailtrap.io',
    'port' => getenv('MAIL_PORT') ?: 2525,
    'username' => getenv('MAIL_USER') ?: '',
    'password' => getenv('MAIL_PASS') ?: '',
    'from_address' => getenv('MAIL_FROM_ADDRESS') ?: 'noreply@techblogethiopia.com',
    'from_name' => getenv('MAIL_FROM_NAME') ?: 'TechBlog',
];
