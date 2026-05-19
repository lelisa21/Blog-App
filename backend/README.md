# TechBlog Backend

PHP 8.1+ REST API for the Ethiopian Tech Community (ETC) blog app. Uses MySQL, JWT authentication, and a lightweight custom router — no Composer dependencies required.

**Full manual:** [../docs/ETC-Backend-and-Frontend-Manual.md](../docs/ETC-Backend-and-Frontend-Manual.md)

---

## Quick start

### Prerequisites
- PHP 8.1+ with `pdo_mysql`, `openssl`, `mbstring` extensions
- MySQL 5.7+ or MariaDB 10.3+

### 1. Configure environment

Edit `.env` and set your DB credentials (defaults work with XAMPP/WAMP `root` with no password):

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
ADMIN_EMAIL=admin@etc.com
```

### 2. Set up the database

**Linux / Mac:**
```bash
bash setup.sh
```

**Windows:**
```bat
setup.cmd
```

**Composer:**
```bash
composer run setup
```

### 3. Start the dev server

**Linux / Mac:**
```bash
bash serve.sh
```

**Windows:**
```bat
serve.cmd
```

**Composer:**
```bash
composer run serve
```

API is at: `http://localhost:8000`

Default admin: `admin@etc.com` / `admin123`
Sample users: `lelisa@etc.com`, `ruth@etc.com`, `sami@etc.com` — all with password `admin123`

### 4. Smoke tests (no DB required)
```bash
php tests/Test.php
# or: composer run test
```

---

## Deployment (Apache)

Point document root at `backend/public/`. The included `.htaccess` files handle routing. If your virtualhost points at `backend/`, the root `.htaccess` redirects to `public/` automatically.

Make `storage/uploads/` writable by the web server:
```bash
chmod 775 storage/uploads
```

---

## API — 58 routes across 6 modules

| Module | Auth |
|--------|------|
| Auth — register, login, logout, refresh, me, profile, **avatar upload**, settings, newsletter, stats | Mixed |
| Articles — CRUD, search, categories, tags, slug | Write requires login |
| Comments — list, create, edit, delete, like; article likes & bookmarks | Write requires login |
| Community — user list/search/profile, mentorship, forum topics & replies | Write requires login |
| Events — CRUD, calendar, RSVP, attendees, reminders | Write requires login |
| Resources — downloads, learning paths, ratings, contact form, about page | Ratings/progress require login |

Send `Authorization: Bearer <access_token>` for protected routes.

### Commonly used routes
```
GET  /api/health
POST /api/auth/register          {username, email, password, full_name?}
POST /api/auth/login             {email, password}
POST /api/auth/avatar            multipart: avatar (image file)
GET  /api/auth/me
GET  /api/articles?page=1&per_page=12&category=web-development
GET  /api/articles/slug/{slug}
GET  /api/articles/search?q=php
GET  /api/events/calendar?from=2026-05-01&to=2026-05-31
GET  /api/resources?scope=downloads
GET  /api/resources/learning-paths
GET  /api/users/search?q=lelisa
GET  /api/about
POST /api/contact                {name, email, subject, message}
```

---

## Project layout

```
backend/
  .env                    DB, JWT, mail, admin email
  .htaccess               Apache root redirect to public/
  php.ini                 Cross-platform PHP config
  router.php              PHP built-in server router
  serve.sh / serve.cmd / serve.ps1
  setup.sh / setup.cmd / setup.ps1
  composer.json
  config/
    database.php
    jwt.php
    mail.php
    learning_paths.php
  migrations/
    database.sql          Full schema + real bcrypt seeds
  public/
    index.php             Entry point (auto-loads .env)
    .htaccess             Apache rewrite rules
  routes/
    api.php               58 route definitions
  scripts/
    setup.php             DB initialiser (handles CREATE IF NOT EXISTS)
  src/
    Controllers/
      AuthController.php
      ArticleController.php
      CommentController.php
      CommunityController.php
      EventController.php
      ResourceController.php
      Concerns/
        AuthenticatesRequests.php   (shared auth trait)
    Models/
      User.php  Article.php  Comment.php
      Event.php  Forum.php  Resource.php
    Services/
      TokenService.php    (hand-rolled HS256 JWT — no library needed)
      MailService.php
      CacheService.php
    Helpers/
      Response.php  Security.php  Str.php  Validator.php
    Support/
      Database.php  (PDO singleton)
      Request.php
  storage/
    downloads/            Served at /storage/downloads/...
    uploads/              Avatar uploads (must be web-writable)
  tests/
    Test.php              Smoke tests (no DB)
```

## Environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DB_HOST/PORT/NAME/USER/PASS` | MySQL connection | `127.0.0.1/3306/techblog/root/` |
| `JWT_SECRET` | HMAC signing key | `1234567ABCDAASTUIPPROJECT` |
| `JWT_TTL` | Access token lifetime (seconds) | `3600` |
| `MAIL_*` | SMTP config for `mail()` | mailtrap placeholders |
| `CONTACT_NOTIFY_EMAIL` | Admin inbox for contact form | `admin@etc.com` |
| `ADMIN_EMAIL` | Email granted admin privileges | `admin@etc.com` |
| `APP_URL` | Base URL used in download links | `http://localhost:8000` |
