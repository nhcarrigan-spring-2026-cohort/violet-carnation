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
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT,
                birth_date TEXT,
                gender TEXT CHECK(gender IN ('Male', 'Female', 'Other', 'Prefer not to say')) DEFAULT 'Prefer not to say',
                identification_number TEXT UNIQUE,
                country TEXT,
                city TEXT,
                address TEXT,
                profile_picture TEXT,
                education TEXT,
                skills TEXT,
                availability TEXT CHECK(availability IN ('Full-time', 'Part-time', 'Weekends', 'Evenings')) DEFAULT 'Part-time',
                active INTEGER DEFAULT 1,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
