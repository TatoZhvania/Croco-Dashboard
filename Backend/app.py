import os
from flask import Flask
from flask_cors import CORS
from database.connection import setup_database
from routes.items import get_items, add_item, update_item, delete_item

# --- FLASK SETUP ---
app = Flask(__name__)
CORS(app)

# Initialize the database on startup
setup_database()

# --- API ROUTES ---
app.route('/api/items', methods=['GET'])(get_items)
app.route('/api/items', methods=['POST'])(add_item)
app.route('/api/items/<string:item_id>', methods=['PUT'])(update_item)
app.route('/api/items/<string:item_id>', methods=['DELETE'])(delete_item)

# --- RUN THE APP ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)