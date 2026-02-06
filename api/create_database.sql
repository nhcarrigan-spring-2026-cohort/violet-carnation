-- SQLite
CREATE TABLE Users (
  id INTEGER PRIMARY KEY,
  roleId INTEGER, 
  name VARCHAR,
  location VARCHAR,
  education VARCHAR
);

CREATE TABLE Organizations (
  id INTEGER PRIMARY KEY,
  roleId INTEGER,
  name VARCHAR,
  type VARCHAR,
  description VARCHAR
);

CREATE TABLE Roles (
  id INTEGER PRIMARY KEY,
  name VARCHAR
);

CREATE TABLE Projects (
  id INTEGER PRIMARY KEY, 
  name VARCHAR,
  taskDescription VARCHAR,
  isRemote BOOLEAN,
  location VARCHAR,
  hoursWeek INTEGER,
  startDate DATE,
  expectedEndDate DATE,
  expertiseAreas VARCHAR,
  specializationArea VARCHAR,
  language VARCHAR,
  requiredEducation VARCHAR,
  requiredSkillExperience VARCHAR,
  requiredDrivingLicense BOOLEAN,
  livingConditions VARCHAR,
  url VARCHAR
);


