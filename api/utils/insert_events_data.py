import sqlite3

from generate_events_data import generate_events_data


def insert_events_data(conn, cursor, events_data):
    # insert data into events table
    insert_query = """
    INSERT INTO events (
        name, description, location, date_time, organization_id, category
    ) VALUES (?, ?, ?, ?, ?, ?)
    """
    # insert data in parameters into database
    # print error message if unsuccessful
    try:
        cursor.executemany(insert_query, events_data)
        conn.commit()
        print(f"{len(events_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integrity error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()


def verify_data(cursor):
    # verify correct data insertion
    cursor.execute("SELECT COUNT(*) FROM events")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")

    cursor.execute("SELECT * FROM events LIMIT 5")
    sample_records = cursor.fetchall()

    print("\nShowing 5 records: ")
    for record in sample_records:
        print(
            f"id: {record[0]},\nname: {record[1]},\ndescription: {record[2]},\nlocation: {record[3]},\ntime: {record[4]},\norganization_id {record[5]}"
        )


# main configuration
def execute_insert_events_data(conn: sqlite3.Connection, cursor):
    print("Generating synthetic data...")

    events_data = generate_events_data(conn, 200)

    print(f"Inserting {len(events_data)} records in DB...")
    insert_events_data(conn, cursor, events_data)

    # verifying insertion
    verify_data(cursor)
