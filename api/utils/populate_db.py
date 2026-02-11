import os

from insert_organizations_data import execute_insert_orgs_data
from insert_roles_data import execute_insert_roles_data
from insert_users_data import execute_insert_users_data

NUM_RECORDS = 100

if __name__ == "__main__":
    # NOTE this will nuke the database every time

    db_file = "app.db"
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"\n{db_file} has been removed\n")
    else:
        print(f"\n{db_file} does not exist\n")

    execute_insert_users_data(NUM_RECORDS)
    execute_insert_roles_data(NUM_RECORDS)
    execute_insert_orgs_data(
        "./utils/organizations_list.json"
    )  # Inside the function there is a list with organization names
