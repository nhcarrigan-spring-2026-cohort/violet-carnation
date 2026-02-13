import sqlite3

from generate_roles_data import generate_roles_data


def insert_roles_data(conn, cursor, roles_data):
    """Insert data in Roles table"""

    insert_query = """
    INSERT INTO roles (
        user_id, organization_id, permission_level
    ) VALUES (?, ?, ?)
    """

    try:
        cursor.executemany(insert_query, roles_data)
        conn.commit()
        print(f"{len(roles_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integrity error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()


def verify_data(cursor):
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM roles")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")

    cursor.execute("SELECT * FROM roles LIMIT 5")
    sample_records = cursor.fetchall()

    print("\nShowing 5 records:")
    for record in sample_records:  #  user_id, organization_id, permission_level
        print(
            f"user_id: {record[0]}, organization_id: {record[1]}, permission_level: {record[2]}"
        )


# Main configuration
def execute_insert_roles_data(conn, cursor, num_records):
    print("Generating synthetic data...")

    roles_data = generate_roles_data(num_records)

    print(f"Inserting {len(roles_data)} records in DB...")
    insert_roles_data(conn, cursor, roles_data)

    # Verifying insertion
    verify_data(cursor)
