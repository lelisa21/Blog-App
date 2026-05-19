<?php

declare(strict_types=1);

namespace App\Services;

class MailService
{
    public function send(string $to, string $subject, string $body): bool
    {
        $config = require __DIR__ . '/../../config/mail.php';
        $fromAddress = (string) $config['from_address'];
        $fromName = (string) $config['from_name'];

        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/plain; charset=UTF-8',
            sprintf('From: %s <%s>', $fromName, $fromAddress),
            sprintf('Reply-To: %s', $fromAddress),
        ];

        $sent = @mail($to, $subject, $body, implode("\r\n", $headers));

        if (!$sent) {
            error_log(sprintf('[MailService] Failed to send "%s" to %s', $subject, $to));
        }

        return $sent;
    }
}
