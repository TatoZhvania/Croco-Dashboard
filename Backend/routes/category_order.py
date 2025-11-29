from flask import jsonify, request
from database.connection import get_db_connection
from utils.auth_helper import require_admin

def get_category_order():
    """Get all category orders."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT category_name, order_index FROM category_order ORDER BY order_index"
        cursor.execute(query)
        orders = cursor.fetchall()
        
        # Convert to dictionary format: {category_name: order_index}
        result = {row['category_name']: row['order_index'] for row in orders}
        return jsonify(result)
        
    except Exception as e:
        print(f"Error fetching category order: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@require_admin
def update_category_order():
    """Update category order. Expects JSON: {category_name: order_index, ...}"""
    data = request.json
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid data format"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        # Use INSERT ... ON DUPLICATE KEY UPDATE for upsert behavior
        for category_name, order_index in data.items():
            query = """
            INSERT INTO category_order (category_name, order_index) 
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE order_index = %s
            """
            cursor.execute(query, (category_name, order_index, order_index))
        
        conn.commit()
        return jsonify({"message": "Category order updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating category order: {e}")
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@require_admin
def delete_category_order(category_name):
    """Delete a category order entry (when category is deleted)."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "DELETE FROM category_order WHERE category_name = %s"
        cursor.execute(query, (category_name,))
        conn.commit()
        return jsonify({"message": "Category order deleted successfully"}), 200
        
    except Exception as e:
        print(f"Error deleting category order: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
