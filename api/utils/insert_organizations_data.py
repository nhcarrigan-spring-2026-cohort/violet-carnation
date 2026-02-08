import sqlite3
from db_schema import DB_SCHEMA
from generate_organizations_data import generate_organizations_data

# SQLite connection
conn = sqlite3.connect('app.db')
cursor = conn.cursor()
cursor.executescript(DB_SCHEMA)

def insert_orgs_data(orgs_data):
    """Insert data in Organizations table"""
    
    insert_query = '''
    INSERT INTO Organizations (
        admin_user_id, name, public_name, email, phone, country, city, address,
        sector, mission, vision, logo_url, description, website, social_media, verified, 
        active, registration_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
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
    for record in sample_records: # legal_name, public_name, email, phone, country
        print(f"ID: {record[0]}, admin_user_id: {record[1]}, legal_name: {record[3]}, Active: {record[17]}")

# Main configuration
def execute_insert_orgs_data(NUM_RECORDS):    
    
    print("Generating synthetic data...")
   
    orgs_data = generate_organizations_data(NUM_RECORDS)
    
    print(f"Inserting {NUM_RECORDS} records in DB...")
    insert_orgs_data(orgs_data)
    
    # Verifying insertion
    verify_data()
    
    # Close connection
    conn.close()
    print("\nProcess complete. Connection close.\n")