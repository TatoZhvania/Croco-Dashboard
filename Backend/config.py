import os


def require_env(var_name):
    """Fetch an env var or fail fast so docker-compose/.env must supply it."""
    value = os.getenv(var_name)
    if value is None or value == '':
        raise RuntimeError(f"Missing required environment variable: {var_name}")
    return value


# Database configuration
DB_HOST = require_env('MYSQL_HOST')
DB_USER = require_env('MYSQL_USER')
DB_PASSWORD = require_env('MYSQL_PASSWORD')
DB_NAME = require_env('MYSQL_DATABASE')

# Admin credentials (used for protecting write APIs)
ADMIN_USERNAME = require_env('ADMIN_USERNAME')
ADMIN_PASSWORD = require_env('ADMIN_PASSWORD')
ADMIN_TOKEN = require_env('ADMIN_TOKEN')