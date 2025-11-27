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
        print(f"Error setting up database: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()