export const AVAILABILITY_OPTIONS = [
  "Mornings",
  "Afternoons",
  "Evenings",
  "Weekends",
  "Flexible",
] as const;

export type Availability = (typeof AVAILABILITY_OPTIONS)[number];

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  availability: Availability[];
}
