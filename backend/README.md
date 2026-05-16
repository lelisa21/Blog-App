# TechBlog Backend

This backend is intentionally very simple so beginners can work on their own files without learning a framework first.

## How It Works

1. `public/index.php` receives the request.
2. It checks `routes/api.php`.
3. The matching controller method runs.
4. The controller returns JSON.

## Main Files Beginners Need

- `routes/api.php`
  Add or change routes here.
- `src/Controllers/AuthController.php`
  Person 1 works here.
- `src/Controllers/ArticleController.php`
  Person 2 works here.
- `src/Controllers/CommentController.php`
  Person 3 works here.
- `src/Controllers/CommunityController.php`
  Person 4 works here.
- `src/Controllers/EventController.php`
  Person 5 works here.
- `src/Controllers/ResourceController.php`
  Person 6 works here.

## Keep It Simple

- The main files to work on are `routes/api.php` and the controller files.
- There is no framework and no advanced middleware flow in the current version.
- If you are just starting, ignore anything outside `routes/`, `public/`, and `src/Controllers/`.

## Endpoint Note

- Dynamic routes like `/api/events/12` and `/api/articles/5/comments` now work.
- I changed `GET /api/articles/{slug}` to `GET /api/articles/slug/{slug}` to avoid conflict with `GET /api/articles/{id}`.

## Example Route

```php
'GET /api/articles' => [ArticleController::class, 'index'],
```

This means when someone opens `/api/articles`, PHP runs the `index()` method in `ArticleController`.

## Example Controller

```php
public function index(): array
{
    return Response::success([
        'message' => 'Add your code here'
    ]);
}
```

## Local Setup

1. Create the database from `migrations/database.sql`.
2. Update values in `.env` if needed.
3. Start the server with `php -S localhost:8000 -t public`.

## Files You Can Ignore For Now

- `config/`
  These are only placeholders for later.
- `src/Models/`
  Use them later if you want to organize database queries.
- `src/Services/`
  Optional helpers, not required to make endpoints work.
- `.env`
  Only change this when you need database or app settings.

## Current Team Split

- Person 1: auth
- Person 2: articles
- Person 3: comments
- Person 4: community
- Person 5: events
- Person 6: resources

Each person can mostly stay inside their own controller file at the start.
