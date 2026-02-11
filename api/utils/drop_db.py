import os
import sqlite3

from db_schema import DROP_DB_SQL


def drop_db():
    """
    Drops the current database at the app.db file.
    """

    db_path = "app.db"

    # sanity check that there is even a database file to drop
    if not os.path.isfile(db_path):
        raise FileNotFoundError(
            "No app.db file found. See CONTRIBUTING.md for instructions on how to initialize the database, or run the dev server to create a populated database."
        )

    conn = sqlite3.connect(db_path)
    conn.executescript(DROP_DB_SQL)
    conn.commit()
    conn.close()

    print(
        "dropped database successfully, you can now run populate_db.py to re-initialize and seed the database"
    )


if __name__ == "__main__":
    drop_db()
