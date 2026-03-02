import { EventCategory } from "./eventCategories";

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
  availability: Availability | null;
  // TODO: backend returns skills as a single string; frontend should split on comma when displaying as tags
  skills: string;
  interests: EventCategory[];
}
