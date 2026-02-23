import random
from enum import Enum
class categoriesEnum(str, Enum):
    # Set constants in order to validate API requests
    animal_welfare = "animal_welfare"
    hunger_and_food_security = "hunger_and_food_security"
    homelessness_and_housing = "homelessness_and_housing"
    education_and_tutoring = "education_and_tutoring"
    youth_and_children = "youth_and_children"
    senior_care_and_support = "senior_care_and_support"
    health_and_medical = "health_and_medical"
    environmental_conservation = "environmental_conservation"
    community_development = "community_development"
    arts_and_culture = "arts_and_culture"
    disaster_relief = "disaster_relief"
    veterans_and_military_families = "veterans_and_military_families"
    immigrants_and_refugees = "immigrants_and_refugees"
    disability_services = "disability_services"
    mental_health_and_crisis_support = "mental_health_and_crisis_support"
    advocacy_and_human_rights = "advocacy_and_human_rights"
    faith_based_services = "faith_based_services"
    sports_and_recreation = "sports_and_recreation"
    job_training_and_employment = "job_training_and_employment"
    technology_and_digital_literacy = "technology_and_digital_literacy"


def generate_category(): 
    # Return a category for database seeding
    org_categories = [
        "animal_welfare",
        "hunger_and_food_security",
        "homelessness_and_housing",
        "education_and_tutoring",
        "youth_and_children",
        "senior_care_and_support",
        "health_and_medical",
        "environmental_conservation",
        "community_development",
        "arts_and_culture",
        "disaster_relief",
        "veterans_and_military_families",
        "immigrants_and_refugees",
        "disability_services",
        "mental_health_and_crisis_support",
        "advocacy_and_human_rights",
        "faith_based_services",
        "sports_and_recreation",
        "job_training_and_employment",
        "technology_and_digital_literacy"
    ]
    
    return random.choice(org_categories)
