import sqlite3
from db_schema import DB_SCHEMA
from generate_organizations_data import generate_organizations_data

# SQLite connection
conn = sqlite3.connect("app.db")
cursor = conn.cursor()
cursor.executescript(DB_SCHEMA)


def insert_orgs_data(orgs_data):
    """Insert data in Organizations table"""

    insert_query = """
    INSERT INTO Organizations (
        created_by_user_id, name, description
    ) VALUES (?, ?, ?)
    """

    try:
        cursor.executemany(insert_query, orgs_data)
        conn.commit()
        print(f"{len(orgs_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integridad error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()


def verify_data():
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM Organizations")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")

    cursor.execute("SELECT * FROM organizations LIMIT 5")
    sample_records = cursor.fetchall()

    print("\nShowing 5 records:")
    for record in sample_records:  # legal_name, public_name, email, phone, country
        print(f"ID: {record[0]}, created_by_user_id: {record[1]}, name: {record[2]}")


# Main configuration
def execute_insert_orgs_data(org_list_file):
    print("Generating synthetic data...")

    orgs_data = generate_organizations_data(org_list_file)

    print(f"Inserting {len(orgs_data)} records in DB...")
    insert_orgs_data(orgs_data)

    # Verifying insertion
    verify_data()

    # Close connection
    conn.close()
    print("\nProcess complete. Connection close.\n")
