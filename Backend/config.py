import os

# Database configuration
DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
DB_USER = os.getenv('MYSQL_USER', 'user')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
DB_NAME = os.getenv('MYSQL_DATABASE', 'dashboard_db')