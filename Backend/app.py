import os
from flask import Flask, jsonify
from flask_cors import CORS
from database.connection import setup_database
from routes.auth import login, session_status
from routes.items import get_items, add_item, update_item, delete_item, export_items, import_items
from routes.category_order import get_category_order, update_category_order, delete_category_order

# --- FLASK SETUP ---
app = Flask(__name__)
CORS(app)

# Initialize the database on startup
setup_database()

# --- HEALTH CHECK ENDPOINT ---
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker and monitoring."""
    return jsonify({"status": "healthy", "service": "dashboard-backend"}), 200

# --- API ROUTES ---
app.route('/api/login', methods=['POST'])(login)
app.route('/api/auth/status', methods=['GET'])(session_status)
app.route('/api/items', methods=['GET'])(get_items)
app.route('/api/items', methods=['POST'])(add_item)
app.route('/api/items/<string:item_id>', methods=['PUT'])(update_item)
app.route('/api/items/<string:item_id>', methods=['DELETE'])(delete_item)
app.route('/api/items/export', methods=['GET'])(export_items)
app.route('/api/items/import', methods=['POST'])(import_items)
app.route('/api/category-order', methods=['GET'])(get_category_order)
app.route('/api/category-order', methods=['PUT'])(update_category_order)
app.route('/api/category-order/<string:category_name>', methods=['DELETE'])(delete_category_order)

# --- RUN THE APP ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
