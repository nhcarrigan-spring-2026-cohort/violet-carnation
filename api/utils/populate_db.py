import os
import sqlite3
from faker import Faker
import random
from datetime import datetime, timedelta

from db_schema import DB_SCHEMA

# Faker init
fake = Faker()

# SQLite connection
conn = sqlite3.connect('app.db')
conn.execute("PRAGMA foreign_keys = ON;")
cursor = conn.cursor()


cursor.executescript(DB_SCHEMA)

def generate_user_data(num_records=100):
    """Generate fake data for Users table"""

    # default pre-defined options
    availability_options = ['Full-time', 'Part-time', 'Weekends', 'Evenings']

    users_data = []
    
    for _ in range(num_records):
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = f"{first_name.lower()}.{last_name.lower()}@{fake.domain_name()}"
        
        # unique email
        while any(email == user[0] for user in users_data):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}@{fake.domain_name()}"
        
        # Generate data
        availability = random.choice(availability_options)

        users_data.append((
            email, first_name, last_name, availability
        ))
    
    return users_data

def insert_users_data(users_data):
    """Insert data in Users table"""
    
    insert_query = '''
    INSERT INTO users (
        email, first_name, last_name, availability
    ) VALUES (?, ?, ?, ?)
    '''
    
    try:
        cursor.executemany(insert_query, users_data)
        conn.commit()
        print(f"✅ {len(users_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"❌ Integrity error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
 
def verify_data():
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    print(f"📊 Total records: {count}")
    
    cursor.execute("SELECT user_id, email, first_name, last_name, availability FROM users LIMIT 5")
    sample_records = cursor.fetchall()
    
    print("\n📋 Showing 5 records:")
    for record in sample_records:
        print(f"ID: {record[0]}, Email: {record[1]}, Name: {record[2]} {record[3]}, Availability: {record[4]}")

# Main configuration
if __name__ == "__main__":
    # Amount of records to generate
    NUM_RECORDS = 100
    
    print("🚀 Generating synthetic data...")
    users_data = generate_user_data(NUM_RECORDS)
    
    print(f"📝 Inserting {NUM_RECORDS} records in DB...")
    insert_users_data(users_data)
    
    # Verifying insertion
    verify_data()
    
    # Close connection
    conn.close()
    print("\n✅ Process complete. Connection closed.")