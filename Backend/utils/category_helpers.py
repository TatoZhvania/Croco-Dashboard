"""Helper functions for category management."""
from database.connection import get_db_connection

def ensure_category_order_exists(category_name):
    """
    Ensure a category exists in category_order table.
    Creates entry with default order if it doesn't exist.
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Get max order_index to append new category at the end
        cursor.execute("SELECT COALESCE(MAX(order_index), -1) as max_order FROM category_order")
        max_order = cursor.fetchone()[0]
        
        # Insert if not exists
        query = """
        INSERT INTO category_order (category_name, order_index) 
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE category_name = category_name
        """
        cursor.execute(query, (category_name, max_order + 1))
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error ensuring category order: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


def sync_category_orders():
    """
    Synchronize category_order with actual categories in dashboard_items.
    Adds missing categories and optionally removes orphaned ones.
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Get all unique categories from items
        cursor.execute("SELECT DISTINCT category FROM dashboard_items WHERE category IS NOT NULL")
        existing_categories = [row[0] for row in cursor.fetchall()]
        
        # Get max order for appending
        cursor.execute("SELECT COALESCE(MAX(order_index), -1) as max_order FROM category_order")
        max_order = cursor.fetchone()[0]
        
        # Add missing categories
        for idx, category in enumerate(existing_categories):
            query = """
            INSERT INTO category_order (category_name, order_index) 
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE category_name = category_name
            """
            cursor.execute(query, (category, max_order + idx + 1))
        
        # Optional: Remove categories that no longer have items
        # Uncomment if you want automatic cleanup
        # cursor.execute("""
        #     DELETE FROM category_order 
        #     WHERE category_name NOT IN (
        #         SELECT DISTINCT category FROM dashboard_items
        #     )
        # """)
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error syncing category orders: {e}")
        return False
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
