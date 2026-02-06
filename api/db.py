from pathlib import Path
import sqlite3

DATABASE_PATH = Path(__file__).resolve().parent / "app.db"


def init_db() -> None:
    """
    Initialize the database by creating necessary tables.

    At the time of writing, this only creates the 'users' table as an example schema.
    """
    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS organizations (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS roles (
                user_id INTEGER NOT NULL,
                organization_id INTEGER NOT NULL,
                permission_level TEXT NOT NULL,
                CHECK (permission_level IN ('admin', 'volunteer')),
                PRIMARY KEY (user_id, organization_id)
            );
            """
        )
        conn.commit()


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
