# DB schema definition for sqlite3 database, is used by the initialization function  in db.py
# and is used in the populate_db.py script, which can be ran to populate the database with fake data
DB_SCHEMA =  """
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


# DB schema for nuking the database, useful for testing and development when you want to reset the database
DROP_DB_SQL = """
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS roles;
"""