from faker import Faker
import hashlib
import random
from datetime import datetime, timedelta

# Faker init
fake = Faker()


def generate_password_hash(password):
    """Generate a hash MD5 for password"""
    return hashlib.md5(password.encode()).hexdigest()


def generate_identification_number():
    """Generate an unique ID"""
    return fake.unique.bothify(text="##########")


def generate_skills():
    """Generate a random skills list"""
    skills_list = [
        "Communication",
        "Empathy and compassion",
        "Reliability and commitment",
        "Adaptability",
        "Flexibility",
        "Teamwork",
        "Problem-solving",
        "Time management",
        "Leadership",
        "Digital skills",
        "Technical skills",
        "Cultural competence",
    ]
    return ", ".join(random.sample(skills_list, random.randint(2, 5)))


def generate_education():
    """Generate a random educational level"""
    education_levels = [
        "High School",
        "Associate Degree",
        "Bachelor's Degree",
        "Master's Degree",
        "PhD",
        "Technical Certification",
    ]
    return random.choice(education_levels)


def generate_profile_picture():
    """Generate a fake image URL"""
    return f"https://example.com/profile/{fake.uuid4()}.jpg"


def generate_user_data(num_records=100):
    """Generate fake data for Users table"""

    # default pre-defined options
    genders = ["Male", "Female", "Other", "Prefer not to say"]
    availability_options = ["Full-time", "Part-time", "Weekends", "Evenings"]
    countries = [
        "United States",
        "Canada",
        "United Kingdom",
        "Australia",
        "Germany",
        "France",
        "Spain",
    ]

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
        password_hash = generate_password_hash("Password123!")
        phone = fake.phone_number()[:20]
        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=70).strftime(
            "%Y-%m-%d"
        )
        gender = random.choice(genders)
        identification_number = generate_identification_number()
        country = random.choice(countries)
        city = fake.city()
        address = fake.address().replace("\n", ", ")[:100]
        profile_picture = generate_profile_picture()
        education = generate_education()
        skills = generate_skills()
        availability = random.choice(availability_options)
        active = random.choice([0, 1])

        # Generate random registry date in last two years
        days_ago = random.randint(0, 730)
        registration_date = (datetime.now() - timedelta(days=days_ago)).strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        users_data.append(
            (
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                birth_date,
                gender,
                identification_number,
                country,
                city,
                address,
                profile_picture,
                education,
                skills,
                availability,
                active,
                registration_date,
            )
        )

    return users_data
