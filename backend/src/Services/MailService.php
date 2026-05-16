<?php

declare(strict_types=1);

namespace App\Services;

class MailService
{
    public function send(string $to, string $subject, string $body): bool
    {
        return true;
    }
}
