from flask import jsonify, request
from utils.auth import valid_credentials, extract_token, build_auth_payload


def login():
    """Authenticate an admin user and return an access token."""
    data = request.json or {}
    username = data.get('username', '')
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if not valid_credentials(username, password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify(build_auth_payload()), 200


def session_status():
    """Validate an existing token and return current auth state."""
    payload = build_auth_payload()
    token = extract_token()
    if token == payload["token"]:
        return jsonify({**payload, "authenticated": True}), 200

    return jsonify({"authenticated": False}), 401
