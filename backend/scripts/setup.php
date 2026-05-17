<?php

declare(strict_types=1);

loadDotEnv(__DIR__ . '/../.env');

$config = require __DIR__ . '/../config/database.php';
$sqlPath = __DIR__ . '/../migrations/database.sql';

if (!is_file($sqlPath)) {
    fwrite(STDERR, "Migration file not found: {$sqlPath}" . PHP_EOL);
    exit(1);
}

$databaseName = (string) $config['database'];
$charset = (string) $config['charset'];
$serverDsn = sprintf(
    '%s:host=%s;port=%s;charset=%s',
    $config['driver'],
    $config['host'],
    $config['port'],
    $charset
);

try {
    $server = new PDO($serverDsn, (string) $config['username'], (string) $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $server->exec(sprintf('CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET %s COLLATE %s_unicode_ci', $databaseName, $charset, $charset));

    $dbDsn = sprintf(
        '%s:host=%s;port=%s;dbname=%s;charset=%s',
        $config['driver'],
        $config['host'],
        $config['port'],
        $databaseName,
        $charset
    );

    $db = new PDO($dbDsn, (string) $config['username'], (string) $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $statements = parseSqlStatements((string) file_get_contents($sqlPath));
    $executed = 0;

    foreach ($statements as $statement) {
        $normalized = normalizeStatement($statement);
        if ($normalized === null) {
            continue;
        }

        $db->exec($normalized);
        $executed++;
    }

    fwrite(STDOUT, "Setup complete." . PHP_EOL);
    fwrite(STDOUT, "Database: {$databaseName}" . PHP_EOL);
    fwrite(STDOUT, "Statements executed: {$executed}" . PHP_EOL);
    fwrite(STDOUT, "You can now run: composer run serve" . PHP_EOL);
} catch (Throwable $exception) {
    fwrite(STDERR, "Setup failed: " . $exception->getMessage() . PHP_EOL);
    exit(1);
}

function loadDotEnv(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $trimmed, 2);
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");

        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

function parseSqlStatements(string $sql): array
{
    $statements = [];
    $buffer = '';
    $inSingleQuote = false;
    $inDoubleQuote = false;
    $length = strlen($sql);

    for ($i = 0; $i < $length; $i++) {
        $char = $sql[$i];
        $next = $i + 1 < $length ? $sql[$i + 1] : '';

        if (!$inSingleQuote && !$inDoubleQuote && $char === '-' && $next === '-') {
            while ($i < $length && $sql[$i] !== "\n") {
                $i++;
            }
            continue;
        }

        if ($char === "'" && !$inDoubleQuote) {
            $escaped = $i > 0 && $sql[$i - 1] === '\\';
            if (!$escaped) {
                $inSingleQuote = !$inSingleQuote;
            }
        } elseif ($char === '"' && !$inSingleQuote) {
            $escaped = $i > 0 && $sql[$i - 1] === '\\';
            if (!$escaped) {
                $inDoubleQuote = !$inDoubleQuote;
            }
        }

        if ($char === ';' && !$inSingleQuote && !$inDoubleQuote) {
            $statement = trim($buffer);
            if ($statement !== '') {
                $statements[] = $statement;
            }
            $buffer = '';
            continue;
        }

        $buffer .= $char;
    }

    $tail = trim($buffer);
    if ($tail !== '') {
        $statements[] = $tail;
    }

    return $statements;
}

function normalizeStatement(string $statement): ?string
{
    $trimmed = trim($statement);
    $upper = strtoupper($trimmed);

    $skipPrefixes = [
        'DROP DATABASE',
        'CREATE DATABASE',
        'USE ',
        'SHOW TABLES',
        'SELECT ',
    ];

    foreach ($skipPrefixes as $prefix) {
        if (str_starts_with($upper, $prefix)) {
            return null;
        }
    }

    if (str_starts_with($upper, 'CREATE TABLE ') && !str_contains($upper, 'CREATE TABLE IF NOT EXISTS')) {
        $trimmed = preg_replace('/^CREATE\s+TABLE\s+/i', 'CREATE TABLE IF NOT EXISTS ', $trimmed, 1) ?? $trimmed;
    }

    if (str_starts_with($upper, 'INSERT INTO ')) {
        $trimmed = preg_replace('/^INSERT\s+INTO\s+/i', 'INSERT IGNORE INTO ', $trimmed, 1) ?? $trimmed;
    }

    if (str_contains($trimmed, '$2y$10$YourHashHere')) {
        $trimmed = str_replace('$2y$10$YourHashHere', password_hash('admin123', PASSWORD_BCRYPT), $trimmed);
    }

    return $trimmed;
}
