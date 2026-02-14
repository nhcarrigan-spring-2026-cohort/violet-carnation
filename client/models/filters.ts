import { EventCategory } from "./eventCategories";
import { Availability } from "./user";

export const SCOPE_OPTIONS = ["all", "myOrgs", "admin"] as const;

export type Scope = (typeof SCOPE_OPTIONS)[number];
export interface Filters {
  scope: Scope | null;
  category: EventCategory | null;
  availability: Availability[] | null;
}
