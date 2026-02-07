# Database Schema

## ROLES TABLE

#### Defines user types in the system

### ROLE NAMES

- 1 user_viewer
- 2 organization_manager
- 3 administrator
- 4 super_user 

### PERMISSION LEVELS

- 1 **user/viewer**: Limited to viewing content, editing personal profiles, or creating limited items. 
- 2 **organization manager**: Access to projects with capabilities to edit content but limited user management
- 3 **Administrator**: High-level access to configure system-wide settings and manage users.
- 4 **Super User/owner**: Full, unrestricted access to all settings, users, and data.

```
TABLE Roles {
    role_id INTEGER [pk],
    role_name TEXT NOT NULL UNIQUE,
    description TEXT,
    permission_level INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
}
```

# USERS TABLE

#### Stores information of individual users (volunteers)

```
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    birth_date TEXT,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other', 'Prefer not to say')) DEFAULT 'Prefer not to say',
    identification_number TEXT UNIQUE,
    country TEXT,
    city TEXT,
    address TEXT,
    profile_picture TEXT,
    education TEXT,
    skills TEXT,
    availability TEXT CHECK(availability IN ('Full-time', 'Part-time', 'Weekends', 'Evenings')) DEFAULT 'Part-time',
    active INTEGER DEFAULT 1,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

# ORGANIZATIONS TABLE

#### Stores information of institutions/organizations

```
CREATE TABLE Organizations (
    organization_id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id INTEGER NOT NULL, -- User who administers the organization
    legal_name TEXT NOT NULL,
    public_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    sector TEXT CHECK(sector IN ('Education', 'Health', 'Environment', 'Social', 'Animals', 'Cultural', 'Sports', 'Other')) DEFAULT 'Social',
    mission TEXT,
    vision TEXT,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    social_media TEXT,
    verified INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES Users(user_id) ON DELETE RESTRICT
);
```

# PROJECTS TABLE

#### Stores volunteer projects created by organizations

```
CREATE TABLE Projects (
  project_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  taskDescription TEXT,
  category TEXT CHECK(category IN ('Social', 'Educational', 'Health', 'Environment', 'Construction', 'Technology', 'Emergency', 'Cultural', 'Other')) NOT NULL,
  isRemote INTEGER,
  location TEXT,
  hoursWeek INTEGER,
  startDate TIMESTAMP,
  expectedEndDate TIMESTAMP
  expertiseAreas TEXT,
  specializationArea TEXT,
  language TEXT,
  requiredEducation TEXT,
  requiredSkillExperience TEXT,
  requiredDrivingLicense INTEGER,
  livingConditions TEXT,
  url TEXT,
  livingConditions TEXT,
  volunteers_needed INTEGER NOT NULL,
  volunteers_registered INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Active', 'Under review', 'Completed', 'Cancelled', 'Paused')) DEFAULT 'Under review',
  visible INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```