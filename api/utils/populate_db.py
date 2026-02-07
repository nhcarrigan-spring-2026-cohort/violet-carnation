import os
import sqlite3
from faker import Faker
import hashlib
import random
from datetime import datetime, timedelta

from db_schema import DB_SCHEMA

# Faker init
fake = Faker()

# SQLite connection
conn = sqlite3.connect('app.db')
cursor = conn.cursor()


cursor.executescript(DB_SCHEMA)

def generate_password_hash(password):
    """Generate a hash MD5 for password"""
    return hashlib.md5(password.encode()).hexdigest()

def generate_identification_number():
    """Generate an unique ID"""
    return fake.unique.bothify(text='##########')

def generate_skills():
    """Generate a random skills list"""
    skills_list = [
        'Communication', 'Empathy and compassion', 'Reliability and commitment',
        'Adaptability', 'Flexibility', 'Teamwork', 'Problem-solving', 'Time management',
        'Leadership', 'Digital skills', 'Technical skills', 'Cultural competence',
        
    ]
    return ', '.join(random.sample(skills_list, random.randint(2, 5)))

def generate_education():
    """Generate a random eductional level"""
    education_levels = [
        'High School',
        'Associate Degree',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'PhD',
        'Technical Certification'
    ]
    return random.choice(education_levels)

def generate_profile_picture():
    """Generate an fake image URL"""
    return f"https://example.com/profile/{fake.uuid4()}.jpg"

def generate_user_data(num_records=100):
    """Generate fake data for Users table"""
    
    # default pre-defined options
    genders = ['Male', 'Female', 'Other', 'Prefer not to say']
    availability_options = ['Full-time', 'Part-time', 'Weekends', 'Evenings']
    countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain']
    
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
        
        # Generarte data
        password_hash = generate_password_hash("Password123!")
        phone = fake.phone_number()[:20]
        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=70).strftime('%Y-%m-%d')
        gender = random.choice(genders)
        identification_number = generate_identification_number()
        country = random.choice(countries)
        city = fake.city()
        address = fake.address().replace('\n', ', ')[:100]
        profile_picture = generate_profile_picture()
        education = generate_education()
        skills = generate_skills()
        availability = random.choice(availability_options)
        active = random.choice([0, 1]) 
        
        # Generarte random registry date in last two years
        days_ago = random.randint(0, 730) 
        registration_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
        
        users_data.append((
            email, password_hash, first_name, last_name, phone, birth_date,
            gender, identification_number, country, city, address,
            profile_picture, education, skills, availability, active, registration_date
        ))
    
    return users_data

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
        print(f"✅ {len(users_data)} records were inserted successfully.")
    except sqlite3.IntegrityError as e:
        print(f"❌ Integridad error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
 
def verify_data():
    """Verify correct data insertion"""
    cursor.execute("SELECT COUNT(*) FROM Users")
    count = cursor.fetchone()[0]
    print(f"📊 Total records: {count}")
    
    cursor.execute("SELECT * FROM Users LIMIT 5")
    sample_records = cursor.fetchall()
    
    print("\n📋 Showing 5 records:")
    for record in sample_records:
        print(f"ID: {record[0]}, Email: {record[1]}, Name: {record[3]} {record[4]}, Active: {record[17]}")

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
    print("\n✅ Process complete. Connection close.")