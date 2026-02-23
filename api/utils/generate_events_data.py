from faker import Faker
import sqlite3
import random
# Faker init
fake = Faker()


def get_org_ids(conn: sqlite3.Connection):
    # Retrieve all organization id's
    cursor = conn.cursor()

    query = """
        SELECT organization_id FROM organizations  
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    return rows


# Potential TODO: Map each event name to its correct organization based on its category
def generate_event_name():
    event_names = [
        # Animal Welfare (1–5)
        "Paws for Compassion Day",
        "Shelter Friends Outreach",
        "Wings & Whiskers Wellness Fair",
        "Community Pet Care Drive",
        "Rescue Ranch Volunteer Rally",
        # Hunger & Food Security (6–10)
        "Harvest Hope Packing Event",
        "Meals for Neighbors Initiative",
        "Community Pantry Pop‑Up",
        "Farm to Families Volunteer Day",
        "Nourish the City Drive",
        # Homelessness & Housing (11–15)
        "Homes of Hope Build Day",
        "Warm Nights Shelter Support",
        "Keys to Stability Outreach",
        "Community Housing Repair Blitz",
        "Safe Haven Supply Drive",
        # Education & Tutoring (16–20)
        "Books & Brighter Futures Day",
        "Homework Heroes Tutoring Night",
        "Literacy Lift‑Off Workshop",
        "STEM Stars Mentorship Event",
        "Classroom Champions Volunteer Day",
        # Youth & Children (21–25)
        "Kids Thrive Activity Day",
        "Youth Empowerment Carnival",
        "Future Leaders Mentorship Fair",
        "Play & Learn Community Day",
        "Bright Beginnings Support Event",
        # Senior Care & Support (26–30)
        "Golden Connections Social Hour",
        "Senior Smiles Outreach",
        "Elder Wellness Companion Day",
        "Memory Lane Activity Circle",
        "Care & Comfort Volunteer Afternoon",
        # Health & Medical (31–35)
        "Community Wellness Screening Day",
        "Healthy Hearts Awareness Drive",
        "Medical Support Volunteer Fair",
        "Care Kits for Patients Event",
        "Health Heroes Outreach",
        # Environmental Conservation (36–40)
        "Green Earth Cleanup Day",
        "Tree Guardians Planting Event",
        "Eco‑Action Community Sweep",
        "River Renewal Volunteer Project",
        "Sustainable Future Workshop",
        # Community Development (41–45)
        "Neighborhood Unity Day",
        "Community Builders Collaboration",
        "Local Voices Town Project",
        "Better Blocks Revitalization Event",
        "Civic Engagement Volunteer Rally",
        # Arts & Culture (46–50)
        "Creative Community Art Day",
        "Culture Connect Festival Support",
        "Gallery Helpers Volunteer Night",
        "Arts for All Workshop",
        "Heritage Celebration Crew Event",
        # Disaster Relief (51–55)
        "Rapid Response Readiness Day",
        "Relief Kits Assembly Drive",
        "Community Resilience Training",
        "Emergency Support Volunteer Rally",
        "Storm Aid Supply Sorting Event",
        # Veterans & Military Families (56–60)
        "Honor & Support Volunteer Day",
        "Veteran Voices Appreciation Event",
        "Military Family Care Drive",
        "Service Heroes Outreach",
        "Operation Community Gratitude",
        # Immigrants & Refugees (61–65)
        "Welcome Home Support Fair",
        "New Beginnings Resource Day",
        "Community Language Buddy Event",
        "Refugee Relief Supply Drive",
        "Cultural Bridge Mentorship Night",
        # Disability Services (66–70)
        "Access for All Volunteer Day",
        "Adaptive Activities Support Event",
        "Inclusive Community Fair",
        "Assistive Tech Awareness Drive",
        "Ability Advocates Outreach",
        # Mental Health & Crisis Support (71–75)
        "Mindful Community Wellness Day",
        "Hope & Healing Support Circle",
        "Crisis Care Kit Assembly",
        "Mental Health Awareness Walk",
        "Compassion Crew Volunteer Night",
        # Advocacy & Human Rights (76–80)
        "Voices for Justice Rally",
        "Rights & Respect Community Forum",
        "Equality in Action Volunteer Day",
        "Human Dignity Awareness Event",
        "Stand for Change Outreach",
        # Faith‑Based Services (81–85)
        "Community Blessings Service Day",
        "Faith in Action Volunteer Drive",
        "Hope & Hospitality Outreach",
        "Congregation Care Crew Event",
        "Spirit of Service Weekend",
        # Sports & Recreation (86–90)
        "Play for Good Community Games",
        "Youth Sports Volunteer Day",
        "Recreation for All Festival",
        "Active Living Support Event",
        "Community Coaching Kickoff",
        # Job Training & Employment (91–95)
        "Career Pathways Workshop",
        "Resume Ready Volunteer Night",
        "Workforce Empowerment Fair",
        "Skills for Success Training Day",
        "Employment Support Resource Drive",
        # Technology & Digital Literacy (96–100)
        "Tech for All Learning Day",
        "Digital Skills Mentorship Event",
        "Community Coding Support Night",
        "Device Donation & Setup Drive",
        "Cyber Confidence Workshop",
    ]

    return random.choice(event_names)

# Make catch phrase faker module shorter 
def short_event_name(max_words=2):
    name = (fake.catch_phrase().title()).split()
    return " ".join(name[:max_words])

def generate_events_data(conn: sqlite3.Connection, num_records):
    # get list of organization id's
    org_ids = list(get_org_ids(conn))

    events_data = []

    # add fake events data to events_data
    print(f"Generating data for {len(org_ids)} organization ID's ...")
    for _ in range(num_records):
        # create fake data
        event_name = short_event_name()
        event_description = fake.paragraph(3)
        location = fake.street_name() 
        date_time = fake.date_time_between(start_date="now", end_date='+1y')

        # convert tuple into an integer
        org_id = int(''.join(map(str, random.choice(org_ids)))) 
        

        # add events data to events_data list
        events_data.append(
            (event_name, 
            event_description, 
            location, 
            date_time, 
            org_id)
        )

    return events_data
