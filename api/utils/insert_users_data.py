import sqlite3

from genarate_users_data import generate_user_data


def insert_users_data(conn, cursor, users_data):
    """Insert data in Users table"""
    insert_query = """
    INSERT INTO users (
        email, first_name, last_name, availability
    ) VALUES (?, ?, ?, ?)
    """
    try:
        cursor.executemany(insert_query, users_data)
        conn.commit()
        print(f"{len(users_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integridad error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()


def verify_data(cursor):
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")
    cursor.execute("SELECT * FROM users LIMIT 5")
    sample_records = cursor.fetchall()

    print("\nShowing 5 records:")
    for record in sample_records:
        print(
            f"ID: {record[0]}, Email: {record[1]}, Name: {record[2]} {record[3]}, "
            f"Availability: {record[4]}"
        )


# Main configuration
def execute_insert_users_data(conn, cursor, num_records):
    print("Generating synthetic data...")
    generated_data = generate_user_data(num_records)
    users_data = [
        (email, first_name, last_name, availability)
        for email, _, first_name, last_name, *_, availability, _, _ in generated_data
    ]
    print(f"Inserting {num_records} records in DB...")
    insert_users_data(conn, cursor, users_data)

    # Verifying insertion
    verify_data(cursor)
