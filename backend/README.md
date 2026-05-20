# TechBlog Backend

PHP 8.1+ REST API for the Ethiopian Tech Community (ETC) blog app. Uses MySQL, JWT authentication, and a lightweight custom router.

**Full manual (~15 pages):** [../docs/ETC-Backend-and-Frontend-Manual.md](../docs/ETC-Backend-and-Frontend-Manual.md) — architecture, API reference, database, and frontend integration.

## Quick start

1. Install [PHP](https://windows.php.net/download/) with `pdo_mysql` enabled (project `php.ini` points at `C:\php\ext` on Windows).
2. Install and start **MySQL** (XAMPP, WAMP, or standalone). Default `.env` uses `root` with no password.
3. From this folder:

```bash
composer run setup
composer run serve
```

Or on Windows:

```bat
.\setup.cmd
.\serve.cmd
```

API base URL: `http://localhost:8000`

Default admin: `admin@etc.com` / `admin123`

## Scripts

| Command | Description |
|---------|-------------|
| `composer run setup` | Create DB, run migrations + seeds |
| `composer run serve` | Dev server on port 8000 |
| `composer run test` | Smoke tests (no DB required) |

## API modules

| Module | Endpoints | Auth |
|--------|-----------|------|
| **Health / Auth** | register, login, logout, refresh, profile, settings, newsletter, stats | Mixed |
| **Articles** | CRUD, search, categories, tags, slug lookup | Create/edit requires login |
| **Comments** | article comments, likes, bookmarks | Mutations require login |
| **Community** | users, search, mentorship, forum topics/replies | Mutations require login |
| **Events** | CRUD, calendar, RSVP, attendees, reminders | Mutations require login |
| **Resources** | downloads, learning paths, ratings, contact, about | Ratings/progress require login |

### Key routes

- `GET /api/health` — service status
- `GET /api/articles`, `GET /api/articles/search?q=...`
- `GET /api/articles/{id}`, `GET /api/articles/slug/{slug}`
- `GET /api/events/calendar?from=...&to=...`
- `GET /api/users/search?q=...`
- `GET /api/resources?scope=downloads`
- `GET /api/about`

Send `Authorization: Bearer <access_token>` for protected routes.

## Project layout

```
backend/
  config/          JWT, mail, database, learning paths
  migrations/      database.sql (schema + seeds)
  public/          index.php entry (via router.php)
  routes/api.php   Route map
  scripts/setup.php
  src/
    Controllers/   HTTP handlers
    Models/        Database access
    Services/      Mail, JWT, validation
    Helpers/       Response, Security, Str
  storage/downloads/
  tests/Test.php
```

## Environment (`.env`)

| Variable | Purpose |
|----------|---------|
| `DB_*` | MySQL connection |
| `JWT_*` | Token signing |
| `MAIL_*` | Contact form email |
| `CONTACT_NOTIFY_EMAIL` | Admin inbox for contact form |
