import uuid
from flask import jsonify, request
from database.connection import get_db_connection

def get_items():
    """Retrieves all dashboard items, ordered by category and order_index."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    items = []
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM dashboard_items ORDER BY category, order_index"
        cursor.execute(query)
        items = cursor.fetchall()
        
    except Exception as e:
        print(f"Error fetching items: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
    
    return jsonify(items)

def add_item():
    """Adds a new dashboard item."""
    data = request.json
    if not data or not all(k in data for k in ['name', 'url']):
        return jsonify({"error": "Missing required fields: name or url"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    item_id = str(uuid.uuid4())
    
    name = data.get('name')
    url = data.get('url')
    description = data.get('description', '')
    icon = data.get('icon', 'Link')
    category = data.get('category', 'Uncategorized')
    category_icon = data.get('categoryIcon', 'Folder')
    username = data.get('username', '')
    secret_key = data.get('secretKey', '')
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
    except Exception as e:
        print(f"Error adding item: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def update_item(item_id):
    """Updates an existing dashboard item."""
    data = request.json
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        set_clauses = []
        values = []
        
        field_map = {
            'name': 'name',
            'url': 'url',
            'description': 'description',
            'icon': 'icon',
            'category': 'category',
            'categoryIcon': 'category_icon',
            'username': 'username',
            'secretKey': 'secret_key',
            'orderIndex': 'order_index'
        }

        for key, col_name in field_map.items():
            if key in data:
                set_clauses.append(f"{col_name} = %s")
                values.append(data[key])
        
        if not set_clauses:
            return jsonify({"error": "No valid fields to update"}), 400

        values.append(item_id)

        query = f"UPDATE dashboard_items SET {', '.join(set_clauses)} WHERE id = %s"
        
        cursor.execute(query, tuple(values))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"message": "Item updated successfully"}), 200
    
    except Exception as e:
        print(f"Error updating item {item_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

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
    except Exception as e:
        print(f"Error deleting item {item_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()