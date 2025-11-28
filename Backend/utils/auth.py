from functools import wraps
from flask import request, jsonify
from config import ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_TOKEN


def extract_token():
    """Pull admin token from Authorization or X-Admin-Token headers."""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1]
    # Fallback to direct Authorization token or X-Admin-Token
    return auth_header or request.headers.get('X-Admin-Token')


def require_admin(func):
    """Decorator to guard routes that mutate data."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = extract_token()
        if token != ADMIN_TOKEN:
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    return wrapper


def valid_credentials(username, password):
    """Check provided credentials against configured admin values."""
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def build_auth_payload():
    """Return a standard response payload for successful admin auth."""
    return {
        "token": ADMIN_TOKEN,
        "role": "admin",
        "username": ADMIN_USERNAME
    }
