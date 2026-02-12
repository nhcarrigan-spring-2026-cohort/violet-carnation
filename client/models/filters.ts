import { EventCategory } from "./eventCategories";
import { Availability } from "./user";

export type Scope = "all" | "myOrgs" | "admin";
export interface Filters {
  scope: Scope | null;
  category: EventCategory | null;
  availability: Availability[] | null;
}
