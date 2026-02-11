from faker import Faker
import random

# Faker init
fake = Faker()


def generate_roles_data(num_records=100):
    """Generate fake data for Roles table"""
    # default pre-defined options

    roles_data = []
    user_number = 100  # This number will be use to generate random user ids
    org_number = 20  # This is the number of organizations

    permission_level_list = ["admin", "volunteer"]

    org_ids_with_admin = []  # save orgs with an admin user

    for _ in range(num_records):
        organization_id = random.choice(range(1, org_number + 1))
        # To ensure a unique admin user for each organization
        if organization_id in org_ids_with_admin:
            permission_level = "volunteer"
        else:
            permission_level = "admin"
            org_ids_with_admin.append(organization_id)

        user_id = fake.unique.random_int(min=1, max=user_number)
        roles_data.append((user_id, organization_id, permission_level))

    return roles_data
