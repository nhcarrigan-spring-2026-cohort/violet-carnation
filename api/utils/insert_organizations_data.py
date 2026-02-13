import sqlite3

from generate_organizations_data import generate_organizations_data


def insert_orgs_data(conn, cursor, orgs_data):
    """Insert data in organizations table"""

    insert_query = """
    INSERT INTO organizations (
        created_by_user_id, name, description
    ) VALUES (?, ?, ?)
    """

    try:
        cursor.executemany(insert_query, orgs_data)
        conn.commit()
        print(f"{len(orgs_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integrity error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()


def verify_data(cursor):
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM organizations")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")

    cursor.execute("SELECT * FROM organizations LIMIT 5")
    sample_records = cursor.fetchall()

    print("\nShowing 5 records:")
    for record in sample_records:  # legal_name, public_name, email, phone, country
        print(f"ID: {record[0]}, created_by_user_id: {record[1]}, name: {record[2]}")


# Main configuration
def execute_insert_orgs_data(conn, cursor, org_list_file):
    print("Generating synthetic data...")

    orgs_data = generate_organizations_data(org_list_file, conn)

    print(f"Inserting {len(orgs_data)} records in DB...")
    insert_orgs_data(conn, cursor, orgs_data)

    # Verifying insertion
    verify_data(cursor)
