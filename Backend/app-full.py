import os
import uuid
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

# --- CONFIGURATION ---

# Note: In a Docker Compose environment, these variables are typically
# injected via environment variables.

# Database configuration (using Docker service names if applicable)
DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
DB_USER = os.getenv('MYSQL_USER', 'user')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
DB_NAME = os.getenv('MYSQL_DATABASE', 'dashboard_db')

# --- FLASK SETUP ---

app = Flask(__name__)
# Enable CORS for the React frontend running on a different port/service
CORS(app) 

# --- DATABASE CONNECTION UTILITIES ---

def get_db_connection():
    """Establishes and returns a connection to the MySQL database."""
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return conn
    except Error as e:
        app.logger.error(f"Error connecting to MySQL database: {e}")
        return None

def setup_database():
    """Ensures the necessary table exists in the database."""
    conn = get_db_connection()
    if conn is None:
        return

    try:
        cursor = conn.cursor()
        # The table now includes 'category', 'category_icon', 'username', 
        # 'secret_key', and the essential 'order_index' for reordering.
        create_table_query = """
        CREATE TABLE IF NOT EXISTS dashboard_items (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            url VARCHAR(2048) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            category VARCHAR(100),
            category_icon VARCHAR(50),
            username VARCHAR(255),
            secret_key TEXT,
            order_index FLOAT
        );
        """
        cursor.execute(create_table_query)
        conn.commit()
    except Error as e:
        app.logger.error(f"Error setting up database: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# Initialize the database on startup
setup_database()

# --- API ROUTES ---

@app.route('/api/items', methods=['GET'])
def get_items():
    """Retrieves all dashboard items, ordered by category and order_index."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    items = []
    try:
        cursor = conn.cursor(dictionary=True)
        # Sort items by category name and then by the float order_index
        query = "SELECT * FROM dashboard_items ORDER BY category, order_index"
        cursor.execute(query)
        items = cursor.fetchall()
        
    except Error as e:
        app.logger.error(f"Error fetching items: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
    
    return jsonify(items)


@app.route('/api/items', methods=['POST'])
def add_item():
    """Adds a new dashboard item."""
    data = request.json
    if not data or not all(k in data for k in ['name', 'url']):
        return jsonify({"error": "Missing required fields: name or url"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    item_id = str(uuid.uuid4())
    
    # Use .get() with defaults for optional fields, including the new ones
    name = data.get('name')
    url = data.get('url')
    description = data.get('description', '')
    icon = data.get('icon', 'Link')
    category = data.get('category', 'Uncategorized')
    category_icon = data.get('categoryIcon', 'Folder') # New field
    username = data.get('username', '')
    secret_key = data.get('secretKey', '')
    # The frontend is sending a high timestamp/float to push new items to the end
    order_index = data.get('orderIndex', 0.0) 

    try:
        cursor = conn.cursor()
        query = """
        INSERT INTO dashboard_items 
        (id, name, url, description, icon, category, category_icon, username, secret_key, order_index) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            item_id, name, url, description, icon, category, category_icon, username, secret_key, order_index
        ))
        conn.commit()
        return jsonify({"message": "Item added successfully", "id": item_id}), 201
    except Error as e:
        app.logger.error(f"Error adding item: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


@app.route('/api/items/<string:item_id>', methods=['PUT'])
def update_item(item_id):
    """
    Updates an existing dashboard item.
    This route now handles all fields, including order_index for drag-and-drop.
    """
    data = request.json
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        # Build the dynamic update query string
        set_clauses = []
        values = []
        
        # Map frontend keys to SQL column names
        field_map = {
            'name': 'name',
            'url': 'url',
            'description': 'description',
            'icon': 'icon',
            'category': 'category',
            'categoryIcon': 'category_icon',
            'username': 'username',
            'secretKey': 'secret_key',
            'orderIndex': 'order_index' # CRITICAL for reordering
        }

        for key, col_name in field_map.items():
            # Safely check if the key exists in the incoming JSON data
            if key in data:
                set_clauses.append(f"{col_name} = %s")
                values.append(data[key])
        
        if not set_clauses:
            return jsonify({"error": "No valid fields to update"}), 400

        # Add the item_id to the values list for the WHERE clause
        values.append(item_id)

        query = f"UPDATE dashboard_items SET {', '.join(set_clauses)} WHERE id = %s"
        
        cursor.execute(query, tuple(values))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"message": "Item updated successfully"}), 200
    
    except Error as e:
        app.logger.error(f"Error updating item {item_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


@app.route('/api/items/<string:item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Deletes a dashboard item."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "DELETE FROM dashboard_items WHERE id = %s"
        cursor.execute(query, (item_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"message": "Item deleted successfully"}), 200
    except Error as e:
        app.logger.error(f"Error deleting item {item_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# --- RUN THE APP ---

if __name__ == '__main__':
    # When running locally, start the app on port 5000
    # In a Docker Compose environment, this will typically run inside the 'api' container
    app.run(debug=True, host='0.0.0.0', port=5000)