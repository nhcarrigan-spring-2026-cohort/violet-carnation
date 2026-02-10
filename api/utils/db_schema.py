# DB schema definition for sqlite3 database, is used by the initialization function  in db.py
# and is used in the populate_db.py script, which can be ran to populate the database with fake data
DB_SCHEMA =  """
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    availability TEXT CHECK(availability IN ('Full-time', 'Part-time', 'Weekends', 'Evenings')) DEFAULT 'Part-time'
);
CREATE TABLE IF NOT EXISTS organizations (
    organization_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_by_user_id INTEGER NOT NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS roles (
    user_id INTEGER NOT NULL,
    organization_id INTEGER NOT NULL,
    permission_level TEXT NOT NULL,
    CHECK (permission_level IN ('admin', 'volunteer')),
    PRIMARY KEY (user_id, organization_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
"""


# DB schema for nuking the database, useful for testing and development when you want to reset the database
DROP_DB_SQL = """
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS roles;
"""
