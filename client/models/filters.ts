import { Availability } from "./user";
import { EventCategory } from "./eventCategories";

export const SCOPE_OPTIONS = ["all", "myOrgs", "admin"] as const;

export type Scope = (typeof SCOPE_OPTIONS)[number];
export interface Filters {
  scope: Scope | null;
  availability: Availability[] | null;
  category?: EventCategory[] | null;
  location?: string | null; // Option A: free-text LIKE search; TODO: Option B — split into city/state columns for structured filtering
}
