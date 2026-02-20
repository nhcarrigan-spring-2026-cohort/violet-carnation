import json
import sqlite3
import random

from faker import Faker

# Faker init
fake = Faker()


def get_admin_users(conn: sqlite3.Connection):
    """
    This query is to ensure to match the admin user from Roles with created_by_user_id
    """
    cursor = conn.cursor()

    query = """
    SELECT * FROM roles WHERE permission_level = 'admin' ORDER BY organization_id
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    return rows



def generate_category():
    # Return a random category
    event_categories = [
        "Animal Welfare",
        "Hunger and Food Security",
        "Homelessness and Housing",
        "Education & Tutoring",
        "Youth and Children",
        "Senior Care and Support",
        "Health & Medical",
        "Environmental Conservation",
        "Community Development",
        "Arts & Culture",
        "Disaster Relief",
        "Veterans & Military Families",
        "Immigrants & Refugees",
        "Disability Services",
        "Mental Health & Crisis Support",
        "Advocacy & Human Rights",
        "Faith-Based Services",
        "Sports & Recreation",
        "Job Training & Employment",
        "Technology & Digital Literacy",
    ]
    
    return random.choice(event_categories)



def generate_organizations_data(org_list_file, conn: sqlite3.Connection):
    """Generate fake data for Organizations table"""
    admin_users = get_admin_users(conn)  # user_id, organization_id, permission_level
    # read from org_list_file the organizations list
    with open(org_list_file, "r") as file:
        orgs_list = json.load(file)

    orgs_data = []

    print(f"Generating data for {len(admin_users)} admins...")

    for k in range(len(admin_users)):

        created_by_user_id = admin_users[k][0]
        name = orgs_list[k]["name"]
        description = fake.text(max_nb_chars=100)

        orgs_data.append((created_by_user_id, name, description, generate_category()))

    return orgs_data
