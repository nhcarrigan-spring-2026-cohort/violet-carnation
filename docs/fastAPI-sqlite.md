# Connection between fastAPI and sqlite in VSCode

## Prerequisites

### VSCode Extensions

- **SQLtools** (VSCode extension) 
- **SQLite** (VSCode extension)
- **sqlmodel** (python)

## Setup

1. In VSCode, install SQLite extension
2. Install SQLTools
3. Click on the SQLTools icon, will apear the SQLTools menu on the left side
4. At the right side of the CONNECTIONS title click on the *create a New SQL file* icon
5. The new file will open on editor, save it with a given name (as example vmp.db) inside the api folder. Don't write down anything on it
6. Close the db file
7. At the right side of the CONNECTIONS title click on the *Add new connection*
8. A window on editor will shown with a list of DB drivers, click on the SQLite driver icon
9. A form will shown, fill the required fileds (with asterisk) and select the data base file
10. After selecting the DB file test the connection. If everything is OK a green message will appear.
11. Click on the *save connection* button and the connection will shown in the sqltools menu
12. Click on the new connection to activate it
13. Create a sql file to write down the queries needed to create the tables. By intance, the query looks like this to create the Users table:

```
CREATE TABLE Users (
  id INTEGER PRIMARY KEY,
  roleId INTEGER, 
  name VARCHAR,
  location VARCHAR,
  education VARCHAR
);
```

14. Create the tables Users, Organizations, Roles and Projects with the field given in the DB Schema (still in process see [#16](https://github.com/nhcarrigan-spring-2026-cohort/violet-carnation/issues/16))
15. Create a sql file to populate the tables with one o two records, just to test the connection between fastAPI and sqlite. By intance, the query to populate the Users table looks like this:

```
INSERT INTO Users (id, roleId, name, location, education)
VALUES (
    1,
    1,
    'Juan Pérez',
    'Perú',
    'Bachelor Degree'
  );
  ```
  
  16. In the SQLTools menu is possible to visualize the tables clicking the lens icon on the right side of each table.
  17. Install sqlmodel with pip: `pip install sqlmodel`
  18. Follow the instruction [here](https://fastapi.tiangolo.com/tutorial/sql-databases/) and adapt the code as required.
  19. Create a endpoint for each table with a get request shuch like 
   
  ```
    @app.get("/users/")
    def read_users(
      session: SessionDep,
      offset: int=0,
      limit: Annotated[int, Query(le=100)] = 100 ) -> list[Users]:
      users = session.exec( select(Users).offset(offset).limit(limit)).all()
      return users
  ```
  
  20. Verify in the browser each endpoint, a JSON like data must be shown. By instance, the url for the Users table is something like this: http://localhost:8000/users/

  ## TODO

  1. Modify the DB Schema to fit the requirements
  2. After settle down the db schema, to implement the rest of the end points to create, update and delete records in database

