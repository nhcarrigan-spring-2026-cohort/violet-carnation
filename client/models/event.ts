import { EventCategory } from "./eventCategories";

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  category: EventCategory | null;
  date: string;
  time: string;
  time_zone: string;
  organization_id: number;
  signup_count: number;
  user_signed_up: boolean;
}
