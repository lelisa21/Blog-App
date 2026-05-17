TechBlog Backend
This is the backend of the TechBlog application, built using PHP and MySQL. It provides RESTful APIs for managing blog posts, user authentication, and other functionalities required by the frontend.

Quick start:
1. `composer run setup`
2. `composer run serve`

The setup command creates the configured database if needed and applies the schema in `migrations/database.sql` in a rerunnable way.

If Composer is not installed on Windows, use:
1. `.\setup.cmd` or `powershell -ExecutionPolicy Bypass -File .\setup.ps1`
2. `.\serve.cmd` or `powershell -ExecutionPolicy Bypass -File .\serve.ps1`

These scripts use the project-local `php.ini` so MySQL extensions load even if your global PHP install is missing configuration.

