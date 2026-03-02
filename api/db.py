import sqlite3
from pathlib import Path

from utils.db_schema import DB_SCHEMA

DATABASE_PATH = Path(__file__).resolve().parent / "app.db"


def init_db() -> None:
    """
    Initialize the database by creating necessary tables.

    At the time of writing, this only creates the 'users' table as an example schema.
    """
    with sqlite3.connect(DATABASE_PATH, check_same_thread=False) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.executescript(DB_SCHEMA)
        conn.commit()


def get_connection():
    # the check_same_thread prevents a common issue where sqlite flags the fact
    # that the connection is being used across multiple threads
    # (which can happen in a web server context)
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
