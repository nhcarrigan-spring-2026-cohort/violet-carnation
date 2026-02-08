from faker import Faker
import random
from datetime import datetime, timedelta

# Faker init
fake = Faker()

def generate_social_media(public_name):
  social_media_list = [ 'facebook.com/', 'https://x.com/@', 'https://linkedin.com/',
                       'youtube.com/', 'tiktok.com/@']
  return f'{random.choice(social_media_list)}{public_name}'
  

def generate_organizations_data(num_records=100):
    """Generate fake data for Organizations table"""
    # default pre-defined options
    orgs_list = [
            { 'public_name': "GRC",   'name': 'Global Reach Collective'},
            { 'public_name': "HI",    'name': 'The Helios Initiative'},
            { 'public_name': "UFI",   'name': 'Unity Front International'},
            { 'public_name': "AAN",   'name': 'Aegis Aid Network'},
            { 'public_name': "VR",    'name': 'Veritas Relief'},
            { 'public_name': "CTA",   'name': 'The Common Thread Alliance'},
            { 'public_name': "HAB",   'name': 'Hands Across Borders'},
            { 'public_name': "SS",    'name': 'Solidarity Sphere'},
            { 'public_name': "KAC",   'name': 'Kinship Aid Corps'},
            { 'public_name': "HLI",   'name': 'Heartland International'},
            { 'public_name': "HHG",   'name': 'Horizon Humanitarian Group'},
            { 'public_name': "PAF",   'name': 'Polaris Aid Foundation'},
            { 'public_name': "UP",    'name': 'The Uplift Project'},
            { 'public_name': "NDO",   'name': 'New Dawn Outreach'},
            { 'public_name': "PI",    'name': 'Promise International'},
            { 'public_name': "CRCo",  'name': 'Crisis Response Coalition'},
            { 'public_name': "VF",    'name': 'Vital Foundations'},
            { 'public_name': "SSW",   'name': 'Shelter & Sustenance Worldwide'},
            { 'public_name': "GVC",   'name': 'Global Volunteer Corps'},
            { 'public_name': "IRA",   'name': 'International Restoration Agency'}
            ]
  
    sectors_list = ['Education', 'Health', 'Environment', 'Social', 'Animals', 'Cultural', 'Sports', 'Other']


    orgs_data = []
    admin_number = 5 # This number will be use to generate random admin user ids

    for _ in range(num_records):
        admin_user_id = random.randint(1, admin_number) 
        org = random.choice(orgs_list) # NOT INCLUDE IN COLUMNS LIST
        name = org['name']
        public_name = org['public_name']
        email  = f'{random.choice(['media', 'public', 'contact'])}@{public_name}.org'
        phone = fake.phone_number()[:20]
        country = fake.country()
        city = fake.city()
        address = fake.address().replace('\n', ', ')[:100]
        sector = random.choice(sectors_list)
        mission = fake.text(max_nb_chars=200)
        vision = fake.text(max_nb_chars=200) 
        logo_url = fake.image_url(width=200, height=200)
        description = fake.text(max_nb_chars=100)
        website = fake.url()
        social_media = generate_social_media(public_name)
        verified = random.choice([0,1])
        active = random.choice([0,1])
        days_ago = random.randint(0, 730) # NOT INCLUDE IN COLUMNS LIST
        registration_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')

        orgs_data.append((
                  admin_user_id, name, public_name, email, phone, country, city, address,
                  sector, mission, vision, logo_url, description, website, social_media, verified, 
                  active, registration_date
              ))

    return orgs_data
