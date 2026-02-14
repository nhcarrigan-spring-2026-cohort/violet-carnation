---
name: manipulate-sqlite
description: If asked to manipulate the local sqlite3 database, utilize this skill to perform queries and data checks, along with possibly change data in the local database
---

- Use a sqlite3 database agent skill that targets the database at [api/app.db](api/app.db) for queries and data checks.
- The current database schema reference lives in [api/utils/db_schema.py](api/utils/db_schema.py), use this as a reference for what the database should be.
- Assume the `sqlite3` CLI is available from the shell, this can be verified before using `sqlite3 --version`.

## CLI examples (read-focused)

- Open the database in read-only mode:

  ```bash
  sqlite3 -readonly api/app.db
  ```

- List tables (inside the sqlite3 prompt):

  ```sql
  .tables
  ```

- Inspect a table schema (inside the sqlite3 prompt):

  ```sql
  .schema users
  ```

- Count rows (inside the sqlite3 prompt):

  ```sql
  SELECT COUNT(*) FROM users;
  ```

- Read a small sample (inside the sqlite3 prompt):

  ```sql
  SELECT user_id, email, first_name, last_name FROM users LIMIT 5;
  ```

- Filter with a condition (inside the sqlite3 prompt):

  ```sql
  SELECT user_id, email, active FROM users WHERE active = 1 LIMIT 5;
  ```

- Join organizations and roles (inside the sqlite3 prompt):

  ```sql
  SELECT
  	o.organization_id,
  	o.name,
  	r.user_id,
  	r.permission_level
  FROM organizations o
  JOIN roles r ON r.organization_id = o.organization_id
  LIMIT 5;
  ```

- One-off read without entering the prompt:

  ```bash
  sqlite3 -readonly api/app.db "SELECT COUNT(*) FROM organizations;"
  ```
