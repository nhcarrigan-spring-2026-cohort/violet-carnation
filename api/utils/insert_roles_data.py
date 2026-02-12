import sqlite3
from db_schema import DB_SCHEMA
from generate_roles_data import generate_roles_data

# SQLite connection
conn = sqlite3.connect("app.db")
cursor = conn.cursor()
cursor.executescript(DB_SCHEMA)


def insert_roles_data(roles_data):
    """Insert data in Roles table"""

    insert_query = """
    INSERT INTO Roles (
        user_id, organization_id, permission_level
    ) VALUES (?, ?, ?)
    """

    try:
        cursor.executemany(insert_query, roles_data)
        conn.commit()
        print(f"{len(roles_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integridad error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()


def verify_data():
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM Roles")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")

    cursor.execute("SELECT * FROM Roles LIMIT 5")
    sample_records = cursor.fetchall()

    print("\nShowing 5 records:")
    for record in sample_records:  #  user_id, organization_id, permission_level
        print(
            f"user_id: {record[0]}, organization_id: {record[1]}, permission_level: {record[2]}"
        )


# Main configuration
def execute_insert_roles_data(NUM_RECORDS):
    print("Generating synthetic data...")

    roles_data = generate_roles_data(NUM_RECORDS)

    print(f"Inserting {len(roles_data)} records in DB...")
    insert_roles_data(roles_data)

    # Verifying insertion
    verify_data()

    # Close connection
    conn.close()
    print("\nProcess complete. Connection close.\n")
