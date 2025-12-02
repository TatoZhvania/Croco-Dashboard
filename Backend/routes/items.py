import uuid
from flask import jsonify, request
from database.connection import get_db_connection
from utils.auth_helper import require_admin, extract_token
from utils.category_helpers import ensure_category_order_exists
from config import ADMIN_TOKEN

def get_items():
    """Retrieves all dashboard items, ordered by category and order_index."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    items = []
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Check if user is admin
        token = extract_token()
        is_admin = (token == ADMIN_TOKEN)
        
        # If admin, return all items. Otherwise, filter out admin-only items
        if is_admin:
            query = "SELECT * FROM dashboard_items ORDER BY category, order_index"
        else:
            query = "SELECT * FROM dashboard_items WHERE is_admin_only = FALSE OR is_admin_only IS NULL ORDER BY category, order_index"
        
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

@require_admin
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
    is_admin_only = data.get('isAdminOnly', False)

    try:
        cursor = conn.cursor()
        query = """
        INSERT INTO dashboard_items 
        (id, name, url, description, icon, category, category_icon, username, secret_key, order_index, is_admin_only) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            item_id, name, url, description, icon, category, category_icon, username, secret_key, order_index, is_admin_only
        ))
        conn.commit()
        
        # Ensure category exists in category_order table
        ensure_category_order_exists(category)
        
        return jsonify({"message": "Item added successfully", "id": item_id}), 201
    except Exception as e:
        print(f"Error adding item: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@require_admin
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

        # Ensure the item exists before attempting an update. MySQL returns
        # rowcount 0 when values are unchanged, which was incorrectly treated
        # as "not found" during reordering.
        cursor.execute("SELECT 1 FROM dashboard_items WHERE id = %s", (item_id,))
        if cursor.fetchone() is None:
            return jsonify({"error": "Item not found"}), 404
        
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
            'orderIndex': 'order_index',
            'isAdminOnly': 'is_admin_only'
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

        # cursor.rowcount can be 0 when the new values equal the existing ones.
        return jsonify({"message": "Item updated successfully"}), 200
    
    except Exception as e:
        print(f"Error updating item {item_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@require_admin
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


@require_admin
def export_items():
    """Export all items (admin only) in a transport-friendly payload."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM dashboard_items ORDER BY category, order_index"
        cursor.execute(query)
        items = cursor.fetchall()
        return jsonify({"items": items}), 200
    except Exception as e:
        print(f"Error exporting items: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


@require_admin
def import_items():
    """Import a list of items. Optionally replace all existing items first."""
    payload = request.get_json(silent=True) or {}
    incoming_items = payload.get("items") or payload.get("data")
    replace_existing = bool(payload.get("replaceExisting", False))

    if not isinstance(incoming_items, list) or len(incoming_items) == 0:
        return jsonify({"error": "Payload must include a non-empty 'items' array"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        if replace_existing:
            cursor.execute("DELETE FROM dashboard_items")
            conn.commit()

        insert_query = """
            INSERT INTO dashboard_items
            (id, name, url, description, icon, category, category_icon, username, secret_key, order_index, is_admin_only)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                url = VALUES(url),
                description = VALUES(description),
                icon = VALUES(icon),
                category = VALUES(category),
                category_icon = VALUES(category_icon),
                username = VALUES(username),
                secret_key = VALUES(secret_key),
                order_index = VALUES(order_index),
                is_admin_only = VALUES(is_admin_only)
        """

        for idx, item in enumerate(incoming_items):
            if not isinstance(item, dict):
                continue

            item_id = item.get("id") or str(uuid.uuid4())
            name = item.get("name") or "Untitled"
            url = item.get("url") or ""
            description = item.get("description") or ""
            icon = item.get("icon") or "Link"
            category = item.get("category") or "Uncategorized"
            category_icon = item.get("category_icon") or item.get("categoryIcon") or "Folder"
            username = item.get("username") or ""
            secret_key = item.get("secret_key") or item.get("secretKey") or ""
            order_index = item.get("order_index")
            if order_index is None:
                order_index = float(idx)
            is_admin_only = item.get("is_admin_only") or item.get("isAdminOnly") or False

            cursor.execute(insert_query, (
                item_id,
                name,
                url,
                description,
                icon,
                category,
                category_icon,
                username,
                secret_key,
                order_index,
                is_admin_only
            ))

        conn.commit()
        return jsonify({"message": "Import completed", "count": len(incoming_items)}), 200
    except Exception as e:
        print(f"Error importing items: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
