<?php

declare(strict_types=1);

$base = dirname(__DIR__);

spl_autoload_register(static function (string $class) use ($base): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = $base . '/src/' . str_replace('\\', DIRECTORY_SEPARATOR, $relative) . '.php';

    if (is_file($path)) {
        require_once $path;
    }
});

require_once $base . '/src/Helpers/Response.php';
require_once $base . '/src/Helpers/Str.php';

$failures = 0;

function assertTrue(bool $condition, string $message): void
{
    global $failures;
    if (!$condition) {
        echo "FAIL: {$message}" . PHP_EOL;
        $failures++;
    }
}

assertTrue(class_exists(\App\Helpers\Str::class), 'Str helper loads');
assertTrue(\App\Helpers\Str::slug('Hello World!') === 'hello-world', 'Str::slug works');

$success = \App\Helpers\Response::success(['ok' => true], 'Test');
assertTrue($success['success'] === true && $success['data']['ok'] === true, 'Response::success shape');

$error = \App\Helpers\Response::error('Nope', 422);
assertTrue($error['success'] === false && $error['status'] === 422, 'Response::error shape');

$routes = require $base . '/routes/api.php';
assertTrue(isset($routes['GET /api/articles/search']), 'articles search route exists');
assertTrue(isset($routes['GET /api/events/calendar']), 'events calendar route exists');
assertTrue(isset($routes['GET /api/users/search']), 'users search route exists');

$controllerFiles = [
    'ArticleController.php',
    'CommentController.php',
    'CommunityController.php',
    'EventController.php',
    'ResourceController.php',
    'AuthController.php',
];

foreach ($controllerFiles as $file) {
    $path = $base . '/src/Controllers/' . $file;
    assertTrue(is_file($path), "{$file} exists");
    $source = (string) file_get_contents($path);
    assertTrue(!str_contains($source, 'Starter endpoint is ready'), "{$file} is implemented");
}

if ($failures > 0) {
    echo PHP_EOL . "{$failures} test(s) failed." . PHP_EOL;
    exit(1);
}

echo 'All backend smoke tests passed.' . PHP_EOL;
