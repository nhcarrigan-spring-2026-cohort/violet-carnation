from pathlib import Path
import sqlite3

from utils.db_schema import DB_SCHEMA

DATABASE_PATH = Path(__file__).resolve().parent / "app.db"


def init_db() -> None:
    """
    Initialize the database by creating necessary tables.

    At the time of writing, this only creates the 'users' table as an example schema.
    """
    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.executescript(DB_SCHEMA)
        conn.commit()


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
