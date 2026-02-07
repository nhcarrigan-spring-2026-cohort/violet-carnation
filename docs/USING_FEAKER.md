# Faker 40.1.2 Documentation
## Synthetic Data Generation for User Table

### Overview
Faker is a Python library that generates fake/synthetic data for testing, development, and demonstration purposes. Version 40.1.2 provides enhanced localization support and improved performance for generating user-related data.

### Installation

```bash
pip install faker==40.1.2
```

### Basic Setup

```python
from faker import Faker

# Create a Faker instance (default: English/US locale)
fake = Faker()
```

#### Using a seed for reproducibility

When using Faker for testing it is possible to generate the same data using a seed on each execution.

```python
fake = Faker()
Faker.seed(7365)
```

## 1. Basic User Information

#### Personal Information
```python

first_name = fake.first_name()
last_name = fake.last_name()
```
#### email
```python

email = f"{first_name.lower()}.{last_name.lower()}@{fake.domain_name()}"
```

#### Phone number
```python

phone_number = fake.phone_number()[:20] # will return th first 20 characters of a randomly generated fake phone number 
```
#### Age
```python

birth_date = fake.date_of_birth(minimum_age=18, maximum_age=70).strftime('%Y-%m-%d')
# will generate fake birth dates from 18 to 70 years with format year-month-day
```

#### Address
```python

address = fake.address().replace('\n', ', ')[:100] 
# will generate fake address with 100 characters
```
#### City
City in U.S. english (en_US), if you want generate city names from a specific country pass the locale code. By instance, for Italy locale use fake.city("it_IT"). To check more options check documentation.
```python
city = fake.city()
```
#### Unique User ID
will create an unique 10 numbers long Id
```python

fake.unique.bothify(text='##########')
```
#### random UUID for fake image url
will generate an unique random UUID version 4, for example: cfd30aed-6625-4aae-abdd-bac724d9309f
```python
fake.uuid4()
```

### Complementary libraries

Faker can be used along other libraries to generate fake data to testing, especially if short list of options are available. In this case, the random library has functions to sample the list with repetitions or not. Another usefull library is the hashlib library, its part of the standard python library, so its installation is not needed, is usefull to encrypt the user pasword.

#### gender
```python
genders = ['Male', 'Female', 'Other', 'Prefer not to say'] 
random.choice(genders)
```
returns a single random gender from the list

#### country
```python
countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain']
random.choice(countries)
```
returns a single random country from the list
#### education
```python
education_levels = [
        'High School',
        'Associate Degree',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'PhD',
        'Technical Certification'
]

random.choice(education_levels)
```
returns a single random educational level

#### skills
```python
skills_list = [
        'Communication', 'Empathy and compassion', 'Reliability and commitment',
        'Adaptability', 'Flexibility', 'Teamwork', 'Problem-solving', 'Time management',
        'Leadership', 'Digital skills', 'Technical skills', 'Cultural competence',
        
    ]

random.sample(skills_list, random.randint(2, 5))
```
returns a random subset of 2 to 5 unique skills form the skills list with out replacement.

#### hash password
```python
password = "Password123!"
hashlib.md5(password.encode()).hexdigest()
```
returns a hexadecimal 32 chars long MD5 hash of the string "Password123!".


## Implementation of the fake generator function

#### password hash function, recibe a string password.
```python
def generate_password_hash(password):
    """Generate a hash MD5 for password"""
    return hashlib.md5(password.encode()).hexdigest()
```

#### Unique user ID function
```python
def generate_identification_number():
    """Generate an unique ID"""
    return fake.unique.bothify(text='##########')
```
#### Random skills list function    
```python
def generate_skills():
    """Generate a random skills list"""
    skills_list = [
        'Communication', 'Empathy and compassion', 'Reliability and commitment',
        'Adaptability', 'Flexibility', 'Teamwork', 'Problem-solving', 'Time management',
        'Leadership', 'Digital skills', 'Technical skills', 'Cultural competence',
        
    ]
    return ', '.join(random.sample(skills_list, random.randint(2, 5)))
```
    
#### Random educational level function    
```python
def generate_education():
    """Generate a random eductional level"""
    education_levels = [
        'High School',
        'Associate Degree',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'PhD',
        'Technical Certification'
    ]
    return random.choice(education_levels)
```
#### Random picture url function    
```python
def generate_profile_picture():
    """Generate an fake image URL"""
    return f"https://example.com/profile/{fake.uuid4()}.jpg"
```

#### Fake user data funtion    
```python
def generate_user_data(num_records=100):
    """Generate fake data for Users table"""
    
    # default pre-defined options
    genders = ['Male', 'Female', 'Other', 'Prefer not to say']
    availability_options = ['Full-time', 'Part-time', 'Weekends', 'Evenings']
    countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain']
    
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
        
        # Generarte data
        password_hash = generate_password_hash("Password123!")
        phone = fake.phone_number()[:20]
        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=70).strftime('%Y-%m-%d')
        gender = random.choice(genders)
        identification_number = generate_identification_number()
        country = random.choice(countries)
        city = fake.city()
        address = fake.address().replace('\n', ', ')[:100]
        profile_picture = generate_profile_picture()
        education = generate_education()
        skills = generate_skills()
        availability = random.choice(availability_options)
        active = random.choice([0, 1]) 
        
        # Generarte random registry date in last two years
        days_ago = random.randint(0, 730) 
        registration_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
        
        users_data.append((
            email, password_hash, first_name, last_name, phone, birth_date,
            gender, identification_number, country, city, address,
            profile_picture, education, skills, availability, active, registration_date
        ))
    
    return users_data
```

## Resources

- [Official Documentation](https://faker.readthedocs.io/)
- [GitHub Repository](https://github.com/joke2k/faker)