export const ORGANIZATION_CATEGORIES = [
  { value: "animal_welfare", label: "Animal Welfare" },
  { value: "hunger_and_food_security", label: "Hunger and Food Security" },
  { value: "homelessness_and_housing", label: "Homelessness and Housing" },
  { value: "education_and_tutoring", label: "Education & Tutoring" },
  { value: "youth_and_children", label: "Youth and Children" },
  { value: "senior_care_and_support", label: "Senior Care and Support" },
  { value: "health_and_medical", label: "Health & Medical" },
  { value: "environmental_conservation", label: "Environmental Conservation" },
  { value: "community_development", label: "Community Development" },
  { value: "arts_and_culture", label: "Arts & Culture" },
  { value: "disaster_relief", label: "Disaster Relief" },
  { value: "veterans_and_military_families", label: "Veterans & Military Families" },
  { value: "immigrants_and_refugees", label: "Immigrants & Refugees" },
  { value: "disability_services", label: "Disability Services" },
  {
    value: "mental_health_and_crisis_support",
    label: "Mental Health & Crisis Support",
  },
  { value: "advocacy_and_human_rights", label: "Advocacy & Human Rights" },
  { value: "faith_based_services", label: "Faith-Based Services" },
  { value: "sports_and_recreation", label: "Sports & Recreation" },
  { value: "job_training_and_employment", label: "Job Training & Employment" },
  { value: "technology_and_digital_literacy", label: "Technology & Digital Literacy" },
] as const;

export type OrganizationCategoryValue =
  (typeof ORGANIZATION_CATEGORIES)[number]["value"];

/** Returns the human-readable label for a category value, or the value itself if not found. */
export function getOrganizationCategoryLabel(value: string): string {
  return ORGANIZATION_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
