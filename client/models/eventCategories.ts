export const EVENT_CATEGORIES = [
  "Animal Welfare",
  "Hunger and Food Security",
  "Homelessness and Housing",
  "Education & Tutoring",
  "Youth and Children",
  "Senior Care and Support",
  "Health & Medical",
  "Environmental Conservation",
  "Community Development",
  "Arts & Culture",
  "Disaster Relief",
  "Veterans & Military Families",
  "Immigrants & Refugees",
  "Disability Services",
  "Mental Health & Crisis Support",
  "Advocacy & Human Rights",
  "Faith-Based Services",
  "Sports & Recreation",
  "Job Training & Employment",
  "Technology & Digital Literacy",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
