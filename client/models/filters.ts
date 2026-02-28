import { EventCategory } from "./eventCategories";
import { Availability } from "./user";

export const SCOPE_OPTIONS = ["all", "myOrgs", "admin"] as const;

export type Scope = (typeof SCOPE_OPTIONS)[number];

/**
 * Core filtering logic, transformed from UI selections to query params the back-end supports
 */
export interface Filters {
  /**
   * Scope of events to display. "myOrgs" and "admin" scopes are resolved into organization_id filters on the backend based on the user's roles.
   */
  scope?: Scope | null;
  /**
   * Selected availability filters. Interpreted as OR conditions (e.g. "Mornings OR Weekends").
   */
  availability?: Availability[] | null;

  /**
   * Selected event categories. Interpreted as OR conditions (e.g. "Health OR Education").
   */
  categories?: EventCategory[] | null;
}
