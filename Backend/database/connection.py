import mysql.connector
from mysql.connector import Error
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

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
        print(f"Error connecting to MySQL database: {e}")
        return None

def setup_database():
    """Ensures the necessary table exists in the database."""
    conn = get_db_connection()
    if conn is None:
        return

    try:
        cursor = conn.cursor()
        
        # Create dashboard_items table
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
            order_index DOUBLE,
            is_admin_only BOOLEAN DEFAULT FALSE,
            size VARCHAR(20) DEFAULT 'medium'
        );
        """
        cursor.execute(create_table_query)
        
        # Create category_order table
        create_category_order_table = """
        CREATE TABLE IF NOT EXISTS category_order (
            category_name VARCHAR(100) PRIMARY KEY,
            order_index INT NOT NULL DEFAULT 0
        );
        """
        cursor.execute(create_category_order_table)
        
        # Ensure existing deployments upgrade from FLOAT to DOUBLE so that
        # large order_index values (used for drag/drop) retain precision.
        cursor.execute("ALTER TABLE dashboard_items MODIFY COLUMN order_index DOUBLE")
        
        # Add is_admin_only column to existing tables if it doesn't exist
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'dashboard_items' 
            AND COLUMN_NAME = 'is_admin_only'
        """)
        column_exists = cursor.fetchone()[0]
        if column_exists == 0:
            cursor.execute("ALTER TABLE dashboard_items ADD COLUMN is_admin_only BOOLEAN DEFAULT FALSE")
        
        # Add size column to existing tables if it doesn't exist
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'dashboard_items' 
            AND COLUMN_NAME = 'size'
        """)
        size_column_exists = cursor.fetchone()[0]
        if size_column_exists == 0:
            cursor.execute("ALTER TABLE dashboard_items ADD COLUMN size VARCHAR(20) DEFAULT 'medium'")
        
        conn.commit()
    except Error as e:
        print(f"Error setting up database: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()