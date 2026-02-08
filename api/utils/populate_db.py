from insert_usersdata import execute_insert_users_data
from insert_organizations_data import execute_insert_orgs_data

NUM_RECORDS = 100

if __name__ == "__main__":
    execute_insert_users_data(NUM_RECORDS)
    execute_insert_orgs_data(NUM_RECORDS)
