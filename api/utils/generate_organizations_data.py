import json
import sqlite3

from faker import Faker

# Faker init
fake = Faker()


def get_admin_users():
    """
    This query is to ensure to match the admin user from Roles with created_by_user_id
    """
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()

    query = """
    SELECT * FROM Roles WHERE permission_level = 'admin' ORDER BY organization_id
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    conn.close()
    return rows


def generate_organizations_data(org_list_file):
    admin_users = get_admin_users()  # user_id, organization_id, permission_level
    """Generate fake data for Organizations table"""
    # read from org_list_file the organizations list
    with open(org_list_file, "r") as file:
        orgs_list = json.load(file)

    orgs_data = []

    for k in range(len(orgs_list)):
        created_by_user_id = admin_users[k][0]
        name = orgs_list[k]["name"]
        description = fake.text(max_nb_chars=100)

        orgs_data.append((created_by_user_id, name, description))

    return orgs_data
