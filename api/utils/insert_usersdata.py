import os
import sqlite3
from db_schema import DB_SCHEMA
from genarate_users_data import generate_user_data


# SQLite connection
conn = sqlite3.connect('app.db')
cursor = conn.cursor()
cursor.executescript(DB_SCHEMA)

def insert_users_data(users_data):
    """Insert data in Users table"""
    
    insert_query = '''
    INSERT INTO Users (
        email, password_hash, first_name, last_name, phone, birth_date,
        gender, identification_number, country, city, address,
        profile_picture, education, skills, availability, active, registration_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
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
 
def verify_data():
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM Users")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")
    
    cursor.execute("SELECT * FROM Users LIMIT 5")
    sample_records = cursor.fetchall()
    
    print("\nShowing 5 records:")
    for record in sample_records:
        print(f"ID: {record[0]}, Email: {record[1]}, Name: {record[3]} {record[4]}, Active: {record[17]}")

# Main configuration
def execute_insert_users_data(NUM_RECORDS):    
    
    print("Generating synthetic data...")
    users_data = generate_user_data(NUM_RECORDS)
    
    print(f"Inserting {NUM_RECORDS} records in DB...")
    insert_users_data(users_data)
    
    # Verifying insertion
    verify_data()
    
    # Close connection
    conn.close()
    print("\nProcess complete. Connection close.\n")